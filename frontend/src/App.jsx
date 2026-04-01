// Top-level route map for auth, client, admin, and game screens.
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

// Layouts
import AuthLayout   from '@/layouts/AuthLayout'
import ClientLayout from '@/layouts/ClientLayout'
import AdminLayout  from '@/layouts/AdminLayout'
import GameLayout   from '@/layouts/GameLayout'
import GameAvailabilityGuard from '@/components/game/GameAvailabilityGuard'

// Guards
import { PrivateRoute, AdminRoute, GuestRoute } from '@/routes/guards'

// Auth pages
import LoginPage    from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Client pages
import HomePage        from '@/pages/client/HomePage'          // Trang chủ
import GamesPage       from '@/pages/client/GamesPage'          // Danh sách game + đánh giá
import RankingPage     from '@/pages/client/RankingPage'        // Bảng xếp hạng
import FriendsPage     from '@/pages/client/FriendsPage'        // Bạn bè: tìm kiếm, kết bạn, lời mời
import MessagesPage    from '@/pages/client/MessagesPage'       // Nhắn tin với bạn bè
import AchievementsPage from '@/pages/client/AchievementsPage' // Thành tựu đã mở / chưa mở
import ProfilePage     from '@/pages/client/ProfilePage'        // Hồ sơ cá nhân
import UserProfilePage from '@/pages/client/UserProfilePage'   // Xem hồ sơ người khác
import RankingSimplePage from '@/pages/client/RankingSimplePage'

// Game pages
import GameSelectPage  from '@/pages/game/GameSelectPage'  // Chọn game
import CaroFivePage    from '@/pages/game/CaroFivePage'    // Caro 5 (vs máy + vs người qua socket)
import CaroFourPage    from '@/pages/game/CaroFourPage'    // Caro 4
import TicTacToePage   from '@/pages/game/TicTacToePage'  // Tic-tac-toe
import SnakePage       from '@/pages/game/SnakePage'       // Rắn săn mồi
import Match3Page      from '@/pages/game/Match3Page'      // Ghép hàng 3
import MemoryPage      from '@/pages/game/MemoryPage'      // Cờ trí nhớ
import DrawPage        from '@/pages/game/DrawPage'        // Bảng vẽ tự do

// Admin pages
import AdminDashboard  from '@/pages/admin/AdminDashboard'
import AdminUsers      from '@/pages/admin/AdminUsers'
import AdminGames      from '@/pages/admin/AdminGames'
import AdminStats      from '@/pages/admin/AdminStats'

export default function App() {
  const { initTheme } = useThemeStore()
  const verifyToken = useAuthStore((s) => s.verifyToken)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    initTheme()
    const token = useAuthStore.getState().token
    if (token) {
      verifyToken().finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  if (checking) return null

  return (
    <Routes>

      {/* Guest only */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Private - Client */}
      <Route element={<PrivateRoute />}>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/ranking" element={<RankingSimplePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessagesPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Route>

        {/* Game routes */}
        <Route element={<GameLayout />}>
          <Route path="/play" element={<GameSelectPage />} />
          <Route path="/play/caro5" element={<GameAvailabilityGuard slug="caro5"><CaroFivePage /></GameAvailabilityGuard>} />
          <Route path="/play/caro4" element={<GameAvailabilityGuard slug="caro4"><CaroFourPage /></GameAvailabilityGuard>} />
          <Route path="/play/tictactoe" element={<GameAvailabilityGuard slug="tictactoe"><TicTacToePage /></GameAvailabilityGuard>} />
          <Route path="/play/snake" element={<GameAvailabilityGuard slug="snake"><SnakePage /></GameAvailabilityGuard>} />
          <Route path="/play/match3" element={<GameAvailabilityGuard slug="match3"><Match3Page /></GameAvailabilityGuard>} />
          <Route path="/play/memory" element={<GameAvailabilityGuard slug="memory"><MemoryPage /></GameAvailabilityGuard>} />
          <Route path="/play/draw" element={<GameAvailabilityGuard slug="draw"><DrawPage /></GameAvailabilityGuard>} />
        </Route>
      </Route>

      {/* Admin only */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/games" element={<AdminGames />} />
          <Route path="/admin/stats" element={<AdminStats />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}
