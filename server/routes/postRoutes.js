// Rotas: posts, curtidas, reposts, comentários e denúncias
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { Op } from 'sequelize';

import authMiddleware, { optionalAuth } from '../middlewares/authMiddleware.js';
import {
    database,
    Post,
    PostMedia,
    Tag,
    User,
    Postlike,
    Comment,
    Commlike,
    Repost,
    Reports,
    Follow
} from '../models/index.js';
import { releaseReportOpinions } from '../utils/opinions.js';
import {
    VISIBLE_POST,
    findPosts,
    serializePost,
    serializePosts,
    postInclude
} from '../utils/serializePost.js';

// Roteador com as rotas deste arquivo
const router = Router();

// Pasta onde as mídias dos posts são salvas
const uploadDirectory = path.resolve('uploads/posts');

// Formatos de mídia aceitos
const allowedTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4'
]);

// Configuração do multer: até 4 arquivos de 20 MB cada
const upload = multer({
    storage: multer.diskStorage({
        destination: async (req, file, callback) => {
            try {
                await mkdir(uploadDirectory, { recursive: true });
                callback(null, uploadDirectory);
            } catch (error) {
                // Falha inesperada: registra no console e responde com erro
                callback(error);
            }
        },
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(
                null,
                `${Date.now()}-${crypto.randomUUID()}${extension}`
            );
        }
    }),
    limits: {
        files: 4,
        fileSize: 20 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (!allowedTypes.has(file.mimetype)) {
            return callback(
                new Error('Formato de mídia não permitido.')
            );
        }

        callback(null, true);
    }
});

// Converte e valida um ID vindo da URL. Retorna null se for inválido
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Dados públicos do autor de um comentário
const AUTHOR_ATTRS = ['user_id', 'user_nickname', 'user_idname', 'user_pfpurl'];

// Monta o comentário no formato esperado pelo front
async function serializeComment(comment, author, viewerId = null) {
    const [likesCount, myLike] = await Promise.all([
        Commlike.count({ where: { comment_id: comment.comment_id } }),
        viewerId
            ? Commlike.findOne({
                where: { comment_id: comment.comment_id, user_id: viewerId }
            })
            : null
    ]);

    return {
        comment_id: comment.comment_id,
        comment_content: comment.comment_content,
        createdAt: comment.created_at,
        author: author
            ? {
                user_id: author.user_id,
                name: author.user_nickname,
                username: author.user_idname,
                avatar_url: author.user_pfpurl
            }
            : null,
        likesCount,
        likedByMe: Boolean(myLike)
    };
}

// GET /posts
// Feed de publicações (paginado)
// ?feed=following  -> só posts de quem o usuário logado segue
// ?limit=20&offset=0
router.get('/', optionalAuth, async (req, res) => {
    try {
        // Paginação: tamanho da página (máximo 50) e deslocamento
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const where = { ...VISIBLE_POST };

        // Aba "Seguindo": exige login e filtra pelos autores seguidos
        if (req.query.feed === 'following') {
            if (!req.userId) {
                return res.status(401).json({
                    error: 'Faça login para ver as publicações de quem você segue.'
                });
            }

            const follows = await Follow.findAll({
                where: { follower_id: req.userId },
                attributes: ['following_id']
            });

            where.user_id = { [Op.in]: follows.map((f) => f.following_id) };
        }

        const posts = await findPosts(where, { limit, offset });

        return res.json({ posts: await serializePosts(posts, req.userId) });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao listar publicações:', error);
        return res.status(500).json({
            error: 'Não foi possível carregar as publicações.'
        });
    }
});

// GET /posts/:id
// Publicação individual
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const postId = parseId(req.params.id);

        if (!postId) {
            return res.status(400).json({
                error: 'Identificador de publicação inválido.'
            });
        }

        const post = await Post.findOne({
            where: { post_id: postId, ...VISIBLE_POST },
            include: postInclude
        });

        if (!post) {
            return res.status(404).json({
                error: 'Publicação não encontrada.'
            });
        }

        return res.json({ post: await serializePost(post, req.userId) });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao buscar publicação:', error);
        return res.status(500).json({
            error: 'Não foi possível carregar a publicação.'
        });
    }
});

