// Modelo: tabela "postlike" — curtidas em posts
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Postlike = database.define('postlike', {
    // Chave primária
    postlike_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Post curtido
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'postlike.post_id',
        references: {
            model: 'post',
            key: 'post_id'
        }
    },
    // Usuário que curtiu
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'postlike.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'postlike',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Postlike;
