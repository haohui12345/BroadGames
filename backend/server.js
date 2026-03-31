require('dotenv').config();
require('./src/config/db');

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const app = require('./src/app');
const registerSocket = require('./src/socket');

const PORT = process.env.PORT || 3000;
const defaultPfxPath = path.join(__dirname, 'certs', 'localhost.pfx');
const sslPfxPath = process.env.SSL_PFX_PATH || defaultPfxPath;
const sslPassphrase = process.env.SSL_PFX_PASSPHRASE || 'boardgame-dev-cert';

let server = null;
let protocol = 'http';

if (fs.existsSync(sslPfxPath)) {
  server = https.createServer(
    {
      pfx: fs.readFileSync(sslPfxPath),
      passphrase: sslPassphrase,
    },
    app
  );
  protocol = 'https';
} else {
  server = http.createServer(app);
  console.warn(`-- SSL certificate not found at ${sslPfxPath}. Falling back to HTTP.`);
}

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
  console.log(`-- API Docs   : ${protocol}://localhost:${PORT}/api/docs`);
  console.log(`-- Health     : ${protocol}://localhost:${PORT}/api/health`);
});
