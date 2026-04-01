require('dotenv').config();
require('./src/config/db');

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const app = require('./src/app');
const registerSocket = require('./src/socket');
const keyPath = path.join(__dirname, 'localhost-key.pem');
const certPath = path.join(__dirname, 'localhost.pem');


const PORT = process.env.PORT || 3000;

let server = null;
let protocol = 'http';

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  server = https.createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    app
  );
  protocol = 'https';
} else {
  server = http.createServer(app);
  console.warn(`-- SSL certificate not found. Falling back to HTTP.`);
}

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://localhost:5173',
    credentials: true,
  },
});

registerSocket(io);

server.listen(PORT, () => {
  console.log(`-- Server đang chạy tại http://localhost:${PORT}`);
  console.log(`-- Môi trường : ${process.env.NODE_ENV || 'development'}`);
  console.log(`-- API Docs   : ${protocol}://localhost:${PORT}/api/docs`);
  console.log(`-- Health     : ${protocol}://localhost:${PORT}/api/health`);
});
