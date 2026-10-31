// Modelo: tabela "raffle" — dados dos concursos (raffles)
import { DataTypes } from 'sequelize';
// Conexão com o banco
import database from '../config/database.js';

// Define a tabela e suas colunas
const Raffle = database.define('raffle', {
    // Chave primária
    raffle_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // Título do concurso
    raffle_title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Descrição do concurso
    raffle_content: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    // Opções da tabela: nome e controle das datas
    tableName: 'raffle',
    timestamps: false
});

// Exporta o modelo
export default Raffle;
