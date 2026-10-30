import { Router } from 'express';

import authMiddleware from '../middlewares/authMiddleware.js';
import { Raffle } from '../models/index.js';

const router = Router();

// POST /raffles   body: { raffle_title, raffle_content }
// Cria um concurso. Requer login.
router.post('/', authMiddleware, async (req, res) => {
    try {
        const title = String(req.body.raffle_title ?? '').trim();
        const content = String(req.body.raffle_content ?? '').trim();

        if (!title) {
            return res.status(400).json({ error: 'O título do concurso é obrigatório.' });
        }
        if (title.length > 100) {
            return res.status(400).json({ error: 'O título do concurso deve ter no máximo 100 caracteres.' });
        }

        const raffle = await Raffle.create({
            raffle_title: title,
            raffle_content: content || null
        });

        return res.status(201).json({
            message: 'Concurso criado com sucesso.',
            raffle_id: raffle.raffle_id
        });
    } catch (error) {
        console.error('Erro ao criar concurso:', error);
        return res.status(500).json({ error: 'Não foi possível criar o concurso.' });
    }
});

export default router;
