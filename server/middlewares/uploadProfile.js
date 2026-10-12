// Importa o middleware multer para processar uploads de arquivos.
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Define a pasta onde as imagens de perfil serão armazenadas.
const uploadDir = path.resolve('uploads/profiles');

// Garante que a pasta de upload exista antes de salvar qualquer arquivo.
fs.mkdirSync(uploadDir, { recursive: true });

// Configura o armazenamento no disco para os arquivos enviados.
const storage = multer.diskStorage({
    // Define o diretório de destino para cada arquivo enviado.
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },

    // Define o nome do arquivo salvo no servidor.
    filename: (_req, file, callback) => {
        // Obtém a extensão do arquivo original em minúsculas.
        const extension = path.extname(file.originalname).toLowerCase();
        // Cria um nome único usando UUID e mantém a extensão original.
        const filename = `${crypto.randomUUID()}${extension}`;

        callback(null, filename);
    }
});

// Cria o middleware de upload configurado para imagens de perfil.
const uploadProfile = multer({
    storage,

    // Limita o tamanho máximo do arquivo para 5 MB.
    limits: {
        fileSize: 5 * 1024 * 1024
    },

    // Valida o tipo de arquivo permitido antes de aceitar o upload.
    fileFilter: (_req, file, callback) => {
        // Lista de tipos MIME permitidos para imagens.
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        // Se o tipo da imagem não estiver na lista, rejeita o upload.
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error('Formato inválido. Envie JPG, PNG, WEBP ou GIF.')
            );
        }

        // Aceita o arquivo quando o tipo for válido.
        callback(null, true);
    }
});

// Exporta o middleware para ser usado em rotas que recebem upload de foto de perfil.
export default uploadProfile;