// Modelo: tabela "opinion" — opiniões dos usuários sobre posts denunciados
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Opinion = database.define('opinion', {
    // Chave primária
    opinion_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Usuário que escreveu a opinião
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'opinion.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Denúncia comentada
    report_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'opinion.report_id',
        references: {
            model: 'reports',
            key: 'report_id'
        }
    },
    // Texto da opinião
    opinion_content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'opinion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Opinion;
