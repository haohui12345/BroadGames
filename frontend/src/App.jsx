import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

// Layouts
import AuthLayout   from '@/layouts/AuthLayout'
import ClientLayout from '@/layouts/ClientLayout'
import AdminLayout  from '@/layouts/AdminLayout'
import GameLayout   from '@/layouts/GameLayout'

// Guards
import { PrivateRoute, AdminRoute, GuestRoute } from '@/routes/guards'

// Auth pages
import LoginPage    from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Client pages
import HomePage        from '@/pages/client/HomePage'
import GamesPage       from '@/pages/client/GamesPage'
import RankingPage     from '@/pages/client/RankingPage'
import FriendsPage     from '@/pages/client/FriendsPage'
import MessagesPage    from '@/pages/client/MessagesCenterPage'
import AchievementsPage from '@/pages/client/AchievementsPage'
import ProfilePage     from '@/pages/client/ProfileSettingsPage'
import UserProfilePage from '@/pages/client/UserProfileDetailsPage'

// Game pages
import GameSelectPage  from '@/pages/game/GameSelectPage'
import CaroFivePage    from '@/pages/game/CaroFivePage'
import CaroFourPage    from '@/pages/game/CaroFourPage'
import TicTacToePage   from '@/pages/game/TicTacToePage'
import SnakePage       from '@/pages/game/SnakeArcadePage'
import Match3Page      from '@/pages/game/Match3Page'
import MemoryPage      from '@/pages/game/MemoryPage'
import DrawPage        from '@/pages/game/DrawingBoardPage'

// Admin pages
import AdminDashboard  from '@/pages/admin/AdminDashboard'
import AdminUsers      from '@/pages/admin/AdminUsers'
import AdminGames      from '@/pages/admin/AdminGames'
import AdminStats      from '@/pages/admin/AdminStats'

export default function App() {
<<<<<<< HEAD
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
=======
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])
>>>>>>> 8aba81ce0b8f5a79bca0ab877b84250ae793342f

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
          <Route path="/ranking" element={<RankingPage />} />
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
          <Route path="/play/caro5" element={<CaroFivePage />} />
          <Route path="/play/caro4" element={<CaroFourPage />} />
          <Route path="/play/tictactoe" element={<TicTacToePage />} />
          <Route path="/play/snake" element={<SnakePage />} />
          <Route path="/play/match3" element={<Match3Page />} />
          <Route path="/play/memory" element={<MemoryPage />} />
          <Route path="/play/draw" element={<DrawPage />} />
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
