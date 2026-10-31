// Modelo: tabela "follow" — relação de seguir entre usuários
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Follow = database.define('follow', {
    // Chave primária
    follow_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Usuário que segue
    follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Usuário que é seguido
    following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'user_id'
        }
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'follow',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Follow;
