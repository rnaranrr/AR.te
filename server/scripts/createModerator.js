// Script: cria uma conta de moderador pelo terminal (npm run create-moderator)
import dotenv from 'dotenv';
import readline from 'node:readline/promises';
import { Writable } from 'node:stream';

import { database } from '../models/index.js';
import { createModerator, ModeratorError } from '../utils/moderators.js';

dotenv.config();

// Saída que pode ser silenciada, para não exibir a chave de acesso enquanto ela é digitada
let muted = false;
const output = new Writable({
    write(chunk, encoding, callback) {
        if (!muted) process.stdout.write(chunk, encoding);
        callback();
    }
});

const rl = readline.createInterface({ input: process.stdin, output, terminal: true });

// Pergunta no terminal; com hidden = true o texto digitado não aparece
async function ask(question, hidden = false) {
    process.stdout.write(question);
    muted = hidden;

    const answer = await rl.question('');

    muted = false;
    if (hidden) process.stdout.write('\n');
    return answer;
}

// Pede os dados, cria o moderador e encerra
async function main() {
    // Garante que a tabela existe, mesmo que o servidor ainda não tenha sido iniciado
    await database.authenticate();
    await database.sync({ force: false });

    console.log('Cadastro de moderador\n');

    const idname = await ask('Identificador (3 a 30 caracteres): ');
    const nickname = await ask('Nome exibido: ');
    const username = await ask('Usuário vinculado, sem @ (opcional, Enter para pular): ');
    const accessKey = await ask('Chave de acesso (mínimo 8 caracteres): ', true);
    const confirmation = await ask('Repita a chave de acesso: ', true);

    if (accessKey !== confirmation) {
        throw new ModeratorError('As chaves de acesso não conferem.');
    }

    const moderator = await createModerator({ idname, nickname, accessKey, username });

    console.log(`\nModerador "${moderator.moderator_idname}" criado com sucesso.`);
}

// Erros de validação são mostrados de forma simples; os demais aparecem completos
main()
    .catch((error) => {
        if (error instanceof ModeratorError) {
            console.error(`\nErro: ${error.message}`);
        } else {
            console.error('\nErro inesperado:', error);
        }
        process.exitCode = 1;
    })
    .finally(async () => {
        rl.close();
        await database.close();
    });
