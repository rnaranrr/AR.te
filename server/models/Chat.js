// Modelo: tabela "direct_message" — mensagens diretas entre usuários
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const DirectMessage = database.define('chat', {
    // Chave primária (id da mensagem)
    chat: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Remetente
    chat_send_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Destinatário
    chat_receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Texto da mensagem
    chat_message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // Data e hora do envio
    chat_data: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'direct_message',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default DirectMessage;
