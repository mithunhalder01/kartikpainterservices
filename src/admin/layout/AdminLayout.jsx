import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Images, Quote, FileText, Settings, Wrench, Home,
  ArrowLeft, LogOut, Bell, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

const NAV = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/leads',        label: 'Leads',         icon: Users },
  { to: '/admin/home',         label: 'Home Page',     icon: Home },
  { to: '/admin/services',     label: 'Services',      icon: Wrench },
  { to: '/admin/gallery',      label: 'Gallery',       icon: Images },
  { to: '/admin/testimonials', label: 'Testimonials',  icon: Quote },
  { to: '/admin/about',        label: 'About Page',    icon: FileText },
]

const navItemClass = ({ isActive }) => `flex items-center gap-3 h-10 px-[19px] rounded-xl text-[13px] font-medium
  whitespace-nowrap overflow-hidden transition-colors shrink-0
  ${isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white hover:bg-white/5'}`

const labelClass = 'opacity-0 group-hover:opacity-100 transition-opacity duration-150'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminLayout() {
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
    <div className="h-screen bg-base flex overflow-hidden">
      {/* Spacer reserves layout width for the fixed, collapsed sidebar */}
      <div className="w-[88px] shrink-0" aria-hidden="true" />

      <aside className="group fixed left-3 top-3 bottom-3 z-40 flex flex-col
                        w-16 hover:w-60 bg-dark-950 rounded-2xl shadow-xl
                        transition-[width] duration-200 ease-out overflow-hidden">
        <div className="h-16 flex items-center px-[19px] shrink-0">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-dark font-bold text-[11px]">KP</span>
          </div>
          <span className={`ml-3 text-[13px] font-semibold text-white whitespace-nowrap ${labelClass}`}>Kartik Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navItemClass}>
              <Icon size={18} className="shrink-0" />
              <span className={labelClass}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 py-2 px-2 space-y-0.5 shrink-0">
          <Link to="/" className={navItemClass({ isActive: false })}>
            <ArrowLeft size={18} className="shrink-0" />
            <span className={labelClass}>Back to Site</span>
          </Link>
          <NavLink to="/admin/settings" className={navItemClass}>
            <Settings size={18} className="shrink-0" />
            <span className={labelClass}>Settings</span>
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center gap-3 h-10 px-[19px] rounded-xl text-[13px] font-medium
                       whitespace-nowrap overflow-hidden transition-colors shrink-0 w-full
                       text-red-300/80 hover:text-red-200 hover:bg-red-500/10">
            <LogOut size={18} className="shrink-0" />
            <span className={labelClass}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-3 z-30 mx-4 mb-4 rounded-2xl bg-white border border-border
                           shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-16 flex items-center justify-between px-5 shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">Admin</p>
            <p className="text-[14px] font-semibold text-text-primary leading-none">
              {greeting()}{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => { setBellOpen((o) => !o); setProfileOpen(false) }}
                className="relative p-2 text-text-muted hover:text-text-primary hover:bg-surface rounded-full transition-colors">
                <Bell size={18} />
                {notif?.count > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold
                                    rounded-full flex items-center justify-center">
                    {notif.count > 9 ? '9+' : notif.count}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
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
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 hover:bg-surface rounded-full transition-colors">
                <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[12px] font-bold">
                  {admin?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronDown size={14} className="text-text-muted" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-1">Admin</p>
                    <p className="text-[13px] font-semibold text-text-primary truncate">{admin?.name}</p>
                    <p className="text-[12px] text-text-muted truncate">{admin?.email}</p>
                  </div>
                  <NavLink to="/admin/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                    <Settings size={14} /> Settings
                  </NavLink>
                  <Link to="/" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                    <ArrowLeft size={14} /> Back to Site
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
