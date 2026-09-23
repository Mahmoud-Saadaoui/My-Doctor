require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.TEST_DB_NAME || `${process.env.DB_NAME}_test`,
  },
  production: baseConfig,
};
