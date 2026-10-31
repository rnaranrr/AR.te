// Rotas: perfil do usuário, edição, exclusão de conta e seguidores
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

// Importa as models
import { User, Follow, Repost } from '../models/index.js';

// Middlewares
import authMiddleware, { optionalAuth } from '../middlewares/authMiddleware.js';
import uploadProfile from '../middlewares/uploadProfile.js';

// Serialização padrão dos posts (mesmo formato do feed)
import { VISIBLE_POST, findPosts, serializePost, serializePosts } from '../utils/serializePost.js';
import { deleteUserAccount } from '../utils/deleteAccount.js';
import { removeUploadedFile } from '../utils/uploads.js';

// Roteador com as rotas deste arquivo
const router = Router();

// Quantidade máxima de reposts exibidos na timeline do perfil
const MAX_REPOSTS = 50;

// Monta o JSON de perfil (usado tanto em /me quanto em /:username)
async function buildProfile(user, viewerId, { includePrivate = false } = {}) {
    // Contagem de seguidores e de quem o usuário segue
    const [followersCount, followingCount] = await Promise.all([
        Follow.count({ where: { following_id: user.user_id } }),
        Follow.count({ where: { follower_id: user.user_id } })
    ]);

    // Posts do usuário (sem apagados/banidos), já no formato do front
    // O autor é o próprio dono do perfil (author override), então não precisa de include
    const posts = await findPosts({ user_id: user.user_id, ...VISIBLE_POST });
    const serializedPosts = await serializePosts(posts, viewerId, user);

    // Reposts do usuário (somente de posts ainda visíveis), do mais recente para o mais antigo
    const repostRows = await Repost.findAll({
        where: { user_id: user.user_id },
        order: [['created_at', 'DESC'], ['repost_id', 'DESC']],
        limit: MAX_REPOSTS
    });

    const repostedPosts = repostRows.length > 0
        ? await findPosts({
            post_id: { [Op.in]: repostRows.map((row) => row.post_id) },
            ...VISIBLE_POST
        })
        : [];
    const repostedById = new Map(repostedPosts.map((post) => [post.post_id, post]));

    const reposts = (
        await Promise.all(
            repostRows.map(async (row) => {
                const post = repostedById.get(row.post_id);
                if (!post) return null;

                return {
                    repostedAt: row.created_at,
                    post: await serializePost(post, viewerId)
                };
            })
        )
    ).filter(Boolean);

    // O visitante já segue esse perfil?
    const isFollowing = viewerId && viewerId !== user.user_id
        ? Boolean(
            await Follow.findOne({
                where: { follower_id: viewerId, following_id: user.user_id }
            })
        )
        : false;

    return {
        id: user.user_id,
        nickname: user.user_nickname,
        username: user.user_idname,
        // O e-mail só é enviado ao próprio dono
        ...(includePrivate ? { email: user.user_email } : {}),
        bio: user.user_bio,
        pronouns: user.user_pronouns,
        avatar_url: user.user_pfpurl,
        banner_url: user.user_bannerurl,
        artist_type: user.user_artist_type,
        commissions_open: user.user_commissions_open,
        commissions_banner_url: user.user_commtab_bannerurl,
        commissions_image_url: user.user_commtab_imgurl,

        followersCount,
        followingCount,
        isFollowing,

        posts: serializedPosts,
        reposts
    };
}

// GET /users/me
// Retorna o perfil do usuário logado
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['user_passwd_hash'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.json(
            await buildProfile(user, req.userId, { includePrivate: true })
        );
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
    }
});

