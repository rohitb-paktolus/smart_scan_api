require('dotenv').config();
const { DataSource } = require('typeorm');

const isProd = process.env.NODE_ENV === 'production';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'smart_scan_db',
  synchronize: false,
  logging: false,
  entities: isProd ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'],
  migrations: isProd ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],
  subscribers: [],
});

module.exports = dataSource;