import { Router } from 'express';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

// Importa as models
import { User, Follow } from '../models/index.js';

// Middlewares
import authMiddleware, { optionalAuth } from '../middlewares/authMiddleware.js';
import uploadProfile from '../middlewares/uploadProfile.js';

// Serialização padrão dos posts (mesmo formato do feed)
import { VISIBLE_POST, findPosts, serializePosts } from '../utils/serializePost.js';

const router = Router();

// Apaga do disco um arquivo antigo de /uploads/profiles (ignora se já não existir)
async function removeOldFile(previousUrl) {
    if (!previousUrl?.startsWith('/uploads/profiles/')) return;

    const filePath = path.resolve('uploads/profiles', path.basename(previousUrl));

    await unlink(filePath).catch((error) => {
        if (error.code !== 'ENOENT') {
            console.error('Não foi possível apagar o arquivo anterior:', error);
        }
    });
}

// Monta o JSON de perfil (usado tanto em /me quanto em /:username)
async function buildProfile(user, viewerId, { includePrivate = false } = {}) {
    // Contagem de seguidores e de quem o usuário segue
    const [followersCount, followingCount] = await Promise.all([
        Follow.count({ where: { following_id: user.user_id } }),
        Follow.count({ where: { follower_id: user.user_id } })
    ]);

    // Posts do usuário (sem apagados/banidos), já no formato do front.
    // O autor é o próprio dono do perfil (author override), então não precisa de include.
    const posts = await findPosts({ user_id: user.user_id, ...VISIBLE_POST });
    const serializedPosts = await serializePosts(posts, viewerId, user);

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

        posts: serializedPosts
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
            if (avatarFile) await removeOldFile(previous.avatar);
            if (bannerFile) await removeOldFile(previous.banner);
            if (commissionsBannerFile) await removeOldFile(previous.commissionsBanner);
            if (commissionsImageFile) await removeOldFile(previous.commissionsImage);

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
            console.error('Erro ao atualizar perfil:', error);
            return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
        }
    }
);

// POST /users/:username/follow
// Alterna seguir / deixar de seguir. Retorna { following, followersCount }.
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
        console.error('Erro ao seguir usuário:', error);
        return res.status(500).json({ error: 'Não foi possível atualizar o seguimento.' });
    }
});

// GET /users/:username
// Busca os dados públicos de um usuário pelo username.
// Não exige autenticação (mas, se houver token, informa se o visitante já segue o perfil).
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
        console.error('Erro ao buscar perfil público:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
    }
});

export default router;
