import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Footer from './Footer'
import ChatBot from '../chatbot/ChatBot'
import RacingBackground from '../game/RacingBackground'
import './Layout.css'
import './BottomNav.css'

export default function Layout() {
  return (
    <div className="layout">
      <RacingBackground />
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ChatBot />
    </div>
  )
}
