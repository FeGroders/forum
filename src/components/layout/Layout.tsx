import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex gap-6">
          {/* Sidebar - oculta em mobile */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Sidebar />
          </aside>
          {/* Conteúdo principal */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
