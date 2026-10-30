import { Router } from 'express';
import { Op } from 'sequelize';

import authMiddleware from '../middlewares/authMiddleware.js';
import { Reports } from '../models/index.js';
import { findPosts, serializePost } from '../utils/serializePost.js';

const router = Router();

// GET /mod/posts
// Lista os posts denunciados (em análise, restaurados ou banidos) com o número de denúncias.
// Leitura liberada para qualquer usuário logado (espaço de moderação colaborativa).
router.get('/posts', authMiddleware, async (req, res) => {
    try {
        const posts = await findPosts({
            deleted_at: null,
            post_status: { [Op.in]: ['in_analysis', 'restored', 'banned'] }
        });

        const result = await Promise.all(
            posts.map(async (post) => ({
                ...(await serializePost(post, req.userId)),
                ReportCount: await Reports.count({ where: { post_id: post.post_id } })
            }))
        );

        // Mais denunciados primeiro
        result.sort((a, b) => b.ReportCount - a.ReportCount);

        return res.json({ posts: result });
    } catch (error) {
        console.error('Erro ao listar posts denunciados:', error);
        return res.status(500).json({ error: 'Não foi possível carregar os posts denunciados.' });
    }
});

export default router;
