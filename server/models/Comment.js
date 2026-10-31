// Modelo: tabela "comment" — comentários nos posts
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Comment = database.define('comment', {
    // Chave primária
    comment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Post comentado
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'comment.post_id',
        references: {
            model: 'post',
            key: 'post_id'
        }
    },
    // Autor do comentário
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'comment.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Texto do comentário
    comment_content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
        deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'comment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Comment;
