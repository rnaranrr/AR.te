// Modelo: tabela "user" — cadastro e perfil dos usuários
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const User = database.define('user', {
    // Chave primária
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Nome de usuário único (@username)
    user_idname: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    // Apelido exibido no perfil
    user_nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    // E-mail usado no login
    user_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    // Senha criptografada (bcrypt)
    user_passwd_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    // Biografia
    user_bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Pronomes
    user_pronouns: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    // Foto de perfil
    user_pfpurl: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    // Banner do perfil
    user_bannerurl: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    // Identificação de artista (ex.: pintor)
    user_artist_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    // Indica se as comissões estão abertas
    user_commissions_open: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    // Banner da aba de comissões
    user_commtab_bannerurl: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    // Imagem da tabela de preços das comissões
    user_commtab_imgurl: {
        type: DataTypes.STRING(500),
        allowNull: true,
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Exporta o modelo
export default User;