// POST /posts
// Criar publicação
router.post(
    '/',
    authMiddleware,
    upload.array('media', 4),
    async (req, res) => {
        const transaction = await database.transaction();

        try {
            const { title, content, tags, is_nsfw } = req.body;

            if (!title?.trim()) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'O título é obrigatório.'
                });
            }

            if (title.trim().length > 100) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'O título deve ter no máximo 100 caracteres.'
                });
            }

            // Participação em concurso (opcional): o concurso precisa existir e estar visível
            let raffleId = null;

            if (req.body.raffle_id) {
                raffleId = parseId(req.body.raffle_id);

                const rafflePost = raffleId
                    ? await Post.findOne({
                        where: { raffle_id: raffleId, is_raffle: true, ...VISIBLE_POST },
                        transaction
                    })
                    : null;

                if (!rafflePost) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'Concurso não encontrado.' });
                }
            }

            const user = await User.findByPk(req.userId, {
                transaction
            });

            if (!user) {
                await transaction.rollback();
                return res.status(401).json({
                    error: 'Usuário não encontrado.'
                });
            }

            const post = await Post.create({
                user_id: req.userId,
                post_title: title.trim(),
                post_content: content?.trim() || null,
                is_nsfw: is_nsfw === 'true',
                // raffle_id preenchido + is_raffle falso = participação no concurso
                raffle_id: raffleId,
                is_raffle: false
            }, { transaction });

            // Salva cada mídia enviada (imagem ou vídeo)
            for (const file of req.files ?? []) {
                const mediaType = file.mimetype.startsWith('video/')
                    ? 'video'
                    : 'image';

                await PostMedia.create({
                    post_id: post.post_id,
                    media_type: mediaType,
                    media_url: `/uploads/posts/${file.filename}`
                }, { transaction });
            }

            // O formulário orienta separar por ";" e o servidor aceita "," também
            const tagNames = [
                ...new Set(
                    (tags || '')
                        .split(/[;,]/)
                        .map((tag) => tag.trim().replace(/^#/, ''))
                        .filter(Boolean)
                        .map((tag) => tag.toLowerCase())
                )
            ];

            // Cria as tags que ainda não existem e vincula todas ao post
            for (const tagName of tagNames) {
                const [tag] = await Tag.findOrCreate({
                    where: { tag_name: tagName },
                    defaults: { tag_name: tagName },
                    transaction
                });

                await post.addTag(tag, { transaction });
            }

            await transaction.commit();

            return res.status(201).json({
                message: 'Publicação criada com sucesso.',
                post_id: post.post_id
            });
        } catch (error) {
            // Falha inesperada: registra no console e responde com erro
            if (!transaction.finished) {
                await transaction.rollback();
            }

            console.error('Erro ao criar publicação:', error);

            return res.status(500).json({
                error: 'Não foi possível criar a publicação.'
            });
        }
    }
);

// Fábrica de rotas "liga/desliga" (like e repost têm o mesmo comportamento)
// Se o registro já existe, remove; se não existe, cria. Devolve o novo estado e a contagem
function toggleHandler(Model, flagName, countName) {
    return async (req, res) => {
        try {
            const postId = parseId(req.params.id);
            if (!postId) {
                return res.status(400).json({ error: 'Identificador de publicação inválido.' });
            }

            const post = await Post.findOne({
                where: { post_id: postId, ...VISIBLE_POST }
            });
            if (!post) {
                return res.status(404).json({ error: 'Publicação não encontrada.' });
            }

            const where = { post_id: postId, user_id: req.userId };
            const existing = await Model.findOne({ where });

            if (existing) {
                await existing.destroy();
            } else {
                await Model.create(where);
            }

            const count = await Model.count({ where: { post_id: postId } });

            return res.json({ [flagName]: !existing, [countName]: count });
        } catch (error) {
            // Falha inesperada: registra no console e responde com erro
            console.error('Erro ao alternar interação:', error);
            return res.status(500).json({ error: 'Não foi possível registrar a interação.' });
        }
    };
}

// POST /posts/:id/like
// Curtir / descurtir
router.post('/:id/like', authMiddleware, toggleHandler(Postlike, 'liked', 'likesCount'));

// POST /posts/:id/repost
// Republicar / desfazer
router.post('/:id/repost', authMiddleware, toggleHandler(Repost, 'reposted', 'repostsCount'));

// GET /posts/:id/comments
// Lista os comentários do post
router.get('/:id/comments', optionalAuth, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }

        // Comentários de posts removidos ou banidos não são exibidos
        const visiblePost = await Post.findOne({ where: { post_id: postId, ...VISIBLE_POST } });
        if (!visiblePost) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        const comments = await Comment.findAll({
            where: { post_id: postId, deleted_at: null },
            include: [{ model: User, as: 'author', attributes: AUTHOR_ATTRS }],
            order: [['created_at', 'DESC']]
        });

        const result = await Promise.all(
            comments.map((comment) =>
                serializeComment(comment, comment.author, req.userId)
            )
        );

        return res.json({ comments: result });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao listar comentários:', error);
        return res.status(500).json({ error: 'Não foi possível carregar os comentários.' });
    }
});

// POST /posts/:id/comments
// Cria um comentário (body: { content })
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        const content = String(req.body.content ?? '').trim();

        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }
        if (!content) {
            return res.status(400).json({ error: 'O comentário não pode ficar vazio.' });
        }
        if (content.length > 1000) {
            return res.status(400).json({ error: 'O comentário deve ter no máximo 1000 caracteres.' });
        }

        const post = await Post.findOne({ where: { post_id: postId, ...VISIBLE_POST } });
        if (!post) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        const author = await User.findByPk(req.userId, { attributes: AUTHOR_ATTRS });
        const comment = await Comment.create({
            post_id: postId,
            user_id: req.userId,
            comment_content: content
        });

        return res.status(201).json({
            comment: await serializeComment(comment, author, req.userId)
        });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao comentar:', error);
        return res.status(500).json({ error: 'Não foi possível publicar o comentário.' });
    }
});

