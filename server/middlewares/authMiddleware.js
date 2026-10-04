import jwt from 'jsonwebtoken';

// Middleware responsável por validar o token JWT enviado no header
export default function authMiddleware(req, res, next) {
    // Obtém o valor do header
    const authHeader = req.headers.authorization;

    // Se o token não foi enviado, retorna erro 401.
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    // Espera o formato: "Bearer <token>".
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Erro no formato do token.' });
    }

    // Extrai somente o token da string.
    const token = parts[1];

    try {
        // Verifica a assinatura e validade do token usando a chave secreta configurada.
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Armazena o identificador do usuário na requisição para uso nos próximos middlewares/rotas.
        req.userId = decoded.id;
        return next();
    } catch (err) {
        // Qualquer falha na validação do token resulta em resposta 401.
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}