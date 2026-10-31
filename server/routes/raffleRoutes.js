// Rotas: concursos (raffles) e suas participações
import { Router } from 'express';

import authMiddleware, { optionalAuth } from '../middlewares/authMiddleware.js';
import { database, Raffle, Post } from '../models/index.js';
import { VISIBLE_POST, findPosts, serializePosts } from '../utils/serializePost.js';

// Roteador com as rotas deste arquivo
const router = Router();

// Modelo de dados dos concursos:
// - raffle : título e descrição do concurso
// - post (is_raffle)  : o post que representa o concurso (autor = quem criou), ligado ao raffle por post.raffle_id
// - post (raffle_id)  : participações; são posts comuns com o mesmo raffle_id e is_raffle = false

// POST /raffles
// Corpo da requisição: { raffle_title, raffle_content }
// Cria o concurso E o post que o representa, na mesma transação. Requer login
router.post('/', authMiddleware, async (req, res) => {
    const transaction = await database.transaction();

    try {
        const title = String(req.body.raffle_title ?? '').trim();
        const content = String(req.body.raffle_content ?? '').trim();

        if (!title) {
            await transaction.rollback();
            return res.status(400).json({ error: 'O título do concurso é obrigatório.' });
        }
        if (title.length > 100) {
            await transaction.rollback();
            return res.status(400).json({ error: 'O título do concurso deve ter no máximo 100 caracteres.' });
        }

        const raffle = await Raffle.create({
            raffle_title: title,
            raffle_content: content || null
        }, { transaction });

        const post = await Post.create({
            user_id: req.userId,
            post_title: title,
            post_content: content || null,
            raffle_id: raffle.raffle_id,
            is_raffle: true
        }, { transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Concurso criado com sucesso.',
            raffle_id: raffle.raffle_id,
            post_id: post.post_id
        });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        if (!transaction.finished) await transaction.rollback();

        console.error('Erro ao criar concurso:', error);
        return res.status(500).json({ error: 'Não foi possível criar o concurso.' });
    }
});

// GET /raffles/:id/posts?limit=20&offset=0
// Lista as participações (posts vinculados) de um concurso, da mais recente para a mais antiga
router.get('/:id/posts', optionalAuth, async (req, res) => {
    try {
        const raffleId = Number(req.params.id);
        if (!Number.isInteger(raffleId) || raffleId <= 0) {
            return res.status(400).json({ error: 'Identificador de concurso inválido.' });
        }

        // O concurso precisa existir e seu post não pode estar apagado/banido
        const rafflePost = await Post.findOne({
            where: { raffle_id: raffleId, is_raffle: true, ...VISIBLE_POST }
        });
        if (!rafflePost) {
            return res.status(404).json({ error: 'Concurso não encontrado.' });
        }

        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const posts = await findPosts(
            { raffle_id: raffleId, is_raffle: false, ...VISIBLE_POST },
            { limit, offset }
        );

        return res.json({
            raffle: { raffle_id: raffleId, post_id: rafflePost.post_id },
            posts: await serializePosts(posts, req.userId)
        });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        console.error('Erro ao listar participações do concurso:', error);
        return res.status(500).json({ error: 'Não foi possível carregar as participações.' });
    }
});

// Exporta o roteador para ser registrado no index.js
export default router;
