// Configuração: conexão com o MySQL usando Sequelize
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Cria a conexão com o banco
const sequelize = new Sequelize(
    // Nome do banco, usuário, senha e host vêm do arquivo .env
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);
// Exporta a conexão para os modelos
export default sequelize;
