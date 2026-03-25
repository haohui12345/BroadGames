const knex = require('knex');
const knexConfig = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';

const db = knex(knexConfig[env]);

// Test kết nối khi khởi động
db.raw('SELECT 1')
  .then(() => console.log('-- Database connected'))
  .catch((err) => {
    console.error('-- Database connection failed: ', err.message);
    process.exit(1);
  });

module.exports = db;