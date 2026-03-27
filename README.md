# Boardgame Platform – Tài liệu API Backend

## Công nghệ sử dụng
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (qua Knex.js)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Security:** Helmet, CORS

---

## Cấu trúc Database

| Bảng | Mô tả |
|---|---|
| `users` | Tài khoản người dùng (uuid, email, username, role, is_active) |
| `games` | Danh sách game (code, name, rules, board_size, is_enabled) |
| `game_sessions` | Phòng chơi (host, guest, vs_computer, status, board_state) |
| `game_saves` | Lưu game (board_state, move_history) |
| `rankings` | Bảng xếp hạng (wins, losses, draws, total_score) |
| `achievements` | Thành tựu (code, name, game_id) |
| `user_achievements` | Thành tựu đã mở khóa của user |
| `friendships` | Quan hệ bạn bè (pending / accepted / blocked) |
| `messages` | Tin nhắn trực tiếp (sender, receiver, is_read) |
| `game_ratings` | Đánh giá & bình luận game (rating 1–5, comment) |

---

## API Endpoints

### 🔐 Auth – `/api/auth`

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/register` | Đăng ký tài khoản mới |
| POST | `/login` | Đăng nhập bằng email hoặc username |
| GET | `/me` | Lấy thông tin user đang đăng nhập |
| POST | `/change-password` | Đổi mật khẩu |

---

### 👤 Users – `/api/users` *(yêu cầu đăng nhập)*

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/profile` | Xem profile của bản thân |
| PUT | `/profile` | Cập nhật profile (full_name, avatar_url, bio, username) |
| GET | `/search?q=keyword` | Tìm kiếm người dùng theo username / full_name |
| GET | `/:id` | Xem profile của user khác |
| GET | `/rankings` | Bảng xếp hạng toàn server (lọc theo game_slug) |
| GET | `/rankings/friends` | Bảng xếp hạng trong nhóm bạn bè |
| GET | `/rankings/me` | Xếp hạng cá nhân theo từng game |

---

### 🎮 Games – `/api/games` *(yêu cầu đăng nhập)*

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Danh sách game (client chỉ thấy game đang bật) |
| GET | `/:id` | Chi tiết 1 game |
| GET | `/:id/rules` | Xem luật chơi của game |
| GET | `/:id/ratings` | Danh sách đánh giá & bình luận của game |
| POST | `/:id/ratings` | Đánh giá game (1–5 sao + comment, mỗi user 1 lần) |
| POST | `/` | *(Admin)* Tạo game mới |
| PUT | `/:id` | *(Admin)* Cập nhật thông tin game |
| PATCH | `/:id/toggle` | *(Admin)* Bật / tắt game |
| DELETE | `/:id` | *(Admin)* Xóa game |

---

### 🕹️ Sessions – `/api/sessions` *(yêu cầu đăng nhập)*

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/` | Tạo phòng chơi mới (vs người hoặc vs máy) |
| GET | `/waiting` | Danh sách phòng đang chờ người vào |
| GET | `/history` | Lịch sử các trận đã chơi |
| GET | `/saves` | Danh sách game đã lưu |
| GET | `/:id` | Chi tiết 1 phòng chơi |
| POST | `/:id/join` | Vào phòng chờ |
| PUT | `/:id/board` | Cập nhật trạng thái bàn cờ |
| POST | `/:id/finish` | Kết thúc trận, cập nhật ranking |
| POST | `/:id/save` | Lưu game |
| POST | `/:id/abandon` | Rời phòng chơi |
| GET | `/:id/scores` | Xem điểm số của 1 trận |

---

### 🏆 Achievements – `/api/achievements` *(yêu cầu đăng nhập)*

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Danh sách tất cả thành tựu |
| GET | `/me` | Thành tựu của bản thân (đã mở + chưa mở) |
| GET | `/users/:id` | Thành tựu đã mở khóa của user khác |
| POST | `/check` | Kiểm tra và mở khóa thành tựu mới |

**Danh sách thành tựu:**

| Code | Điều kiện |
|---|---|
| `first_win` | Thắng 1 trận đầu tiên |
| `win_10` | Tổng cộng 10 lần thắng |
| `win_50` | Tổng cộng 50 lần thắng |
| `caro5_master` | Thắng 20 trận Caro 5 |
| `tictactoe_pro` | Thắng 10 trận Tic-tac-toe |
| `social_butterfly` | Có ít nhất 5 bạn bè |
| `reviewer` | Đánh giá ít nhất 3 game |

---

### 👥 Friendships – `/api/friends` *(yêu cầu đăng nhập)*

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Danh sách bạn bè |
| GET | `/pending` | Danh sách lời mời kết bạn đang chờ |
| POST | `/request/:id` | Gửi lời mời kết bạn |
| PUT | `/request/:id/accept` | Chấp nhận lời mời kết bạn |
| PUT | `/request/:id/decline` | Từ chối lời mời kết bạn |
| DELETE | `/:id` | Hủy kết bạn |

---

### 💬 Messages – `/api/messages` *(yêu cầu đăng nhập)*

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Inbox – danh sách cuộc trò chuyện gần nhất |
| GET | `/unread/count` | Đếm số tin nhắn chưa đọc |
| GET | `/:id` | Lấy toàn bộ tin nhắn với 1 user (có phân trang) |
| POST | `/:id` | Gửi tin nhắn đến user |

---

### 🛡️ Admin – `/api/admin` *(yêu cầu đăng nhập + role admin)*

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/stats` | Thống kê tổng quan hệ thống + top 5 game |
| GET | `/users` | Danh sách tất cả users (có tìm kiếm, phân trang) |
| GET | `/users/:id` | Chi tiết user + thống kê wins/games |
| PATCH | `/users/:id/toggle` | Khóa / mở khóa tài khoản |
| PATCH | `/users/:id/role` | Đổi role (client ↔ admin) |

---

## Middleware

| Middleware | Mô tả |
|---|---|
| `authenticateToken` | Xác thực JWT, gắn `req.user` |
| `isAdmin` | Kiểm tra `req.user.role === 'admin'` |

---

## Ranking System

- Thắng: **+100 điểm**
- Hòa: **+20 điểm**
- Thua: **+0 điểm**
