const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createCorsOptions } = require('./config/cors');

const app = express();

// ── Middlewares toàn cục ───────────────────────────────────────
app.use(helmet());
app.use(cors(createCorsOptions()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const sessionRoutes = require('./routes/sessions');
const achievementRoutes = require('./routes/achievements')
const friendRoutes = require('./routes/friendships');
const messageRoutes = require('./routes/messages');
const adminRoutes   = require('./routes/admin');
const docsRoutes = require('./routes/docsSwagger');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/achievements', achievementRoutes)
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/docs', docsRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} không tồn tại` });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
