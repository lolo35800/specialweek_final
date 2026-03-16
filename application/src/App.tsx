import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Feed from './pages/Feed'
import Comprendre from './pages/Comprendre'
import Jouer from './pages/Jouer'
import Quiz from './pages/Quiz'
import ReglesAntiDesinfo from './pages/ReglesAntiDesinfo'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import EditProfile from './pages/EditProfile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<EditProfile />} />
            <Route path="comprendre" element={<Comprendre />} />
            <Route path="jouer" element={<Jouer />} />
            <Route path="jouer/quiz" element={<Quiz />} />
            <Route path="regles" element={<ReglesAntiDesinfo />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
