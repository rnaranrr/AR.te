// Modelo: tabela "reports" — denúncias de posts
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Report = database.define('reports', {
    // Chave primária
    report_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Post denunciado
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'report.post_id',
        references: {
            model: 'post',
            key: 'post_id'
        }
    },
    // Quem denunciou. A rota impede que o mesmo usuário denuncie o mesmo post duas vezes
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'report.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Report;
