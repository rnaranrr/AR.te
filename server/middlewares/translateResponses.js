// Middleware: traduz as mensagens da API para o idioma enviado pelo front-end (cabeçalho Accept-Language)
import { EN } from '../utils/messagesEn.js';

// Campos das respostas JSON que carregam texto para o usuário
const TEXT_FIELDS = ['error', 'message'];

// Se o front pediu inglês, troca as mensagens em português pela tradução; os demais casos não mudam
export default function translateResponses(req, res, next) {
    const language = String(req.headers['accept-language'] ?? '').toLowerCase();

    if (!language.startsWith('en')) return next();

    // Substitui res.json por uma versão que traduz antes de enviar
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        // Arrays e valores simples seguem sem alteração; só objetos com os campos de texto são traduzidos
        if (body && typeof body === 'object' && !Array.isArray(body)) {
            const translated = { ...body };

            for (const field of TEXT_FIELDS) {
                if (typeof translated[field] === 'string' && EN[translated[field]]) {
                    translated[field] = EN[translated[field]];
                }
            }

            return originalJson(translated);
        }

        return originalJson(body);
    };

    return next();
}
