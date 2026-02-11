import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-base px-6 py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto,1fr] gap-6">
        <Sidebar />
        <main className="space-y-8">
          <TopBar />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
