// Rotas: espaço de moderação (login de moderador, cadastro de moderadores, posts denunciados e status)
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

import authMiddleware from '../middlewares/authMiddleware.js';
import moderatorMiddleware, { userOrModerator } from '../middlewares/moderatorMiddleware.js';
import { Moderator, Opinion, Post, Reports, User } from '../models/index.js';
import { findPosts, serializePost } from '../utils/serializePost.js';
import { createModerator, ModeratorError, toModeratorData } from '../utils/moderators.js';
import { getSecretKey } from '../utils/secretKey.js';

// Roteador com as rotas deste arquivo
const router = Router();

// Status que o moderador pode atribuir a um post
const MODERATOR_STATUSES = ['in_analysis', 'banned', 'restored'];

// Posts que aparecem no espaço de moderação: em análise, restaurados ou banidos
// Os banidos têm deleted_at preenchido, mas continuam visíveis aqui; os removidos pelo autor ficam de fora
const IN_MODERATION = {
    post_analysis_status: { [Op.in]: MODERATOR_STATUSES },
    [Op.or]: [{ deleted_at: null }, { post_analysis_status: 'banned' }]
};

// Colunas públicas do autor de uma opinião
const AUTHOR_ATTRS = ['user_id', 'user_nickname', 'user_idname', 'user_pfpurl'];

// Converte e valida um ID vindo da URL (retorna null se for inválido)
function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// Monta a opinião no formato esperado pelo front
function serializeOpinion(opinion, author, viewerId = null) {
    return {
        opinion_id: opinion.opinion_id,
        opinion_content: opinion.opinion_content,
        createdAt: opinion.created_at,
        author: author
            ? {
                user_id: author.user_id,
                name: author.user_nickname,
                username: author.user_idname,
                avatar_url: author.user_pfpurl
            }
            : null,
        // A opinião é do usuário logado (ele pode removê-la)
        mine: Boolean(viewerId) && opinion.user_id === viewerId
    };
}

// POST /mod/login
// Login de moderador
// Corpo da requisição: { idname, access_key }
router.post('/login', async (req, res) => {
    try {
        const idname = String(req.body.idname ?? '').trim();
        const accessKey = String(req.body.access_key ?? '');

        if (!idname || !accessKey) {
            return res.status(400).json({ error: 'Informe o identificador e a chave de acesso.' });
        }

        // Busca o moderador (com o usuário vinculado, para devolver o @username)
        const moderator = await Moderator.findOne({
            where: { moderator_idname: idname },
            include: [{ model: User, as: 'user', attributes: ['user_idname'] }]
        });

        // A mesma resposta vale para identificador inexistente e chave errada
        const isMatch = moderator
            ? await bcrypt.compare(accessKey, moderator.moderator_acesskey_hash)
            : false;
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        // Token separado do de usuário: o campo role identifica o moderador
        const token = jwt.sign(
            { moderatorId: moderator.moderator_id, role: 'moderator' },
            getSecretKey(),
            { expiresIn: '8h' }
        );

        return res.json({ token, moderator: toModeratorData(moderator) });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro no login de moderador:', error);
        return res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
});

// POST /mod/moderators
// Cadastra um novo moderador (somente moderadores)
// Corpo da requisição: { idname, nickname, access_key, username? }
router.post('/moderators', moderatorMiddleware, async (req, res) => {
    try {
        const moderator = await createModerator({
            idname: req.body.idname,
            nickname: req.body.nickname,
            accessKey: req.body.access_key,
            username: req.body.username
        });

        return res.status(201).json({ moderator: toModeratorData(moderator) });
    } catch (error) {
        // Erros de validação têm o código HTTP definido pelo utilitário
        if (error instanceof ModeratorError) {
            return res.status(error.status).json({ error: error.message });
        }

        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao cadastrar moderador:', error);
        return res.status(500).json({ error: 'Não foi possível cadastrar o moderador.' });
    }
});

// GET /mod/posts
// Lista os posts denunciados, do mais denunciado para o menos denunciado
// Leitura liberada para usuários logados (a denúncia é o voto da comunidade) e para moderadores
router.get('/posts', userOrModerator, async (req, res) => {
    try {
        // Posts em moderação (ver IN_MODERATION)
        const posts = await findPosts({ ...IN_MODERATION });

        const result = await Promise.all(
            posts.map(async (post) => ({
                ...(await serializePost(post, req.userId ?? null)),
                ReportCount: await Reports.count({ where: { post_id: post.post_id } })
            }))
        );

        // Mais denunciados primeiro (empates mantêm a ordem do mais recente)
        result.sort((a, b) => b.ReportCount - a.ReportCount);

        return res.json({ posts: result });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao listar posts denunciados:', error);
        return res.status(500).json({ error: 'Não foi possível carregar os posts denunciados.' });
    }
});

// GET /mod/posts/:id
// Dados de um post em moderação (com o número de denúncias) e as opiniões da comunidade sobre ele
// Leitura liberada para usuários logados e moderadores
router.get('/posts/:id', userOrModerator, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }

        const [post] = await findPosts({ ...IN_MODERATION, post_id: postId });
        if (!post) {
            return res.status(404).json({ error: 'Este post não está em moderação.' });
        }

        // As opiniões ficam ligadas às denúncias do post
        const reports = await Reports.findAll({ where: { post_id: postId }, attributes: ['report_id'] });

        const opinions = reports.length > 0
            ? await Opinion.findAll({
                where: { report_id: { [Op.in]: reports.map((report) => report.report_id) } },
                include: [{ model: User, as: 'author', attributes: AUTHOR_ATTRS }],
                order: [['created_at', 'DESC'], ['opinion_id', 'DESC']]
            })
            : [];

        return res.json({
            post: {
                ...(await serializePost(post, req.userId ?? null)),
                ReportCount: reports.length
            },
            opinions: opinions.map((opinion) => serializeOpinion(opinion, opinion.author, req.userId ?? null))
        });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao carregar post em moderação:', error);
        return res.status(500).json({ error: 'Não foi possível carregar o post em moderação.' });
    }
});

