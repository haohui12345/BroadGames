require('dotenv').config();
require('./src/config/db');

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`-- Server đang chạy tại http://localhost:${PORT}`);
  console.log(`-- Môi trường : ${process.env.NODE_ENV || 'development'}`);
  console.log(`-- API Docs   : http://localhost:${PORT}/api/docs`);
  console.log(`-- Health     : http://localhost:${PORT}/api/health`);
});