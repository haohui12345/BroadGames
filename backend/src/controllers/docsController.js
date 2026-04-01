const GROUPS = [
  {
    title: 'Auth',
    accent: '#60a5fa',
    description: 'Đăng ký, đăng nhập và quản lý phiên.',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', summary: 'Tạo tài khoản', detail: 'Tạo tài khoản mới cho người dùng.' },
      { method: 'POST', path: '/api/auth/login', summary: 'Đăng nhập', detail: 'Xác thực tài khoản và trả về JWT token.' },
      { method: 'GET', path: '/api/auth/me', summary: 'Người dùng hiện tại', detail: 'Lấy thông tin người dùng đang đăng nhập.' },
      { method: 'POST', path: '/api/auth/change-password', summary: 'Đổi mật khẩu', detail: 'Cập nhật mật khẩu của tài khoản.' },
    ],
  },
  {
    title: 'Users',
    accent: '#34d399',
    description: 'Hồ sơ, tìm kiếm người dùng và xếp hạng.',
    endpoints: [
      { method: 'GET', path: '/api/users/profile', summary: 'Hồ sơ của tôi', detail: 'Xem thông tin cá nhân.' },
      { method: 'PUT', path: '/api/users/profile', summary: 'Cập nhật hồ sơ', detail: 'Đổi tên, avatar và thông tin cá nhân.' },
      { method: 'GET', path: '/api/users/search?q=keyword', summary: 'Tìm người dùng', detail: 'Tìm người dùng theo từ khóa.' },
      { method: 'GET', path: '/api/users/:id', summary: 'Chi tiết người dùng', detail: 'Xem hồ sơ người dùng khác.' },
      { method: 'GET', path: '/api/users/rankings', summary: 'Xếp hạng tổng', detail: 'Bảng xếp hạng toàn hệ thống.' },
      { method: 'GET', path: '/api/users/rankings/friends', summary: 'Xếp hạng bạn bè', detail: 'Bảng xếp hạng của bạn bè.' },
      { method: 'GET', path: '/api/users/rankings/me', summary: 'Vị trí của tôi', detail: 'Xem thứ hạng của bạn.' },
    ],
  },
  {
    title: 'Games',
    accent: '#f59e0b',
    description: 'Danh sách game, luật chơi và đánh giá.',
    endpoints: [
      { method: 'GET', path: '/api/games', summary: 'Danh sách game', detail: 'Lấy danh sách tất cả game.' },
      { method: 'GET', path: '/api/games/:id', summary: 'Chi tiết game', detail: 'Lấy thông tin chi tiết của game.' },
      { method: 'GET', path: '/api/games/:id/rules', summary: 'Luật chơi', detail: 'Lấy hướng dẫn và luật chơi.' },
      { method: 'GET', path: '/api/games/:id/ratings', summary: 'Đánh giá', detail: 'Lấy điểm đánh giá của game.' },
      { method: 'POST', path: '/api/games/:id/ratings', summary: 'Tạo đánh giá', detail: 'Gửi đánh giá cho game.' },
    ],
  },
  {
    title: 'Sessions',
    accent: '#f87171',
    description: 'Phòng chơi, tham gia game, lưu ván và kết quả.',
    endpoints: [
      { method: 'POST', path: '/api/sessions', summary: 'Tạo phòng', detail: 'Tạo phòng chơi mới.' },
      { method: 'GET', path: '/api/sessions/waiting', summary: 'Phòng chờ', detail: 'Danh sách phòng đang chờ.' },
      { method: 'GET', path: '/api/sessions/history', summary: 'Lịch sử', detail: 'Lịch sử các trận đã chơi.' },
      { method: 'GET', path: '/api/sessions/:id', summary: 'Chi tiết phòng', detail: 'Xem thông tin phòng.' },
      { method: 'POST', path: '/api/sessions/:id/join', summary: 'Tham gia phòng', detail: 'Tham gia phòng đang mở.' },
      { method: 'PUT', path: '/api/sessions/:id/board', summary: 'Cập nhật bàn cờ', detail: 'Cập nhật trạng thái bàn cờ.' },
      { method: 'POST', path: '/api/sessions/:id/finish', summary: 'Kết thúc ván', detail: 'Kết thúc trận đấu.' },
      { method: 'POST', path: '/api/sessions/:id/save', summary: 'Lưu ván', detail: 'Lưu trạng thái trận đấu.' },
      { method: 'POST', path: '/api/sessions/:id/abandon', summary: 'Rời phòng', detail: 'Rời khỏi trận đấu.' },
      { method: 'GET', path: '/api/sessions/:id/scores', summary: 'Kết quả', detail: 'Lấy điểm số và kết quả.' },
    ],
  },
  {
    title: 'Admin',
    accent: '#a78bfa',
    description: 'Công cụ quản trị cho tài khoản và thống kê.',
    endpoints: [
      { method: 'GET', path: '/api/admin/stats', summary: 'Thống kê', detail: 'Lấy số liệu tổng quan hệ thống.' },
      { method: 'GET', path: '/api/admin/users', summary: 'Quản lý người dùng', detail: 'Danh sách tài khoản để quản lý.' },
      { method: 'GET', path: '/api/admin/users/:id', summary: 'Chi tiết tài khoản', detail: 'Xem chi tiết một tài khoản.' },
      { method: 'PATCH', path: '/api/admin/users/:id/toggle', summary: 'Khóa / mở', detail: 'Khóa hoặc mở tài khoản.' },
      { method: 'PATCH', path: '/api/admin/users/:id/role', summary: 'Đổi vai trò', detail: 'Đổi quyền admin hoặc client.' },
    ],
  },
]

