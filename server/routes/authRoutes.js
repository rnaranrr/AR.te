// Rotas: cadastro e login de usuários
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Roteador com as rotas deste arquivo
const router = Router();

// POST /auth/register
// Cadastra um novo usuário
router.post('/register', async (req, res) => {
    try {
        // Dados enviados pelo formulário de cadastro
        const { name, username, email, password } = req.body;

        // Todos os campos são obrigatórios
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

        // Cadastro concluído
        return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
    } catch (error) {
        // Falha inesperada: registra no console e responde com erro
        return res.status(500).json({ error: 'Erro interno no servidor ao registrar.' });
    }
});

// POST /auth/login
// Autentica o usuário e devolve um token
router.post('/login', async (req, res) => {
    try {
        // Dados enviados pelo formulário de login
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

        // Devolve o token e os dados públicos do usuário
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
        // Falha inesperada: registra no console e responde com erro
        return res.status(500).json({ error: 'Erro interno no servidor ao realizar login.' });
    }
});

// Exporta o roteador para ser registrado no index.js
export default router;
