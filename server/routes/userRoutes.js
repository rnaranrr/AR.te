// MUDAR MSGs DE ERROS E COISADASD DPS

import { Router } from 'express';

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
router.put('/me', authMiddleware, async (req, res) => {
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

        // operador ?? considera se o valor for null ou indefinido e mantem o valor antigo se for o caso
        await user.update({
            user_nickname: nickname ?? user.user_nickname,
            user_idname: username ?? user.user_idname,
            user_bio: bio ?? user.user_bio,
            user_pronouns: pronouns ?? user.user_pronouns,
            user_pfpurl: avatar_url ?? user.user_pfpurl,
            user_bannerurl: banner_url ?? user.user_bannerurl,
            user_artist_type: artist_type ?? user.user_artist_type,
            user_commissions_open:
                commissions_open ?? user.user_commissions_open,
            user_commtab_bannerurl:
                commissions_banner_url ?? user.user_commtab_bannerurl,
            user_commtab_imgurl:
                commissions_image_url ?? user.user_commtab_imgurl
        });

        return res.json({
            message: 'Perfil atualizado com sucesso.'
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);

        return res.status(500).json({
            error: 'Erro interno ao atualizar perfil.'
        });
    }
});

export default router;