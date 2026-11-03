// Modelo: tabela "post" — publicações (posts) dos usuários
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Post = database.define('post', {
    // Chave primária
    post_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Autor do post
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'post.user_id',
        references: {
            model: 'user',
            key: 'user_id'
        }
    },
    // Título
    post_title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Texto da publicação
    post_content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Concurso (raffle) ao qual o post está vinculado: participação ou o próprio concurso
    raffle_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'post.raffle_id',
        references: {
            model: 'raffle',
            key: 'raffle_id'
        }
    },
    // True = este post É o concurso (criado pelo formulário "Concurso")
    // Posts com raffle_id preenchido e is_raffle = false são participações naquele concurso
    is_raffle: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'post.is_raffle'
    },
    // Status de moderação: default, in_analysis, restored ou banned
    post_analysis_status: {
        type: DataTypes.ENUM('default', 'in_analysis', 'restored', 'banned'),
        defaultValue: 'default',
        allowNull: false
    },
    // Conteúdo sensível
    is_nsfw: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'post.is_nsfw' // Mapeamento correto para o nome literal do banco
    },
    // Exclusão lógica (soft delete): preenchido quando o post é apagado
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'post',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default Post;
