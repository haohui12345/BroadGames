const API_TITLE = 'BoardGames API Docs'

const SERVER_URL = process.env.PUBLIC_API_URL || 'http://localhost:3000'

const pathConfig = {
  '/api/auth/register': { post: { tags: ['Auth'], summary: 'Dang ky tai khoan moi' } },
  '/api/auth/login': { post: { tags: ['Auth'], summary: 'Dang nhap va nhan JWT token' } },
  '/api/auth/me': { get: { tags: ['Auth'], summary: 'Lay thong tin nguoi dang dang nhap', secured: true } },
  '/api/auth/change-password': { post: { tags: ['Auth'], summary: 'Doi mat khau', secured: true } },

  '/api/users/profile': {
    get: { tags: ['Users'], summary: 'Xem profile cua toi', secured: true },
    put: { tags: ['Users'], summary: 'Cap nhat profile', secured: true },
  },
  '/api/users/search': { get: { tags: ['Users'], summary: 'Tim nguoi dung', secured: true } },
  '/api/users/{id}': { get: { tags: ['Users'], summary: 'Xem profile nguoi dung khac', secured: true } },
  '/api/users/rankings': { get: { tags: ['Users'], summary: 'Bang xep hang toan he thong', secured: true } },
  '/api/users/rankings/friends': { get: { tags: ['Users'], summary: 'Bang xep hang ban be', secured: true } },
  '/api/users/rankings/me': { get: { tags: ['Users'], summary: 'Bang xep hang ca nhan', secured: true } },

  '/api/games': { get: { tags: ['Games'], summary: 'Danh sach game', secured: true } },
  '/api/games/{id}': { get: { tags: ['Games'], summary: 'Chi tiet game', secured: true } },
  '/api/games/{id}/rules': { get: { tags: ['Games'], summary: 'Luat choi', secured: true } },
  '/api/games/{id}/ratings': {
    get: { tags: ['Games'], summary: 'Danh sach danh gia', secured: true },
    post: { tags: ['Games'], summary: 'Gui danh gia game', secured: true },
  },

  '/api/sessions': { post: { tags: ['Sessions'], summary: 'Tao phong choi', secured: true } },
  '/api/sessions/waiting': { get: { tags: ['Sessions'], summary: 'Danh sach phong cho', secured: true } },
  '/api/sessions/history': { get: { tags: ['Sessions'], summary: 'Lich su tran dau', secured: true } },
  '/api/sessions/{id}': { get: { tags: ['Sessions'], summary: 'Chi tiet phong choi', secured: true } },
  '/api/sessions/{id}/join': { post: { tags: ['Sessions'], summary: 'Tham gia phong', secured: true } },
  '/api/sessions/{id}/board': { put: { tags: ['Sessions'], summary: 'Cap nhat ban co', secured: true } },
  '/api/sessions/{id}/finish': { post: { tags: ['Sessions'], summary: 'Ket thuc van choi', secured: true } },
  '/api/sessions/{id}/save': { post: { tags: ['Sessions'], summary: 'Luu van choi', secured: true } },
  '/api/sessions/{id}/abandon': { post: { tags: ['Sessions'], summary: 'Roi phong', secured: true } },
  '/api/sessions/{id}/scores': { get: { tags: ['Sessions'], summary: 'Xem diem so', secured: true } },

  '/api/achievements': { get: { tags: ['Achievements'], summary: 'Danh sach thanh tuu', secured: true } },
  '/api/achievements/me': { get: { tags: ['Achievements'], summary: 'Thanh tuu cua toi', secured: true } },
  '/api/achievements/users/{id}': { get: { tags: ['Achievements'], summary: 'Thanh tuu cua nguoi dung khac', secured: true } },
  '/api/achievements/check': { post: { tags: ['Achievements'], summary: 'Kiem tra mo khoa thanh tuu', secured: true } },

  '/api/friends': { get: { tags: ['Friends'], summary: 'Danh sach ban be', secured: true } },
  '/api/friends/pending': { get: { tags: ['Friends'], summary: 'Loi moi ket ban dang cho', secured: true } },
  '/api/friends/request/{id}': {
    post: { tags: ['Friends'], summary: 'Gui loi moi ket ban', secured: true },
  },
  '/api/friends/request/{id}/accept': {
    put: { tags: ['Friends'], summary: 'Chap nhan loi moi ket ban', secured: true },
  },
  '/api/friends/request/{id}/decline': {
    put: { tags: ['Friends'], summary: 'Tu choi loi moi ket ban', secured: true },
  },
  '/api/friends/{id}': { delete: { tags: ['Friends'], summary: 'Huy ket ban', secured: true } },

  '/api/messages': { get: { tags: ['Messages'], summary: 'Inbox tin nhan', secured: true } },
  '/api/messages/unread/count': { get: { tags: ['Messages'], summary: 'Dem tin nhan chua doc', secured: true } },
  '/api/messages/{id}': {
    get: { tags: ['Messages'], summary: 'Lay hoi thoai voi 1 nguoi', secured: true },
    post: { tags: ['Messages'], summary: 'Gui tin nhan', secured: true },
  },

  '/api/admin/stats': { get: { tags: ['Admin'], summary: 'Thong ke he thong', secured: true } },
  '/api/admin/users': { get: { tags: ['Admin'], summary: 'Danh sach user', secured: true } },
  '/api/admin/users/{id}': { get: { tags: ['Admin'], summary: 'Chi tiet user', secured: true } },
  '/api/admin/users/{id}/toggle': { patch: { tags: ['Admin'], summary: 'Khoa mo khoa user', secured: true } },
  '/api/admin/users/{id}/role': { patch: { tags: ['Admin'], summary: 'Doi role user', secured: true } },
}

