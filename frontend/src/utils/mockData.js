export const MOCK_ADMIN = {
  id: 'u1',
  username: 'admin',
  display_name: 'Admin System',
  email: 'admin@gmail.com',
  password: '123456',
  role: 'admin',
  avatar: 'https://i.pravatar.cc/150?img=1',
  bio: 'Quản trị hệ thống board game',
  created_at: '2026-03-01',
  status: 'active',
  total_score: 9999,
}

export const MOCK_USER = {
  id: 'u2',
  username: 'vana',
  display_name: 'Nguyễn Văn A',
  email: 'vana@gmail.com',
  password: '123456',
  role: 'user',
  avatar: 'https://i.pravatar.cc/150?img=2',
  bio: 'Thích chơi caro và tic-tac-toe',
  created_at: '2026-03-02',
  status: 'active',
  total_score: 520,
}

export const MOCK_USERS = [
  MOCK_ADMIN,
  MOCK_USER,
  {
    id: 'u3',
    username: 'thib',
    display_name: 'Trần Thị B',
    email: 'thib@gmail.com',
    password: '123456',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Fan game trí nhớ',
    created_at: '2026-03-03',
    status: 'active',
    total_score: 610,
  },
  {
    id: 'u4',
    username: 'minhc',
    display_name: 'Lê Minh C',
    email: 'minhc@gmail.com',
    password: '123456',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=4',
    bio: 'Chơi match-3 giải trí',
    created_at: '2026-03-04',
    status: 'active',
    total_score: 410,
  },
  {
    id: 'u5',
    username: 'thud',
    display_name: 'Phạm Thu D',
    email: 'thud@gmail.com',
    password: '123456',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Thích game rắn săn mồi',
    created_at: '2026-03-05',
    status: 'active',
    total_score: 700,
  },
]

export const MOCK_GAMES_ADMIN = [
  {
    id: 'g1',
    slug: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    board_size: 3,
    enabled: true,
    category: 'board',
    total_plays: 20,
    rating_avg: 4.5,
    description: 'Trò chơi 3x3 kinh điển.',
    instructions: [
      'Người chơi đánh X, máy đánh O.',
      'Tạo 3 ô liên tiếp để thắng.',
      'Dùng các nút điều khiển để chọn ô.',
    ],
  },
  {
    id: 'g2',
    slug: 'caro-4',
    name: 'Caro Hàng 4',
    board_size: 8,
    enabled: true,
    category: 'board',
    total_plays: 18,
    rating_avg: 4.3,
    description: 'Tạo 4 ô liên tiếp để chiến thắng.',
    instructions: [
      'Đặt quân vào ô trống.',
      'Tạo 4 quân liên tiếp để thắng.',
      'Máy đi ngẫu nhiên hợp lệ.',
    ],
  },
  {
    id: 'g3',
    slug: 'caro-5',
    name: 'Caro Hàng 5',
    board_size: 10,
    enabled: true,
    category: 'board',
    total_plays: 30,
    rating_avg: 4.7,
    description: 'Tạo 5 ô liên tiếp để chiến thắng.',
    instructions: [
      'Đặt quân vào ô trống.',
      'Tạo 5 quân liên tiếp để thắng.',
      'Có thể lưu và tải lại ván chơi.',
    ],
  },
  {
    id: 'g4',
    slug: 'snake',
    name: 'Rắn Săn Mồi',
    board_size: 12,
    enabled: true,
    category: 'arcade',
    total_plays: 14,
    rating_avg: 4.1,
    description: 'Điều khiển rắn ăn mồi để tăng điểm.',
    instructions: [
      'Điều khiển hướng di chuyển của rắn.',
      'Ăn mồi để tăng điểm.',
      'Tránh va vào tường hoặc thân.',
    ],
  },
  {
    id: 'g5',
    slug: 'match-3',
    name: 'Ghép Hàng 3',
    board_size: 8,
    enabled: true,
    category: 'puzzle',
    total_plays: 11,
    rating_avg: 4.0,
    description: 'Ghép ít nhất 3 ô cùng màu.',
    instructions: [
      'Chọn 2 ô kề nhau để đổi chỗ.',
      'Tạo hàng hoặc cột có 3 ô cùng màu.',
      'Ghi điểm khi ghép thành công.',
    ],
  },
  {
    id: 'g6',
    slug: 'memory',
    name: 'Cờ Trí Nhớ',
    board_size: 4,
    enabled: true,
    category: 'memory',
    total_plays: 17,
    rating_avg: 4.4,
    description: 'Lật các cặp ô giống nhau.',
    instructions: [
      'Lật 2 ô mỗi lượt.',
      'Nếu giống nhau thì giữ nguyên.',
      'Nếu khác nhau thì úp lại.',
    ],
  },
  {
    id: 'g7',
    slug: 'free-draw',
    name: 'Bảng Vẽ Tự Do',
    board_size: 16,
    enabled: true,
    category: 'creative',
    total_plays: 18,
    rating_avg: 4.2,
    description: 'Tô màu tự do trên bàn game.',
    instructions: [
      'Chọn ô trên bàn.',
      'Nhấn Enter để tô ô.',
      'Có thể xóa hoặc làm mới toàn bộ bảng.',
    ],
  },
]

