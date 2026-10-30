import { Router } from 'express';
import { Op } from 'sequelize';

import { optionalAuth } from '../middlewares/authMiddleware.js';
import { User } from '../models/index.js';
import {
    VISIBLE_POST,
    findPosts,
    serializePosts,
    postIdsByTagName
} from '../utils/serializePost.js';

const router = Router();

// GET /search?q=texto
//   "texto"  -> busca usuários (nome / @username) e posts (título / conteúdo / tags)
//   "#tag"   -> busca somente posts com essa tag
router.get('/', optionalAuth, async (req, res) => {
    try {
        const raw = String(req.query.q ?? '').trim();
        const isTagSearch = raw.startsWith('#');
        const term = raw.replace(/^[@#]/, '');

        // Evita buscas muito curtas (retornariam quase tudo)
        if (term.length < 2) {
            return res.json({ users: [], posts: [] });
        }

        // Escapa os curingas do LIKE para tratar o texto digitado literalmente
        const like = `%${term.replace(/[%_\\]/g, '\\$&')}%`;

        // Usuários (não buscados em pesquisas por #tag)
        const users = isTagSearch
            ? []
            : await User.findAll({
                where: {
                    [Op.or]: [
                        { user_idname: { [Op.like]: like } },
                        { user_nickname: { [Op.like]: like } }
                    ]
                },
                attributes: ['user_id', 'user_idname', 'user_nickname', 'user_pfpurl', 'user_artist_type'],
                limit: 20
            });

        // Posts: por tag e, se não for pesquisa de #tag, também por título/conteúdo
        const taggedIds = await postIdsByTagName(like);
        const conditions = [{ post_id: { [Op.in]: taggedIds } }];

        if (!isTagSearch) {
            conditions.push(
                { post_title: { [Op.like]: like } },
                { post_content: { [Op.like]: like } }
            );
        }

        const posts = await findPosts(
            { ...VISIBLE_POST, [Op.or]: conditions },
            { limit: 30 }
        );

        return res.json({
            users: users.map((u) => ({
                user_id: u.user_id,
                name: u.user_nickname,
                username: u.user_idname,
                avatar_url: u.user_pfpurl,
                artist_type: u.user_artist_type
            })),
            posts: await serializePosts(posts, req.userId)
        });
    } catch (error) {
        console.error('Erro na pesquisa:', error);
        return res.status(500).json({ error: 'Não foi possível realizar a pesquisa.' });
    }
});

export default router;