// POST /posts/comments/:commentId/like
// Curtir / descurtir comentário
router.post('/comments/:commentId/like', authMiddleware, async (req, res) => {
    try {
        const commentId = parseId(req.params.commentId);
        if (!commentId) {
            return res.status(400).json({ error: 'Identificador de comentário inválido.' });
        }

        const comment = await Comment.findOne({
            where: { comment_id: commentId, deleted_at: null }
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comentário não encontrado.' });
        }

        const where = { comment_id: commentId, user_id: req.userId };
        const existing = await Commlike.findOne({ where });

        if (existing) {
            await existing.destroy();
        } else {
            await Commlike.create(where);
        }

        const likesCount = await Commlike.count({ where: { comment_id: commentId } });

        return res.json({ liked: !existing, likesCount });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao curtir comentário:', error);
        return res.status(500).json({ error: 'Não foi possível registrar a curtida.' });
    }
});

// Busca um post para as rotas de denúncia: ele precisa existir e não pode ter sido removido pelo autor
// Posts banidos continuam acessíveis aqui, pois a moderação os mantém na lista
async function findReportablePost(postId) {
    const post = await Post.findOne({ where: { post_id: postId } });

    if (!post || (post.deleted_at && post.post_analysis_status !== 'banned')) return null;
    return post;
}

// POST /posts/:id/report
// Denuncia o post: a denúncia é o voto da comunidade
// A primeira denúncia coloca o post automaticamente em "in_analysis" (tag "Em Análise")
router.post('/:id/report', authMiddleware, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }

        const post = await findReportablePost(postId);
        if (!post) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        // Posts banidos já têm uma decisão da moderação
        if (post.post_analysis_status === 'banned') {
            return res.status(409).json({ error: 'Este post já foi banido pela moderação.' });
        }

        // Um usuário só pode denunciar o mesmo post uma vez
        const alreadyReported = await Reports.findOne({
            where: { post_id: postId, user_id: req.userId }
        });
        if (alreadyReported) {
            return res.status(409).json({ error: 'Você já denunciou esta publicação.' });
        }

        await Reports.create({ post_id: postId, user_id: req.userId });

        // Só muda o status se ainda estiver no padrão (não sobrescreve decisão de moderador)
        if (post.post_analysis_status === 'default') {
            await post.update({ post_analysis_status: 'in_analysis' });
        }

        return res.status(201).json({
            message: 'Denúncia registrada.',
            reported: true,
            reportCount: await Reports.count({ where: { post_id: postId } }),
            post_analysis_status: post.post_analysis_status
        });
    } catch (error) {
        // Duas denúncias simultâneas: a chave única do banco barra a segunda
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Você já denunciou esta publicação.' });
        }

        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao denunciar publicação:', error);
        return res.status(500).json({ error: 'Não foi possível registrar a denúncia.' });
    }
});

// DELETE /posts/:id/report
// Remove a denúncia do usuário logado (pode ser feito a qualquer momento)
// Sem nenhuma denúncia restante, um post que estava apenas "in_analysis" volta ao padrão
router.delete('/:id/report', authMiddleware, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }

        const post = await findReportablePost(postId);
        if (!post) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        // Apaga somente a denúncia do próprio usuário
        // As opiniões ligadas a ela passam para outra denúncia do post (ou são apagadas se não houver outra)
        const transaction = await database.transaction();

        try {
            const myReport = await Reports.findOne({
                where: { post_id: postId, user_id: req.userId },
                transaction
            });

            if (!myReport) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Você não denunciou esta publicação.' });
            }

            await releaseReportOpinions(myReport, transaction);
            await myReport.destroy({ transaction });
            await transaction.commit();
        } catch (innerError) {
            if (!transaction.finished) await transaction.rollback();
            throw innerError;
        }

        const reportCount = await Reports.count({ where: { post_id: postId } });

        // Decisões de moderadores (banido ou restaurado) não são alteradas
        if (reportCount === 0 && post.post_analysis_status === 'in_analysis') {
            await post.update({ post_analysis_status: 'default' });
        }

        return res.json({
            message: 'Denúncia removida.',
            reported: false,
            reportCount,
            post_analysis_status: post.post_analysis_status
        });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao remover denúncia:', error);
        return res.status(500).json({ error: 'Não foi possível remover a denúncia.' });
    }
});

// DELETE /posts/:id
// Remove o post do autor com exclusão lógica: preenche deleted_at e o post some da plataforma, sem sair do banco
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }

        const post = await Post.findOne({ where: { post_id: postId, ...VISIBLE_POST } });
        if (!post) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        // Somente o autor pode remover o próprio post
        if (post.user_id !== req.userId) {
            return res.status(403).json({ error: 'Você só pode excluir os seus próprios posts.' });
        }

        await post.update({ deleted_at: new Date() });

        return res.json({ message: 'Publicação excluída.' });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao excluir publicação:', error);
        return res.status(500).json({ error: 'Não foi possível excluir a publicação.' });
    }
});

// Exporta o roteador para ser registrado no index.js
export default router;
