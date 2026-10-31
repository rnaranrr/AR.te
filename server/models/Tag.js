// Modelo: tabela "tag" — hashtags usadas nos posts
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Tag = database.define('tag', {
    // Chave primária
    tag_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Nome da tag (sem #)
    tag_name: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'tag',
    timestamps: false
});

// Exporta o modelo
export default Tag;
