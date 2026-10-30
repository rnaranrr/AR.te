import { Router } from 'express';
import { Op } from 'sequelize';

import authMiddleware from '../middlewares/authMiddleware.js';
import { Chat, User } from '../models/index.js';

const router = Router();

const USER_ATTRS = ['user_id', 'user_nickname', 'user_idname', 'user_pfpurl'];

// Formato público de um usuário usado pelo front
const toContact = (user) => ({
    user_id: user.user_id,
    name: user.user_nickname,
    username: user.user_idname,
    avatar_url: user.user_pfpurl
});

// GET /chat
// Lista as conversas do usuário logado: uma entrada por contato, com a última mensagem.
router.get('/', authMiddleware, async (req, res) => {
    try {
        const me = req.userId;

        const messages = await Chat.findAll({
            where: {
                [Op.or]: [{ chat_send_id: me }, { chat_receiver_id: me }]
            },
            include: [
                { model: User, as: 'sender', attributes: USER_ATTRS },
                { model: User, as: 'receiver', attributes: USER_ATTRS }
            ],
            order: [['created_at', 'DESC'], ['chat', 'DESC']]
        });

        // As mensagens vêm da mais nova para a mais antiga:
        // a primeira que aparece para cada contato é a última da conversa.
        const conversations = new Map();

        for (const message of messages) {
            const other = message.chat_send_id === me ? message.receiver : message.sender;
            if (!other || conversations.has(other.user_id)) continue;

            conversations.set(other.user_id, {
                chat: message.chat,
                chat_message: message.chat_message,
                chat_data: message.created_at,
                contact: toContact(other)
            });
        }

        return res.json({ conversations: [...conversations.values()] });
    } catch (error) {
        console.error('Erro ao listar conversas:', error);
        return res.status(500).json({ error: 'Não foi possível carregar as conversas.' });
    }
});

// GET /chat/:username
// Histórico de mensagens entre o usuário logado e :username (ordem cronológica).
router.get('/:username', authMiddleware, async (req, res) => {
    try {
        const me = req.userId;
        const username = req.params.username.replace(/^@/, '');

        const contact = await User.findOne({
            where: { user_idname: username },
            attributes: USER_ATTRS
        });

        if (!contact) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const messages = await Chat.findAll({
            where: {
                [Op.or]: [
                    { chat_send_id: me, chat_receiver_id: contact.user_id },
                    { chat_send_id: contact.user_id, chat_receiver_id: me }
                ]
            },
            order: [['created_at', 'ASC'], ['chat', 'ASC']],
            limit: 500
        });

        return res.json({
            contact: toContact(contact),
            messages: messages.map((m) => ({
                chat: m.chat,
                chat_send_id: m.chat_send_id,
                chat_receiver_id: m.chat_receiver_id,
                chat_message: m.chat_message,
                createdAt: m.created_at
            }))
        });
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        return res.status(500).json({ error: 'Não foi possível carregar as mensagens.' });
    }
});

// POST /chat/:username   body: { message }
// Envia uma mensagem direta para :username.
router.post('/:username', authMiddleware, async (req, res) => {
    try {
        const me = req.userId;
        const username = req.params.username.replace(/^@/, '');
        const text = String(req.body.message ?? '').trim();

        if (!text) {
            return res.status(400).json({ error: 'A mensagem não pode ficar vazia.' });
        }
        if (text.length > 2000) {
            return res.status(400).json({ error: 'A mensagem deve ter no máximo 2000 caracteres.' });
        }

        const contact = await User.findOne({ where: { user_idname: username } });
        if (!contact) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (contact.user_id === me) {
            return res.status(400).json({ error: 'Você não pode enviar mensagem para si mesmo.' });
        }

        const message = await Chat.create({
            chat_send_id: me,
            chat_receiver_id: contact.user_id,
            chat_message: text,
            chat_data: new Date()
        });

        return res.status(201).json({
            message: {
                chat: message.chat,
                chat_send_id: message.chat_send_id,
                chat_receiver_id: message.chat_receiver_id,
                chat_message: message.chat_message,
                createdAt: message.created_at
            }
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return res.status(500).json({ error: 'Não foi possível enviar a mensagem.' });
    }
});

export default router;
