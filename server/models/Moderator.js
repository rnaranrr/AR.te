// Modelo: tabela "moderator" — contas de moderação
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Moderator = database.define('moderator', {
    // Chave primária
    moderator_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Identificador (usuário) do moderador
    moderator_idname: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    // Nome exibido do moderador
    moderator_nickname: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    // Perfil de usuário vinculado (opcional)
    moderator_userprofile: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Chave de acesso criptografada
    moderator_acesskey_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'moderator',
    timestamps: false
});

// Exporta o modelo
export default Moderator;
