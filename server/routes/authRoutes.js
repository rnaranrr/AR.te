import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const router = Router();

// POST /auth/register - Cadastro de Usuário
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
        }

        // Verifica existência de e-mail ou username
        const userExists = await User.findOne({
            where: { user_email: email }
        });
        const usernameExists = await User.findOne({
            where: { user_idname: username }
        });

        if (userExists || usernameExists) {
            return res.status(400).json({ error: 'E-mail ou nome de usuário já em uso.' });
        }

        // Criptografia da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criação no banco de dados
        await User.create({
            user_nickname: name,
            user_idname: username,
            user_email: email,
            user_passwd_hash: hashedPassword
        });

        return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor ao registrar.' });
    }
});

// POST /auth/login - Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se existe usuário com esse email
        const user = await User.findOne({ where: { user_email: email } });
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        // Valida a senha
        const isMatch = await bcrypt.compare(password, user.user_passwd_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        // Geração do token
        const token = jwt.sign(
            { id: user.user_id },
            process.env.SECRET_KEY || 'chave_secreta_padrao',
            { expiresIn: '7d' }
        );

        return res.json({
            token,
            user: {
                id: user.user_id,
                name: user.user_nickname,
                username: user.user_idname,
                email: user.user_email,
                avatar_url: user.user_pfpurl
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor ao realizar login.' });
    }
});

export default router;