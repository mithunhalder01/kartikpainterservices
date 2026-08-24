import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Images, Quote, FileText, Settings, Wrench, Home,
  ArrowLeft, LogOut, Bell, ChevronDown, HardHat, CalendarCheck, ScrollText, Menu, X,
  ReceiptText, Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

const ADMIN_NAV = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/leads',        label: 'Leads',         icon: Users },
  { to: '/admin/quotations',   label: 'Quotations',    icon: ReceiptText },
  { to: '/admin/khata',        label: 'Khata',         icon: Wallet },
  { to: '/admin/labour',       label: 'Labour',        icon: HardHat },
  { to: '/admin/attendance',   label: 'Attendance',    icon: CalendarCheck },
  { to: '/admin/letterpad',    label: 'Letter Pad',    icon: ScrollText },
  { to: '/admin/home',         label: 'Home Page',     icon: Home },
  { to: '/admin/services',     label: 'Services',      icon: Wrench },
  { to: '/admin/gallery',      label: 'Gallery',       icon: Images },
  { to: '/admin/testimonials', label: 'Testimonials',  icon: Quote },
  { to: '/admin/about',        label: 'About Page',    icon: FileText },
]

// labour sign-ins only ever get their own attendance
const LABOUR_NAV = [
  { to: '/admin/my-attendance', label: 'My Attendance', icon: CalendarCheck },
]

const navItemClass = ({ isActive }) => `flex items-center gap-3 h-10 px-[19px] rounded-xl text-[13px] font-medium
  whitespace-nowrap overflow-hidden transition-colors shrink-0
  ${isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`

const labelClass = 'lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminLayout() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const NAV = isAdmin ? ADMIN_NAV : LABOUR_NAV
  const navigate = useNavigate()

  const { data: notif } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/admin/dashboard/notifications'),
    refetchInterval: 30000,
    enabled: isAdmin,
  })

  // the drawer is an overlay on phones, so the page behind it must not scroll
  useEffect(() => {
    if (!navOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [navOpen])

  const closeNav = () => setNavOpen(false)

  const handleLogout = async () => {
    closeNav()
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="h-screen bg-base flex overflow-hidden">
      {/* backdrop — phones only */}
      {navOpen && (
        <div onClick={closeNav} className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-hidden="true" />
      )}

      <aside className={`group flex flex-col shrink-0 bg-white border border-border shadow-sm
                        transition-transform duration-200 ease-out overflow-hidden
                        fixed inset-y-0 left-0 z-50 w-64 rounded-r-2xl
                        lg:static lg:z-auto lg:my-3 lg:ml-3 lg:rounded-2xl lg:translate-x-0
                        lg:w-16 lg:hover:w-60 lg:transition-[width]
                        ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-[19px] shrink-0">
          <div className="w-7 h-7 bg-dark rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[11px]">KP</span>
          </div>
          <span className={`ml-3 text-[13px] font-semibold text-text-primary whitespace-nowrap ${labelClass}`}>
            {isAdmin ? 'Kartik Admin' : 'Kartik Crew'}
          </span>
          <button onClick={closeNav}
            className="ml-auto p-1.5 -mr-1 text-text-muted hover:text-text-primary rounded-md lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={closeNav} className={navItemClass}>
              <Icon size={18} className="shrink-0" />
              <span className={labelClass}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-border py-2 px-2 space-y-0.5 shrink-0">
          <Link to="/" onClick={closeNav} className={navItemClass({ isActive: false })}>
            <ArrowLeft size={18} className="shrink-0" />
            <span className={labelClass}>Back to Site</span>
          </Link>
          {isAdmin && (
            <NavLink to="/admin/settings" onClick={closeNav} className={navItemClass}>
              <Settings size={18} className="shrink-0" />
              <span className={labelClass}>Settings</span>
            </NavLink>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 h-10 px-[19px] rounded-xl text-[13px] font-medium
                       whitespace-nowrap overflow-hidden transition-colors shrink-0 w-full
                       text-red-600 hover:bg-red-50">
            <LogOut size={18} className="shrink-0" />
            <span className={labelClass}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="mx-3 sm:mx-4 mt-3 mb-4 rounded-2xl bg-white border border-border
                           shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-16 flex items-center justify-between
                           gap-2 px-3 sm:px-5 shrink-0">
          <button onClick={() => setNavOpen(true)} aria-label="Open menu"
            className="p-2 -ml-1 text-text-muted hover:text-text-primary hover:bg-surface rounded-lg transition-colors lg:hidden">
            <Menu size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-0.5">
              {isAdmin ? 'Admin' : 'Labour'}
            </p>
            <p className="text-[14px] font-semibold text-text-primary leading-none truncate">
              {greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Notification bell */}
            <div className={`relative ${isAdmin ? '' : 'hidden'}`}>
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
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
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
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronDown size={14} className="text-text-muted" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-1">
                      {isAdmin ? 'Admin' : user?.designation || 'Labour'}
                    </p>
                    <p className="text-[13px] font-semibold text-text-primary truncate">{user?.name}</p>
                    <p className="text-[12px] text-text-muted truncate">{user?.email || user?.phone}</p>
                  </div>
                  {isAdmin && (
                    <NavLink to="/admin/settings" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-text-muted hover:text-text-primary hover:bg-surface transition-colors">
                      <Settings size={14} /> Settings
                    </NavLink>
                  )}
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

        <main className="flex-1 px-3 sm:px-4 pt-2 pb-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
