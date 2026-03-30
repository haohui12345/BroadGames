require('dotenv').config();
require('./src/config/db');

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const registerSocket = require('./src/socket');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

registerSocket(io);

server.listen(PORT, () => {
  console.log(`-- Server đang chạy tại http://localhost:${PORT}`);
  console.log(`-- Môi trường : ${process.env.NODE_ENV || 'development'}`);
  console.log(`-- API Docs   : http://localhost:${PORT}/api/docs`);
  console.log(`-- Health     : http://localhost:${PORT}/api/health`);
});