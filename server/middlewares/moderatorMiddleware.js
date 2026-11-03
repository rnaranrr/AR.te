// Middleware: valida o token de moderador (separado do token de usuário)
import jwt from 'jsonwebtoken';

import { Moderator } from '../models/index.js';
import { getSecretKey } from '../utils/secretKey.js';

// Lê e valida o token do cabeçalho Authorization
// Retorna os dados do token ou lança um erro com a mensagem a ser enviada ao cliente
function readToken(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new Error('Token não fornecido.');
    }

    // Espera o formato: "Bearer <token>"
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        throw new Error('Erro no formato do token.');
    }

    try {
        return jwt.verify(token, getSecretKey());
    } catch {
        throw new Error('Token inválido ou expirado.');
    }
}

// Permite somente moderadores (token com role "moderator" e conta ainda existente)
export default async function moderatorMiddleware(req, res, next) {
    try {
        const decoded = readToken(req);

        if (decoded.role !== 'moderator') {
            return res.status(403).json({ error: 'Acesso restrito a moderadores.' });
        }

        // Confere se a conta de moderador ainda existe (permite revogar o acesso)
        const moderator = await Moderator.findByPk(decoded.moderatorId);
        if (!moderator) {
            return res.status(401).json({ error: 'Conta de moderador não encontrada.' });
        }

        req.moderatorId = moderator.moderator_id;
        return next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}

// Permite usuário comum ou moderador (usado para ver o espaço de moderação)
// Preenche req.userId para usuários e req.moderatorId para moderadores
export function userOrModerator(req, res, next) {
    try {
        const decoded = readToken(req);

        if (decoded.role === 'moderator') {
            req.moderatorId = decoded.moderatorId;
        } else {
            req.userId = decoded.id;
        }

        return next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}
