const SECTIONS = [
  {
    title: 'Auth',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/auth/change-password',
    ],
  },
  {
    title: 'Users',
    endpoints: [
      'GET /api/users/profile',
      'PUT /api/users/profile',
      'GET /api/users/search?q=keyword',
      'GET /api/users/:id',
      'GET /api/users/rankings',
      'GET /api/users/rankings/friends',
      'GET /api/users/rankings/me',
    ],
  },
  {
    title: 'Games',
    endpoints: [
      'GET /api/games',
      'GET /api/games/:id',
      'GET /api/games/:id/rules',
      'GET /api/games/:id/ratings',
      'POST /api/games/:id/ratings',
    ],
  },
  {
    title: 'Sessions',
    endpoints: [
      'POST /api/sessions',
      'GET /api/sessions/waiting',
      'GET /api/sessions/history',
      'GET /api/sessions/:id',
      'POST /api/sessions/:id/join',
      'PUT /api/sessions/:id/board',
      'POST /api/sessions/:id/finish',
      'POST /api/sessions/:id/save',
      'POST /api/sessions/:id/abandon',
      'GET /api/sessions/:id/scores',
    ],
  },
  {
    title: 'Admin',
    endpoints: [
      'GET /api/admin/stats',
      'GET /api/admin/users',
      'GET /api/admin/users/:id',
      'PATCH /api/admin/users/:id/toggle',
      'PATCH /api/admin/users/:id/role',
    ],
  },
]

const renderSection = (section) => `
    <section class="card">
      <h2>${section.title}</h2>
      <ul>
        ${section.endpoints.map((endpoint) => `<li><code>${endpoint}</code></li>`).join('')}
      </ul>
    </section>
  `

const getApiDocs = (req, res) => {
  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>API Docs</title>
        <style>
          :root {
            color-scheme: light dark;
            font-family: Arial, sans-serif;
          }
          body {
            margin: 0;
            background: #0f172a;
            color: #e2e8f0;
          }
          .page {
            max-width: 980px;
            margin: 0 auto;
            padding: 32px 20px 48px;
          }
          .hero, .card {
            border: 1px solid #334155;
            border-radius: 16px;
            background: #111827;
            padding: 20px;
            margin-bottom: 16px;
          }
          h1, h2 {
            margin: 0 0 12px;
          }
          p, li {
            line-height: 1.6;
          }
          ul {
            margin: 0;
            padding-left: 20px;
          }
          code {
            color: #93c5fd;
            font-size: 14px;
          }
          .meta {
            color: #94a3b8;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            <h1>BoardGames API Docs</h1>
            <p class="meta">Route nay duoc bao ve boi Bearer token va header x-api-key.</p>
            <p class="meta">Nguoi xem hien tai: ${req.user?.username || 'unknown'} (${req.user?.role || 'client'})</p>
          </section>
          ${SECTIONS.map(renderSection).join('')}
        </main>
      </body>
    </html>
  `

  return res.status(200).send(html)
}

module.exports = { getApiDocs }
