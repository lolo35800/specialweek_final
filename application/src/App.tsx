import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthGate } from './components/auth/AuthGate'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Comprendre from './pages/Comprendre'
import CleDetail from './pages/CleDetail'
import Jouer from './pages/Jouer'
import Quiz from './pages/Quiz'
import FakeOrReal from './pages/FakeOrReal'
import SpotTheZone from './pages/SpotTheZone'
import FindInconsistencies from './pages/FindInconsistencies'
import ReglesAntiDesinfo from './pages/ReglesAntiDesinfo'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import EditProfile from './pages/EditProfile'
import NotFound from './pages/NotFound'
import ActusPage from './pages/ActusPage'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <AuthGate>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="actus" element={<ActusPage />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="feed" element={<Feed />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<EditProfile />} />
            <Route path="comprendre" element={<Comprendre />} />
            <Route path="comprendre/:slug" element={<CleDetail />} />
            <Route path="jouer" element={<Jouer />} />
            <Route path="jouer/quiz" element={<Quiz />} />
            <Route path="jouer/fake-ou-reel" element={<FakeOrReal />} />
            <Route path="jouer/spot-the-zone" element={<SpotTheZone />} />
            <Route path="jouer/incoherences" element={<FindInconsistencies />} />
            <Route path="regles" element={<ReglesAntiDesinfo />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  )
}
