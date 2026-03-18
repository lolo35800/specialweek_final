import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Footer from './Footer'
import ChatBot from '../chatbot/ChatBot'
import './Layout.css'
import './BottomNav.css'

export default function Layout() {
  return (
    <div className="layout">
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
