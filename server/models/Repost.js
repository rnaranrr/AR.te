// Modelo: tabela "repost" — republicações de posts
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Repost = database.define('repost', {
    // Chave primária
    repost_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Post republicado
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'repost.post_id',
        references: {
            model: 'post',
            key: 'post_id'
        }
    },
    // Usuário que republicou
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'repost.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'repost',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Repost;