// PUT /users/me
// Atualiza o perfil do usuário logado
router.put(
    '/me',
    authMiddleware,
    uploadProfile.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
        { name: 'commissions_banner', maxCount: 1 },
        { name: 'commissions_image', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const {
                nickname,
                username,
                bio,
                pronouns,
                artist_type,
                commissions_open
            } = req.body;

            // Verifica se o username foi alterado e se já está em uso
            if (username && username !== user.user_idname) {
                const usernameExists = await User.findOne({
                    where: { user_idname: username }
                });

                if (usernameExists) {
                    return res.status(400).json({ error: 'Nome de usuário já está em uso.' });
                }
            }

            // Arquivos enviados (cada campo pode ou não ter vindo)
            const avatarFile = req.files?.avatar?.[0];
            const bannerFile = req.files?.banner?.[0];
            const commissionsBannerFile = req.files?.commissions_banner?.[0];
            const commissionsImageFile = req.files?.commissions_image?.[0];

            // URLs anteriores (para apagar do disco depois) e novas URLs
            const previous = {
                avatar: user.user_pfpurl,
                banner: user.user_bannerurl,
                commissionsBanner: user.user_commtab_bannerurl,
                commissionsImage: user.user_commtab_imgurl
            };

            const avatarUrl = avatarFile
                ? `/uploads/profiles/${avatarFile.filename}`
                : previous.avatar;
            const bannerUrl = bannerFile
                ? `/uploads/profiles/${bannerFile.filename}`
                : previous.banner;
            const commissionsBannerUrl = commissionsBannerFile
                ? `/uploads/profiles/${commissionsBannerFile.filename}`
                : previous.commissionsBanner;
            const commissionsImageUrl = commissionsImageFile
                ? `/uploads/profiles/${commissionsImageFile.filename}`
                : previous.commissionsImage;

            // Atualiza os dados
            // operador ?? mantém o valor antigo quando o campo não foi enviado
            // (importante: o formulário de comissões não envia nickname/artist_type etc.)
            await user.update({
                user_nickname: nickname ?? user.user_nickname,
                user_idname: username ?? user.user_idname,
                user_bio: bio ?? user.user_bio,
                user_pronouns: pronouns ?? user.user_pronouns,
                user_artist_type: artist_type ?? user.user_artist_type,
                user_pfpurl: avatarUrl,
                user_bannerurl: bannerUrl,
                user_commtab_bannerurl: commissionsBannerUrl,
                user_commtab_imgurl: commissionsImageUrl,
                user_commissions_open: commissions_open === undefined
                    ? user.user_commissions_open
                    : commissions_open === true || commissions_open === 'true'
            });

            // Apaga do disco os arquivos que foram substituídos
            if (avatarFile) await removeUploadedFile(previous.avatar);
            if (bannerFile) await removeUploadedFile(previous.banner);
            if (commissionsBannerFile) await removeUploadedFile(previous.commissionsBanner);
            if (commissionsImageFile) await removeUploadedFile(previous.commissionsImage);

            return res.json({
                message: 'Perfil atualizado com sucesso.',
                nickname: user.user_nickname,
                username: user.user_idname,
                avatar_url: avatarUrl,
                banner_url: bannerUrl,
                commissions_banner_url: commissionsBannerUrl,
                commissions_image_url: commissionsImageUrl
            });
        } catch (error) {
            // Falha inesperada: registra no console e responde com erro
            console.error('Erro ao atualizar perfil:', error);
            return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
        }
    }
);

// DELETE /users/me
// Exclui a conta do usuário logado e todas as produções dele. Exige a senha como confirmação
router.delete('/me', authMiddleware, async (req, res) => {
    try {
        const password = String(req.body?.password ?? '');

        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Confere a senha antes de apagar qualquer coisa
        const isMatch = await bcrypt.compare(password, user.user_passwd_hash);
        if (!isMatch) {
            return res.status(403).json({ error: 'Senha incorreta.' });
        }

        // Apaga os dados do banco e, depois, os arquivos do disco
        const fileUrls = await deleteUserAccount(req.userId);
        await Promise.all((fileUrls ?? []).map(removeUploadedFile));

        return res.json({ message: 'Conta excluída com sucesso.' });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao excluir conta:', error);
        return res.status(500).json({ error: 'Não foi possível excluir a conta.' });
    }
});

// POST /users/:username/follow
// Alterna seguir / deixar de seguir. Retorna { following, followersCount }
router.post('/:username/follow', authMiddleware, async (req, res) => {
    try {
        const username = req.params.username.replace(/^@/, '');

        const target = await User.findOne({ where: { user_idname: username } });
        if (!target) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (target.user_id === req.userId) {
            return res.status(400).json({ error: 'Você não pode seguir a si mesmo.' });
        }

        const where = { follower_id: req.userId, following_id: target.user_id };
        const existing = await Follow.findOne({ where });

        if (existing) {
            await existing.destroy();
        } else {
            await Follow.create(where);
        }

        const followersCount = await Follow.count({
            where: { following_id: target.user_id }
        });

        return res.json({ following: !existing, followersCount });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao seguir usuário:', error);
        return res.status(500).json({ error: 'Não foi possível atualizar o seguimento.' });
    }
});

// GET /users/:username
// Busca os dados públicos de um usuário pelo username
// Não exige autenticação (mas, se houver token, informa se o visitante já segue o perfil)
router.get('/:username', optionalAuth, async (req, res) => {
    try {
        // Remove o @ inicial caso o username tenha sido enviado com ele
        const username = req.params.username.replace(/^@/, '');

        const user = await User.findOne({
            where: { user_idname: username },
            attributes: [
                'user_id',
                'user_idname',
                'user_nickname',
                'user_bio',
                'user_pronouns',
                'user_pfpurl',
                'user_bannerurl',
                'user_artist_type',
                'user_commissions_open',
                'user_commtab_bannerurl',
                'user_commtab_imgurl'
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.json(await buildProfile(user, req.userId));
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao buscar perfil público:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
    }
});

// Exporta o roteador para ser registrado no index.js
export default router;
