const jwt = require('jsonwebtoken')

/**
 * Auth cho api-docs:
 * - Cho phep Bearer token trong header
 * - Hoac token qua query ?token=... de mo duoc tren browser
 */
const authenticateDocsToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  let token = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.query?.token) {
    token = req.query.token
  }

  if (!token) {
    // Nếu không có token, trả về trang nhỏ hướng dẫn nhập token + apiKey để tải Swagger UI
    const basePath = `${req.baseUrl}${req.path}`
    return res
      .status(401)
      .type('html')
      .send(`<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs - Cần token</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; display:flex; align-items:center; justify-content:center; height:100vh; }
      .card { background:#111827; padding:24px; border-radius:12px; width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.35); }
      label { display:block; font-size:13px; margin-bottom:6px; color:#cbd5e1; }
      input { width:100%; padding:10px; border-radius:8px; border:1px solid #1f2937; background:#0b1222; color:#e2e8f0; margin-bottom:14px; }
      button { width:100%; padding:10px; border:0; border-radius:8px; background:#2563eb; color:#fff; font-weight:600; cursor:pointer; }
      small { color:#94a3b8; display:block; margin-bottom:12px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h3 style="margin:0 0 10px 0;">Yêu cầu xác thực</h3>
      <small>Dán JWT token và x-api-key (DOCS_API_KEY) để mở Swagger UI.</small>
      <label for="token">JWT token</label>
      <input id="token" placeholder="Bearer token" />
      <label for="apikey">x-api-key</label>
      <input id="apikey" placeholder="student-docs-key" />
      <button onclick="openDocs()">Mở API Docs</button>
    </div>
    <script>
      function openDocs() {
        const t = document.getElementById('token').value.trim()
        const k = document.getElementById('apikey').value.trim()
        if (!t) { alert('Nhập JWT token'); return }
        const url = '${basePath}?token=' + encodeURIComponent(t) + '&apiKey=' + encodeURIComponent(k || '')
        window.location = url
      }
    </script>
  </body>
</html>`)
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token api-docs khong hop le hoac da het han' })
  }
}

module.exports = { authenticateDocsToken }
