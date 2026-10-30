import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// banco
import { database } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import modRoutes from './routes/modRoutes.js';
import raffleRoutes from './routes/raffleRoutes.js';

dotenv.config();

const app = express();

//
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Caminho da pasta server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disponibiliza as imagens em /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registro das rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/chat', chatRoutes);
app.use('/search', searchRoutes);
app.use('/mod', modRoutes);
app.use('/raffles', raffleRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'API rodando' });
});

// Tratamento de erros (multer: formato inválido, arquivo grande demais, etc.)
// Precisa vir DEPOIS das rotas. Responde em JSON com a chave "error", como o restante da API.
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    // Erros do multer (tamanho, quantidade de arquivos) e do fileFilter são erros do cliente
    const isUploadError = err?.name === 'MulterError' || /Formato/.test(err?.message ?? '');
    const status = isUploadError ? 400 : 500;

    if (status === 500) console.error('Erro não tratado:', err);

    res.status(status).json({
        error: isUploadError ? err.message : 'Erro interno no servidor.'
    });
});

// Autenticar no banco de dados e sincronizar as tabelas
async function startServer() {
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
