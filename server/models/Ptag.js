// Modelo: tabela "ptag" — relação entre posts e tags
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Ptag = database.define('ptag', {
    // Chave primária
    ptag_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Post marcado
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ptag.post_id',
        references: {
            model: 'post',
            key: 'post_id'
        }
    },
    // Tag aplicada ao post
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ptag.tag_id',
        references: {
            model: 'tag',
            key: 'tag_id'
        }
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'ptag',
    timestamps: false
});

// Exporta o modelo
export default Ptag;
