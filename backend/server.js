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
const { createCorsOptions } = require('./src/config/cors');

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
  cors: createCorsOptions(),
});

registerSocket(io);

server.listen(PORT, () => {
  console.log(`-- Server dang chay tai ${protocol}://localhost:${PORT}`);
  console.log(`-- Môi trường : ${process.env.NODE_ENV || 'development'}`);
  console.log(`-- API Docs   : ${protocol}://localhost:${PORT}/api/docs`);
  console.log(`-- Health     : ${protocol}://localhost:${PORT}/api/health`);
});
