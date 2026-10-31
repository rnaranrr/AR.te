// Modelo: tabela "commlike" — curtidas em comentários
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Commlike = database.define('commlike', {
    // Chave primária
    commlike_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Comentário curtido
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'commlike.comment_id',
        references: {
            model: 'comment',
            key: 'comment_id'
        }
    },
    // Usuário que curtiu
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'commlike.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'commlike',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Commlike;