// POST /mod/posts/:id/opinions
// Publica uma opinião sobre um post em moderação (somente usuários logados)
// Corpo da requisição: { content }
router.post('/posts/:id/opinions', authMiddleware, async (req, res) => {
    try {
        const postId = parseId(req.params.id);
        const content = String(req.body.content ?? '').trim();

        if (!postId) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }
        if (!content) {
            return res.status(400).json({ error: 'A opinião não pode ficar vazia.' });
        }
        if (content.length > 1000) {
            return res.status(400).json({ error: 'A opinião deve ter no máximo 1000 caracteres.' });
        }

        const post = await Post.findOne({ where: { ...IN_MODERATION, post_id: postId } });
        if (!post) {
            return res.status(404).json({ error: 'Este post não está em moderação.' });
        }

        // A opinião fica ligada à primeira denúncia do post (coluna opinion.report_id)
        const firstReport = await Reports.findOne({
            where: { post_id: postId },
            order: [['report_id', 'ASC']]
        });
        if (!firstReport) {
            return res.status(409).json({ error: 'Este post ainda não possui denúncias para receber opiniões.' });
        }

        const author = await User.findByPk(req.userId, { attributes: AUTHOR_ATTRS });
        const opinion = await Opinion.create({
            user_id: req.userId,
            report_id: firstReport.report_id,
            opinion_content: content
        });

        return res.status(201).json({ opinion: serializeOpinion(opinion, author, req.userId) });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao publicar opinião:', error);
        return res.status(500).json({ error: 'Não foi possível publicar a opinião.' });
    }
});

// DELETE /mod/opinions/:opinionId
// Remove uma opinião (somente o autor dela)
router.delete('/opinions/:opinionId', authMiddleware, async (req, res) => {
    try {
        const opinionId = parseId(req.params.opinionId);
        if (!opinionId) {
            return res.status(400).json({ error: 'Identificador de opinião inválido.' });
        }

        const opinion = await Opinion.findByPk(opinionId);
        if (!opinion) {
            return res.status(404).json({ error: 'Opinião não encontrada.' });
        }

        if (opinion.user_id !== req.userId) {
            return res.status(403).json({ error: 'Você só pode remover as suas próprias opiniões.' });
        }

        await opinion.destroy();

        return res.json({ message: 'Opinião removida.' });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao remover opinião:', error);
        return res.status(500).json({ error: 'Não foi possível remover a opinião.' });
    }
});

// PUT /mod/posts/:id/status
// Altera o status de moderação de um post (somente moderadores)
// Corpo da requisição: { status } — in_analysis, banned ou restored
router.put('/posts/:id/status', moderatorMiddleware, async (req, res) => {
    try {
        const postId = Number(req.params.id);
        const status = req.body.status;

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({ error: 'Identificador de publicação inválido.' });
        }
        if (!MODERATOR_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Status inválido.' });
        }

        // Posts removidos pelo autor não podem ser alterados (os banidos podem, para serem restaurados)
        const post = await Post.findOne({ where: { post_id: postId } });
        if (!post || (post.deleted_at && post.post_analysis_status !== 'banned')) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        if (status === 'banned') {
            // Banir é uma exclusão lógica: o post some da plataforma, mas continua no banco
            await post.update({
                post_analysis_status: 'banned',
                deleted_at: post.deleted_at ?? new Date()
            });
        } else {
            // Em análise ou restaurado: o post volta a ser exibido
            await post.update({ post_analysis_status: status, deleted_at: null });
        }

        return res.json({ post_analysis_status: post.post_analysis_status });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao alterar status do post:', error);
        return res.status(500).json({ error: 'Não foi possível alterar o status do post.' });
    }
});

// Exporta o roteador para ser registrado no index.js
export default router;