export const MOCK_FRIENDS = [
  {
    id: 'f1',
    user_id: 'u2',
    friend_id: 'u3',
    name: 'Trần Thị B',
    username: 'thib',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'accepted',
  },
  {
    id: 'f2',
    user_id: 'u2',
    friend_id: 'u5',
    name: 'Phạm Thu D',
    username: 'thud',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'accepted',
  },
]

export const MOCK_FRIEND_REQUESTS = [
  {
    id: 'fr1',
    from_user_id: 'u4',
    from_name: 'Lê Minh C',
    from_username: 'minhc',
    avatar: 'https://i.pravatar.cc/150?img=4',
    status: 'pending',
  },
]

export const MOCK_MESSAGES = [
  {
    id: 'm1',
    conversation_id: 'c1',
    sender_id: 'u2',
    receiver_id: 'u3',
    sender_name: 'Nguyễn Văn A',
    content: 'Chơi caro không?',
    created_at: '2026-03-20 09:00',
  },
  {
    id: 'm2',
    conversation_id: 'c1',
    sender_id: 'u3',
    receiver_id: 'u2',
    sender_name: 'Trần Thị B',
    content: 'Có nè, vào game đi.',
    created_at: '2026-03-20 09:01',
  },
  {
    id: 'm3',
    conversation_id: 'c2',
    sender_id: 'u5',
    receiver_id: 'u2',
    sender_name: 'Phạm Thu D',
    content: 'Hôm nay ranking cao ghê.',
    created_at: '2026-03-20 10:15',
  },
]

export const MOCK_ACHIEVEMENTS = [
  {
    id: 'a1',
    title: 'Người chơi mới',
    description: 'Hoàn thành trận đầu tiên',
    unlocked: true,
    unlocked_at: '2026-03-10',
  },
  {
    id: 'a2',
    title: 'Cao thủ caro',
    description: 'Thắng 5 trận caro',
    unlocked: true,
    unlocked_at: '2026-03-15',
  },
  {
    id: 'a3',
    title: 'Kiên trì',
    description: 'Đăng nhập 7 ngày liên tiếp',
    unlocked: false,
    unlocked_at: null,
  },
]

export const MOCK_RANKING = [
  {
    id: 'r1',
    game_slug: 'tic-tac-toe',
    username: 'vana',
    display_name: 'Nguyễn Văn A',
    score: 120,
    type: 'system',
  },
  {
    id: 'r2',
    game_slug: 'tic-tac-toe',
    username: 'thib',
    display_name: 'Trần Thị B',
    score: 100,
    type: 'system',
  },
  {
    id: 'r3',
    game_slug: 'caro-5',
    username: 'thud',
    display_name: 'Phạm Thu D',
    score: 220,
    type: 'friends',
  },
  {
    id: 'r4',
    game_slug: 'memory',
    username: 'minhc',
    display_name: 'Lê Minh C',
    score: 180,
    type: 'personal',
  },
]

export const MOCK_STATS = {
  total_users: 5,
  total_games: 7,
  total_matches: 128,
  total_comments: 12,
  hottest_game: 'Caro Hàng 5',
}

export const MOCK_ADMIN_USERS = MOCK_USERS.map((user) => ({
  id: user.id,
  username: user.username,
  display_name: user.display_name,
  email: user.email,
  role: user.role,
  status: user.status,
  total_score: user.total_score,
}))

export const MOCK_ADMIN_USERS_RAW = MOCK_USERS

export const MOCK_GAMES = MOCK_GAMES_ADMIN.map((game) => ({
  id: game.id,
  slug: game.slug,
  name: game.name,
  description: game.description,
  enabled: game.enabled,
  board_size: game.board_size,
  category: game.category,
  instructions: game.instructions,
}))

export const MOCK_COMMENTS = [
  {
    id: 'cm1',
    game_id: 'g1',
    game_slug: 'tic-tac-toe',
    username: 'vana',
    display_name: 'Nguyễn Văn A',
    rating: 5,
    content: 'Game dễ chơi, giao diện rõ ràng.',
    created_at: '2026-03-20 08:00',
  },
  {
    id: 'cm2',
    game_id: 'g3',
    game_slug: 'caro-5',
    username: 'thib',
    display_name: 'Trần Thị B',
    rating: 4,
    content: 'Caro 5 ổn, nên thêm AI mạnh hơn.',
    created_at: '2026-03-20 08:30',
  },
  {
    id: 'cm3',
    game_id: 'g6',
    game_slug: 'memory',
    username: 'minhc',
    display_name: 'Lê Minh C',
    rating: 5,
    content: 'Game trí nhớ vui, dễ chơi.',
    created_at: '2026-03-20 09:00',
  },
]

export const MOCK_SAVES = [
  {
    id: 'sv1',
    user_id: 'u2',
    game_slug: 'tic-tac-toe',
    saved_at: '2026-03-20 11:00',
    state: {
      board: ['X', 'O', null, null, 'X', null, 'O', null, null],
      current_player: 'X',
      score: 20,
      time_left: 45,
    },
  },
  {
    id: 'sv2',
    user_id: 'u2',
    game_slug: 'caro-5',
    saved_at: '2026-03-20 11:15',
    state: {
      board: [],
      current_player: 'X',
      score: 80,
      time_left: 120,
    },
  },
]