// MUDAR MSGs DE ERROS E COISADASD DPS

import { Router } from 'express';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

// Importa as models
import {
    User,
    Follow,
    Post,
    PostMedia,
    Tag,
    Postlike,
    Comment,
    Repost
} from '../models/index.js';

// importa a rota de autenticação
import authMiddleware from '../middlewares/authMiddleware.js';
import uploadProfile from '../middlewares/uploadProfile.js';

const router = Router();

// GET /users/me
// Retorna o perfil do usuário logado
router.get('/me', authMiddleware, async (req, res) => {

    // pega as informações do usuário através do ID
    try {
        const user = await User.findByPk(req.userId, {
            attributes: {
                exclude: ['user_passwd_hash']
            }
        });

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        //contagem de seguidores
        const followersCount = await Follow.count({
            where: {
                following_id: user.user_id
            }
        });

        // contagem de seguindo
        const followingCount = await Follow.count({
            where: {
                follower_id: user.user_id
            }
        });

        // posts do usuário
        const posts = await Post.findAll({
            where: {
                user_id: user.user_id,
                deleted_at: null
            },
            include: [
                {
                    model: PostMedia,
                    as: 'media'
                },
                {
                    model: Tag,
                    as: 'tags',
                    through: {
                        attributes: []
                    }
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // contagem de likes comentários e reposts
        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const likesCount = await Postlike.count({
                    where: {
                        post_id: post.post_id
                    }
                });

                const commentsCount = await Comment.count({
                    where: {
                        post_id: post.post_id,
                        deleted_at: null
                    }
                });

                const repostsCount = await Repost.count({
                    where: {
                        post_id: post.post_id
                    }
                });

                return {
                    ...post.toJSON(),
                    likesCount,
                    commentsCount,
                    repostsCount
                };
            })
        );

        // retorna dados
        return res.json({
            id: user.user_id,
            nickname: user.user_nickname,
            username: user.user_idname,
            email: user.user_email,
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

            posts: postsWithCounts
        });

    } catch (error) {
        console.error('Erro ao buscar perfil:', error);

        return res.status(500).json({
            error: 'Erro interno ao buscar perfil.'
        });
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
                return res.status(404).json({
                    error: 'Usuário não encontrado.'
                });
            }

            const {
                nickname,
                username,
                bio,
                pronouns,
                avatar_url,
                banner_url,
                artist_type,
                commissions_open,
                commissions_banner_url,
                commissions_image_url
            } = req.body;

            // Verifica se o username foi alterado
            if (username && username !== user.user_idname) {
                const usernameExists = await User.findOne({
                    where: {
                        user_idname: username
                    }
                });

                if (usernameExists) {
                    return res.status(400).json({
                        error: 'Nome de usuário já está em uso.'
                    });
                }
            }

            const avatarFile = req.files?.avatar?.[0];
            const bannerFile = req.files?.banner?.[0];
            const commissionsBannerFile = req.files?.commissions_banner?.[0];
            const commissionsImageFile = req.files?.commissions_image?.[0];

            // Guarda o nome e localização do arquivo anterior, e define bannerUrl com o novo arquivo
            const previousBannerUrl = user.user_bannerurl;
            const bannerUrl = bannerFile
                ? `/uploads/profiles/${bannerFile.filename}`
                : previousBannerUrl;

            // Guarda o nome e localização do arquivo anterior, e define avatarUrl com o novo arquivo
            const previousAvatarUrl = user.user_pfpurl;
            const avatarUrl = avatarFile
                ? `/uploads/profiles/${avatarFile.filename}`
                : previousAvatarUrl;
            const previousCommissionsBannerUrl = user.user_commtab_bannerurl;
            const commissionsBannerUrl = commissionsBannerFile
                ? `/uploads/profiles/${commissionsBannerFile.filename}`
                : previousCommissionsBannerUrl;
            const previousCommissionsImageUrl = user.user_commtab_imgurl;
            const commissionsImageUrl = commissionsImageFile
                ? `/uploads/profiles/${commissionsImageFile.filename}`
                : previousCommissionsImageUrl;

            // Atualiza os dados
            // operador ?? considera se o valor for null ou indefinido e mantem o valor antigo se for o caso
            await user.update({
                user_nickname: req.body.nickname ?? user.user_nickname,
                user_idname: req.body.username ?? user.user_idname,
                user_bio: req.body.bio ?? user.user_bio,
                user_pronouns: req.body.pronouns ?? user.user_pronouns,
                user_pfpurl: avatarUrl,
                user_bannerurl: bannerUrl,
                user_artist_type: artist_type,
                user_commtab_bannerurl: commissionsBannerUrl,
                user_commtab_imgurl: commissionsImageUrl,
                user_commissions_open: commissions_open === undefined
                    ? user.user_commissions_open
                    : commissions_open === true || commissions_open === 'true'
            });

            // Dá unlink no arquivo anterior do banner
            if (bannerFile && previousBannerUrl?.startsWith('/uploads/profiles/')) {
                const oldBannerPath = path.resolve(
                    'uploads/profiles',
                    path.basename(previousBannerUrl)
                );

                await unlink(oldBannerPath).catch((error) => {
                    if (error.code !== 'ENOENT') {
                        console.error('Não foi possível apagar o banner anterior:', error);
                    }
                });
            }

            // Dá unlink no arquivo anterior do avatar
            if (avatarFile && previousAvatarUrl?.startsWith('/uploads/profiles/')) {
                const oldAvatarPath = path.resolve(
                    'uploads/profiles',
                    path.basename(previousAvatarUrl)
                );

                await unlink(oldAvatarPath).catch((error) => {
                    if (error.code !== 'ENOENT') {
                        console.error('Não foi possível apagar o avatar anterior:', error);
                    }
                });
            }

            if (
                commissionsBannerFile &&
                previousCommissionsBannerUrl?.startsWith('/uploads/profiles/')
            ) {
                const oldCommissionsBannerPath = path.resolve(
                    'uploads/profiles',
                    path.basename(previousCommissionsBannerUrl)
                );

                await unlink(oldCommissionsBannerPath).catch((error) => {
                    if (error.code !== 'ENOENT') {
                        console.error('Não foi possível apagar o banner de comissões anterior:', error);
                    }
                });
            }

            if (
                commissionsImageFile &&
                previousCommissionsImageUrl?.startsWith('/uploads/profiles/')
            ) {
                const oldCommissionsImagePath = path.resolve(
                    'uploads/profiles',
                    path.basename(previousCommissionsImageUrl)
                );

                await unlink(oldCommissionsImagePath).catch((error) => {
                    if (error.code !== 'ENOENT') {
                        console.error('Não foi possível apagar a imagem de comissões anterior:', error);
                    }
                });
            }

            return res.json({
                message: 'Perfil atualizado com sucesso.',
                avatar_url: avatarUrl,
                banner_url: bannerUrl,
                commissions_banner_url: commissionsBannerUrl,
                commissions_image_url: commissionsImageUrl
            });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);

            return res.status(500).json({
                error: 'Erro interno ao atualizar perfil.'
            });
        }
    });

