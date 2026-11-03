// Utilitário: criação e formatação de contas de moderador (usado pela rota e pelo script de terminal)
import bcrypt from 'bcryptjs';

import { Moderator, User } from '../models/index.js';

// Erro de validação com o código HTTP que a rota deve responder
export class ModeratorError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

// Formato público do moderador (nunca inclui a chave de acesso)
// O moderador deve ser carregado com o include do usuário vinculado (as: 'user')
export function toModeratorData(moderator) {
    return {
        id: moderator.moderator_id,
        idname: moderator.moderator_idname,
        nickname: moderator.moderator_nickname,
        userprofile: moderator.user?.user_idname ?? null
    };
}

// Valida os dados, criptografa a chave de acesso e cria o moderador
// username (opcional) vincula a conta de moderador a um usuário comum
export async function createModerator({ idname, nickname, accessKey, username }) {
    idname = String(idname ?? '').trim();
    nickname = String(nickname ?? '').trim();
    accessKey = String(accessKey ?? '');
    username = String(username ?? '').trim().replace(/^@/, '');

    // Regras dos campos
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(idname)) {
        throw new ModeratorError('O identificador deve ter de 3 a 30 caracteres (letras, números, _ . -).');
    }
    if (!nickname || nickname.length > 50) {
        throw new ModeratorError('O nome exibido é obrigatório e deve ter no máximo 50 caracteres.');
    }
    if (accessKey.length < 8 || accessKey.length > 100) {
        throw new ModeratorError('A chave de acesso deve ter de 8 a 100 caracteres.');
    }

    // O identificador precisa ser único
    const idnameInUse = await Moderator.findOne({ where: { moderator_idname: idname } });
    if (idnameInUse) {
        throw new ModeratorError('Este identificador já está em uso.', 409);
    }

    // Vínculo opcional com um usuário comum (um usuário só pode estar em uma conta de moderador)
    let user = null;
    if (username) {
        user = await User.findOne({ where: { user_idname: username } });
        if (!user) {
            throw new ModeratorError('Usuário vinculado não encontrado.', 404);
        }

        const alreadyLinked = await Moderator.findOne({
            where: { moderator_userprofile: user.user_id }
        });
        if (alreadyLinked) {
            throw new ModeratorError('Este usuário já está vinculado a outro moderador.', 409);
        }
    }

    // A chave de acesso é guardada criptografada, como a senha dos usuários
    const salt = await bcrypt.genSalt(10);
    const accessKeyHash = await bcrypt.hash(accessKey, salt);

    const moderator = await Moderator.create({
        moderator_idname: idname,
        moderator_nickname: nickname,
        moderator_userprofile: user ? user.user_id : null,
        moderator_acesskey_hash: accessKeyHash
    });

    // Anexa o usuário carregado para o formato público
    moderator.user = user;
    return moderator;
}
