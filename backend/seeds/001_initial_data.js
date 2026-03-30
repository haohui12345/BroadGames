const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('game_ratings').del();
  await knex('messages').del();
  await knex('friendships').del();
  await knex('user_achievements').del();
  await knex('achievements').del();
  await knex('rankings').del();
  await knex('game_saves').del();
  await knex('game_sessions').del();
  await knex('games').del();
  await knex('users').del();

  const hash = await bcrypt.hash('password123', 10);

  // ── USERS ────────────────────────────────────────────────────
  const users = await knex('users')
    .insert([
      {
        email: 'admin@ltudweb.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        full_name: 'Admin',
        role: 'admin',
        bio: 'Quản trị viên hệ thống',
      },
      {
        email: 'player1@test.com',
        username: 'PlayerOne',
        password: hash,
        full_name: 'Nguyễn Văn A',
        bio: 'Mê cờ caro từ nhỏ',
      },
      {
        email: 'player2@test.com',
        username: 'PlayerTwo',
        password: hash,
        full_name: 'Trần Thị B',
        bio: 'Chuyên tic-tac-toe',
      },
      {
        email: 'player3@test.com',
        username: 'PlayerThree',
        password: hash,
        full_name: 'Lê Văn C',
        bio: 'Thích chơi rắn săn mồi',
      },
      {
        email: 'player4@test.com',
        username: 'PlayerFour',
        password: hash,
        full_name: 'Phạm Thị D',
        bio: 'Game thủ nghiệp dư',
      },
    ])
    .returning(['id', 'username', 'role']);

  // ── GAMES ─────────────────────────────────────────────────────
  const games = await knex('games')
    .insert([
      {
        code: 'caro5',
        name: 'Caro hàng 5',
        description: 'Nối 5 quân liên tiếp để thắng',
        rules: 'Hai người thay nhau đánh. Ai nối được 5 quân theo hàng ngang, dọc hoặc chéo trước thì thắng.',
        board_size: 15,
        min_players: 2,
        max_players: 2,
      },
      {
        code: 'caro4',
        name: 'Caro hàng 4',
        description: 'Nối 4 quân liên tiếp để thắng',
        rules: 'Tương tự caro hàng 5 nhưng chỉ cần 4 quân liên tiếp. Bàn 10x10.',
        board_size: 10,
        min_players: 2,
        max_players: 2,
      },
      {
        code: 'tictactoe',
        name: 'Tic-tac-toe',
        description: 'Cờ X O 3x3 truyền thống',
        rules: 'Bàn 3x3. Ai điền được X hoặc O theo hàng ngang, dọc, chéo trước thì thắng.',
        board_size: 3,
        min_players: 2,
        max_players: 2,
      },
      {
        code: 'snake',
        name: 'Rắn săn mồi',
        description: 'Điều khiển rắn ăn mồi, tránh va chạm',
        rules: 'Dùng phím mũi tên điều khiển rắn. Ăn mồi để dài thêm. Đừng đâm vào tường hoặc thân rắn.',
        board_size: 20,
        min_players: 1,
        max_players: 1,
      },
      {
        code: 'match3',
        name: 'Ghép hàng 3',
        description: 'Ghép 3 viên đá cùng màu kiểu candy rush',
        rules: 'Đổi chỗ hai viên đá liền nhau để tạo hàng 3 viên cùng màu. Ghép càng nhiều càng được điểm cao.',
        board_size: 8,
        min_players: 1,
        max_players: 1,
      },
      {
        code: 'memory',
        name: 'Cờ trí nhớ',
        description: 'Lật và ghép các cặp thẻ giống nhau',
        rules: 'Mỗi lượt lật 2 thẻ. Nếu giống nhau thì giữ lại. Ai ghép được nhiều cặp nhất thì thắng.',
        board_size: 4,
        min_players: 1,
        max_players: 2,
      },
      {
        code: 'draw',
        name: 'Bảng vẽ tự do',
        description: 'Vẽ tự do trên bàn game',
        rules: 'Dùng chuột hoặc phím để vẽ. Chọn màu sắc và kích thước nét vẽ tuỳ thích.',
        board_size: 20,
        min_players: 1,
        max_players: 1,
      },
    ])
    .returning(['id', 'code', 'name']);

  // ── ACHIEVEMENTS ──────────────────────────────────────────────
  const caro5Id   = games.find((g) => g.code === 'caro5').id;
  const tttId     = games.find((g) => g.code === 'tictactoe').id;
  const snakeId   = games.find((g) => g.code === 'snake').id;
  const match3Id  = games.find((g) => g.code === 'match3').id;

  await knex('achievements').insert([
    { code: 'first_win',        name: 'Chiến thắng đầu tiên',  description: 'Thắng trận đầu tiên',                 game_id: null },
    { code: 'win_10',           name: '10 chiến thắng',         description: 'Giành được 10 chiến thắng',           game_id: null },
    { code: 'win_50',           name: '50 chiến thắng',         description: 'Giành được 50 chiến thắng',           game_id: null },
    { code: 'caro5_master',     name: 'Caro Master',            description: 'Thắng 20 ván caro hàng 5',            game_id: caro5Id },
    { code: 'tictactoe_pro',    name: 'Tic-tac-toe Pro',        description: 'Thắng 10 ván Tic-tac-toe',            game_id: tttId },
    { code: 'snake_highscore',  name: 'Rắn thần',               description: 'Đạt 1000 điểm trong rắn săn mồi',    game_id: snakeId },
    { code: 'match3_combo',     name: 'Combo vua',              description: 'Ghép liên tiếp 5 combo trong 1 ván',  game_id: match3Id },
    { code: 'social_butterfly', name: 'Kết giao',               description: 'Kết bạn với 5 người',                 game_id: null },
    { code: 'reviewer',         name: 'Nhà phê bình',           description: 'Đánh giá 3 game khác nhau',           game_id: null },
  ]);

  // ── RANKINGS ──────────────────────────────────────────────────
  const clients = users.filter((u) => u.role !== 'admin');
  const rankingRows = [];
  for (const u of clients) {
    for (const g of games) {
      rankingRows.push({
        user_id:     u.id,
        game_id:     g.id,
        wins:        Math.floor(Math.random() * 20),
        losses:      Math.floor(Math.random() * 15),
        draws:       Math.floor(Math.random() * 5),
        total_score: Math.floor(Math.random() * 5000),
      });
    }
  }
  await knex('rankings').insert(rankingRows);

  // ── FRIENDSHIPS ───────────────────────────────────────────────
  const [p1, p2, p3, p4] = clients;
  await knex('friendships').insert([
    { requester_id: p1.id, receiver_id: p2.id, status: 'accepted' },
    { requester_id: p1.id, receiver_id: p3.id, status: 'accepted' },
    { requester_id: p2.id, receiver_id: p3.id, status: 'pending' },
    { requester_id: p3.id, receiver_id: p4.id, status: 'accepted' },
  ]);

  // ── MESSAGES ──────────────────────────────────────────────────
  await knex('messages').insert([
    { sender_id: p1.id, receiver_id: p2.id, content: 'Chơi một ván caro không bạn?' },
    { sender_id: p2.id, receiver_id: p1.id, content: 'OK, vào game thôi!', is_read: true },
    { sender_id: p3.id, receiver_id: p1.id, content: 'Cho mình thêm bạn với nhé!' },
    { sender_id: p1.id, receiver_id: p3.id, content: 'Đồng ý rồi, kết bạn nhé!' },
  ]);

  // ── GAME RATINGS ──────────────────────────────────────────────
  await knex('game_ratings').insert([
    { user_id: p1.id, game_id: games[0].id, rating: 5, comment: 'Game hay lắm, rất vui!' },
    { user_id: p2.id, game_id: games[2].id, rating: 4, comment: 'Thú vị, cần thêm tính năng hint' },
    { user_id: p3.id, game_id: games[3].id, rating: 5, comment: 'Rắn săn mồi hồi nhỏ hay quá!' },
    { user_id: p4.id, game_id: games[4].id, rating: 4, comment: 'Ghép hàng 3 rất nghiện!' },
  ]);

  console.log('Seed completed!');
  console.log(`   Users    : ${users.length}`);
  console.log(`   Games    : ${games.length}`);
  console.log(`   Rankings : ${rankingRows.length}`);
};