// GET /users/:username
// Busca os dados públicos de um usuário pelo username.
// Não exige autenticação.

router.get('/:username', async (req, res) => {
    try {
        // Remove o @ inicial caso o username tenha sido enviado com ele
        const username = req.params.username.replace(/^@/, '');

        // Busca apenas os dados públicos do usuário
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
            // Retorna erro caso o username não corresponda a nenhum usuário
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        // Conta os seguidores do usuário
        const followersCount = await Follow.count({
            where: { following_id: user.user_id }
        });

        // Conta quantos usuários ele segue
        const followingCount = await Follow.count({
            where: { follower_id: user.user_id }
        });

        // Busca os posts não excluídos, incluindo mídias e tags
        const posts = await Post.findAll({
            where: {
                user_id: user.user_id,
                deleted_at: null
            },
            include: [
                {
                    model: PostMedia,
                    as: 'media'
                },
                {
                    model: Tag,
                    as: 'tags',
                    through: { attributes: [] }
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Adiciona a contagem de likes, comentários e reposts a cada post
        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const [likesCount, commentsCount, repostsCount] =
                    await Promise.all([
                        Postlike.count({
                            where: { post_id: post.post_id }
                        }),
                        Comment.count({
                            where: {
                                post_id: post.post_id,
                                deleted_at: null
                            }
                        }),
                        Repost.count({
                            where: { post_id: post.post_id }
                        })
                    ]);

                return {
                    ...post.toJSON(),
                    likesCount,
                    commentsCount,
                    repostsCount
                };
            })
        );

        // Retorna os dados públicos do perfil e seus posts
        return res.json({
            id: user.user_id,
            nickname: user.user_nickname,
            username: user.user_idname,
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
            posts: postsWithCounts
        });
    } catch (error) {
        // Registra o erro e informa que não foi possível buscar o perfil
        console.error('Erro ao buscar perfil público:', error);

        return res.status(500).json({
            error: 'Erro interno ao buscar perfil.'
        });
    }
});

export default router;