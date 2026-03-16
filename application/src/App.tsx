import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Comprendre from './pages/Comprendre'
import Illustrer from './pages/Illustrer'
import Jouer from './pages/Jouer'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import ReglesAntiDesinfo from './pages/ReglesAntiDesinfo'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="comprendre" element={<Comprendre />} />
          <Route path="illustrer" element={<Illustrer />} />
          <Route path="jouer" element={<Jouer />} />
          <Route path="jouer/quiz" element={<Quiz />} />
          <Route path="jouer/fake-ou-reel" element={<div style={{padding:'40px',textAlign:'center'}}>🕵️ Fake ou Réel — J3</div>} />
          <Route path="jouer/spot-the-zone" element={<div style={{padding:'40px',textAlign:'center'}}>🔍 Spot the Zone — J3</div>} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="regles" element={<ReglesAntiDesinfo />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
