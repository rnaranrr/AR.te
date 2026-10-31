// Utilitário: remove do disco imagens e mídias que não são mais usadas
import { unlink } from 'node:fs/promises';
import path from 'node:path';

// Apaga um arquivo de /uploads/profiles ou /uploads/posts a partir da URL salva no banco
// Ignora URLs externas e arquivos que já não existem
export async function removeUploadedFile(url) {
    const match = /^\/uploads\/(profiles|posts)\//.exec(url ?? '');
    if (!match) return;

    // Basename evita que a URL aponte para fora da pasta de uploads
    const filePath = path.resolve('uploads', match[1], path.basename(url));

    await unlink(filePath).catch((error) => {
        if (error.code !== 'ENOENT') {
            console.error('Não foi possível apagar o arquivo:', error);
        }
    });
}
