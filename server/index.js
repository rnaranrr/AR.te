// Servidor: ponto de entrada da API (Express + MySQL)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Conexão com o banco
import { database } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import modRoutes from './routes/modRoutes.js';
import translateResponses from './middlewares/translateResponses.js';
import { assertSecretKey } from './utils/secretKey.js';
import raffleRoutes from './routes/raffleRoutes.js';

// Carrega as variáveis do arquivo .env
dotenv.config();

// Aplicação Express
const app = express();

// Utilitários para descobrir a pasta do servidor
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Caminho da pasta do servidor
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pede a rastreadores de IA que não usem o conteúdo (imagens incluídas) para treinar modelos
// Vale para a API e para /uploads, onde ficam as artes publicadas
app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noai, noimageai');
    next();
});

// robots.txt da API: nenhum rastreador deve acessar a API nem as imagens enviadas
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').sendFile(path.join(__dirname, 'robots.txt'));
});

// Disponibiliza os arquivos enviados em /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Porta do servidor (definida no .env)
const PORT = process.env.PORT || 3000;

// Middlewares globais: CORS e leitura de JSON e de formulários
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Traduz as mensagens da API para o idioma do front-end (inglês quando Accept-Language começa com "en")
app.use(translateResponses);

// Registro das rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/chat', chatRoutes);
app.use('/search', searchRoutes);
app.use('/mod', modRoutes);
app.use('/raffles', raffleRoutes);

// Rota de teste (confirma que a API está no ar)
app.get('/', (req, res) => {
    res.json({ message: 'API rodando' });
});

// Tratamento de erros (multer: formato inválido, arquivo grande demais, etc.)
// Precisa vir DEPOIS das rotas. Responde em JSON com a chave "error", como o restante da API
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    // JSON malformado no corpo da requisição
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Corpo da requisição inválido.' });
    }

    // Erros do multer (tamanho, quantidade de arquivos) viram mensagens da API, que podem ser traduzidas
    if (err?.name === 'MulterError') {
        const messages = {
            LIMIT_FILE_SIZE: 'Arquivo muito grande.',
            LIMIT_FILE_COUNT: 'Quantidade de arquivos acima do limite.'
        };

        return res.status(400).json({ error: messages[err.code] ?? 'Envio de arquivo inválido.' });
    }

    // Formato de arquivo recusado pelo fileFilter (a mensagem já está em português)
    if (/Formato/.test(err?.message ?? '')) {
        return res.status(400).json({ error: err.message });
    }

    // Falha inesperada: registra no console e responde com erro 500
    console.error('Erro não tratado:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
});

// Conecta ao banco, sincroniza as tabelas e inicia o servidor
async function startServer() {
    // Sem uma SECRET_KEY válida os logins não funcionam: o servidor não inicia
    try {
        assertSecretKey();
    } catch (error) {
        console.error(`\n${error.message}\n`);
        process.exit(1);
    }

    try {
        // 1. Testa a conexão com o banco MySQL
        await database.authenticate();
        console.log('Conexão com o banco MySQL estabelecida com sucesso.');

        // 2. Cria/sincroniza todas as tabelas e relacionamentos
        await database.sync({ force: false });
        console.log('Todas as tabelas foram criadas/sincronizadas com sucesso!');

        // 3. Inicia o servidor HTTP

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Backend disponível na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
    }
}

startServer();
