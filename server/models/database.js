const { Sequelize } = require('sequelize');


const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        dialect: 'postgres',
        logging: false,
        pool: {
            max: Number(process.env.DB_POOL_MAX || 10),
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
)

module.exports = db;
