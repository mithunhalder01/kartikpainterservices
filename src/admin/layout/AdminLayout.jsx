import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Images, Quote, FileText, Settings, Wrench,
  ChevronLeft, ChevronRight, LogOut, Bell, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

const NAV = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/leads',        label: 'Leads',         icon: Users },
  { to: '/admin/services',     label: 'Services',      icon: Wrench },
  { to: '/admin/gallery',      label: 'Gallery',       icon: Images },
  { to: '/admin/testimonials', label: 'Testimonials',  icon: Quote },
  { to: '/admin/about',        label: 'About Page',    icon: FileText },
  { to: '/admin/settings',     label: 'Settings',      icon: Settings },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const { data: notif } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/admin/dashboard/notifications'),
    refetchInterval: 30000,
  })

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-base flex">
      {/* Sidebar */}
      <aside className={`bg-dark-950 text-white flex flex-col transition-all duration-200
        ${collapsed ? 'w-[68px]' : 'w-60'} shrink-0`}>
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
            <span className="text-dark font-bold text-[12px]">KP</span>
          </div>
          {!collapsed && <span className="ml-2.5 text-[13px] font-semibold truncate">Kartik Admin</span>}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors
                ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => setCollapsed((c) => !c)}
          className="h-12 flex items-center justify-center text-white/50 hover:text-white border-t border-white/10 transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-[14px] font-semibold text-text-primary">
              {greeting()}{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => { setBellOpen((o) => !o); setProfileOpen(false) }}
                className="relative p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-md transition-colors">
                <Bell size={18} />
                {notif?.count > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold
                                    rounded-full flex items-center justify-center">
                    {notif.count > 9 ? '9+' : notif.count}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[13px] font-semibold text-text-primary">New Leads</p>
                  </div>
                  {notif?.latest?.length ? (
                    <div className="max-h-72 overflow-y-auto">
                      {notif.latest.map((lead) => (
                        <button key={lead._id}
                          onClick={() => { setBellOpen(false); navigate('/admin/leads') }}
                          className="w-full text-left px-4 py-2.5 hover:bg-surface transition-colors border-b border-border last:border-0">
                          <p className="text-[13px] font-medium text-text-primary">{lead.name}</p>
                          <p className="text-[12px] text-text-muted">{lead.phone} · {lead.serviceInterested || 'General'}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-[13px] text-text-muted text-center">No new leads</p>
                  )}
                  <button onClick={() => { setBellOpen(false); navigate('/admin/leads') }}
                    className="w-full text-center py-2.5 text-[12px] font-semibold text-accent hover:bg-surface transition-colors">
                    View all leads
                  </button>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button onClick={() => { setProfileOpen((o) => !o); setBellOpen(false) }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 hover:bg-surface rounded-md transition-colors">
                <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[12px] font-bold">
                  {admin?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronDown size={14} className="text-text-muted" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{admin?.name}</p>
                    <p className="text-[12px] text-text-muted truncate">{admin?.email}</p>
                  </div>
                  <NavLink to="/admin/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                    <Settings size={14} /> Settings
                  </NavLink>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
