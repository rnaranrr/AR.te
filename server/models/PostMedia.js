// Modelo: tabela "post_media" — mídias (imagens, GIFs e vídeos) dos posts
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const PostMedia = database.define('post_media', {
    // Chave primária
    media_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Post dono da mídia
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'media.post_id',
        references: {
            model: 'post',
            key: 'post_id'
        }
    },
    // Tipo da mídia: image ou video
    media_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    // Caminho do arquivo em /uploads
    media_url: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'post_media',
    timestamps: false
});

// Exporta o modelo
export default PostMedia;