const buildPaths = () =>
  Object.entries(pathConfig).reduce((result, [routePath, methods]) => {
    result[routePath] = Object.entries(methods).reduce((methodResult, [method, config]) => {
      methodResult[method] = {
        tags: config.tags,
        summary: config.summary,
        security: config.secured ? [{ bearerAuth: [] }, { apiKeyAuth: [] }] : [],
        responses: {
          200: { description: 'Success' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      }
      return methodResult
    }, {})
    return result
  }, {})

const buildOpenApiSpec = () => ({
  openapi: '3.0.3',
  info: {
    title: API_TITLE,
    version: '1.0.0',
    description: 'Tai lieu API muc co ban cho do an BoardGames.',
  },
  servers: [
    {
      url: SERVER_URL,
      description: 'Local server',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Games' },
    { name: 'Sessions' },
    { name: 'Achievements' },
    { name: 'Friends' },
    { name: 'Messages' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
  },
  paths: buildPaths(),
})

const renderSwaggerUi = (req) => {
  const token = req.query?.token || ''
  const apiKey = req.query?.apiKey || ''
  const specUrl = `/api/docs/openapi.json?token=${encodeURIComponent(token)}&apiKey=${encodeURIComponent(apiKey)}`

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${API_TITLE}</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <style>
        body { margin: 0; background: #fafafa; }
        .top-note {
          padding: 10px 16px;
          background: #111827;
          color: #e5e7eb;
          font: 14px Arial, sans-serif;
        }
        .top-note code { color: #93c5fd; }
      </style>
    </head>
    <body>
      <div class="top-note">
        Swagger UI duoc bao ve bang JWT token va <code>x-api-key</code>.
        Dang xem voi tai khoan: <strong>${req.user?.username || 'unknown'}</strong>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        const token = ${JSON.stringify(token)};
        const apiKey = ${JSON.stringify(apiKey)};
        window.ui = SwaggerUIBundle({
          url: ${JSON.stringify(specUrl)},
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
          requestInterceptor: (request) => {
            if (token) request.headers['Authorization'] = 'Bearer ' + token;
            if (apiKey) request.headers['x-api-key'] = apiKey;
            return request;
          },
        });
      </script>
    </body>
  </html>`
}

const getSwaggerUi = (req, res) => res.status(200).send(renderSwaggerUi(req))

const getOpenApiSpec = (req, res) => res.status(200).json(buildOpenApiSpec())

module.exports = {
  getSwaggerUi,
  getOpenApiSpec,
}