const methodClass = (method) => method.toLowerCase()

const renderEndpoint = (endpoint, accent) => `
  <div class="endpoint">
    <div class="endpoint-main">
      <span class="method ${methodClass(endpoint.method)}">${endpoint.method}</span>
      <div class="endpoint-copy">
        <code>${endpoint.path}</code>
        <div class="summary">${endpoint.summary}</div>
      </div>
    </div>
    <div class="detail">${endpoint.detail}</div>
  </div>
`

const renderGroup = (group, index) => `
  <details class="group" ${index === 0 ? 'open' : ''}>
    <summary>
      <div class="summary-left">
        <span class="group-badge" style="background:${group.accent}"></span>
        <div>
          <div class="group-title">${group.title}</div>
          <div class="group-desc">${group.description}</div>
        </div>
      </div>
      <span class="group-count">${group.endpoints.length} endpoints</span>
    </summary>
    <div class="group-body">
      ${group.endpoints.map((endpoint) => renderEndpoint(endpoint, group.accent)).join('')}
    </div>
  </details>
`

const renderDocs = () => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Tài liệu API BoardZone</title>
      <style>
        :root {
          color-scheme: dark;
          font-family: Inter, Segoe UI, Arial, sans-serif;
          --bg: #050816;
          --panel: #0b1220;
          --panel-2: #0f172a;
          --line: #22304a;
          --text: #e5eefb;
          --muted: #8aa0c6;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background:
            radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 30%),
            radial-gradient(circle at right top, rgba(168, 85, 247, 0.12), transparent 24%),
            var(--bg);
          color: var(--text);
        }
        .page {
          max-width: 1120px;
          margin: 0 auto;
          padding: 28px 18px 56px;
        }
        .shell {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        .hero {
          border: 1px solid var(--line);
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(11, 18, 32, 0.95));
          padding: 22px 22px 18px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
        }
        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }
        .meta {
          color: var(--muted);
          line-height: 1.6;
          margin-top: 10px;
          max-width: 760px;
        }
        .server-bar {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 14px;
          align-items: center;
        }
        .server-label {
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .server-select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #364764;
          background: var(--panel-2);
          color: var(--text);
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
        }
        .groups {
          display: grid;
          gap: 14px;
        }
        .group {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: rgba(11, 18, 32, 0.92);
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
        }
        .group > summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 1px solid transparent;
        }
        .group > summary::-webkit-details-marker { display: none; }
        .summary-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .group-badge {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          box-shadow: 0 0 0 5px rgba(255,255,255,0.05);
          flex: 0 0 auto;
        }
        .group-title {
          font-size: 18px;
          font-weight: 800;
        }
        .group-desc {
          color: var(--muted);
          font-size: 13px;
          margin-top: 4px;
        }
        .group-count {
          color: var(--muted);
          font-size: 13px;
          white-space: nowrap;
        }
        .group[open] > summary {
          background: rgba(255,255,255,0.02);
          border-bottom-color: var(--line);
        }
        .group-body {
          padding: 10px 12px 16px;
          display: grid;
          gap: 10px;
        }
        .endpoint {
          border: 1px solid #24334e;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.88);
          padding: 14px 14px 12px;
        }
        .endpoint-main {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .method {
          min-width: 66px;
          text-align: center;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #fff;
        }
        .method.get { background: #3b82f6; }
        .method.post { background: #22c55e; }
        .method.put { background: #f59e0b; }
        .method.patch { background: #8b5cf6; }
        .method.delete { background: #ef4444; }
        .endpoint-copy {
          flex: 1;
          min-width: 0;
        }
        .endpoint-copy code {
          display: block;
          color: #dbeafe;
          font-size: 16px;
          word-break: break-word;
        }
        .summary {
          margin-top: 4px;
          color: var(--muted);
          font-size: 13px;
        }
        .detail {
          margin-top: 10px;
          color: #c7d5eb;
          font-size: 14px;
          line-height: 1.6;
        }
        @media (max-width: 720px) {
          h1 { font-size: 28px; }
          .server-bar { grid-template-columns: 1fr; }
          .group > summary,
          .endpoint-main {
            align-items: flex-start;
          }
          .group > summary {
            flex-direction: column;
          }
        }
      </style>
    </head>
    <body>
      <main class="page">
        <div class="shell">
        <section class="hero">
          <div class="title-row">
            <div>
                <h1>Tài liệu API BoardZone</h1>
                <div class="meta">Giao diện kiểu Swagger để thuyết trình: có server, có nhóm endpoint, có màu method rõ ràng. Các API thật vẫn giữ auth ở backend, còn trang này mở public để xem nhanh.</div>
              </div>
            </div>
            <div class="server-bar">
              <div class="server-label">Máy chủ</div>
              <select class="server-select">
                <option>http://localhost:3000/api - Local server</option>
              </select>
            </div>
          </section>
          <section class="groups">
            ${GROUPS.map(renderGroup).join('')}
          </section>
        </div>
      </main>
    </body>
  </html>
`

const getApiDocs = (req, res) => res.status(200).send(renderDocs(req))

module.exports = { getApiDocs }
