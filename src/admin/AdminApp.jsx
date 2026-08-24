import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layout/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import HomeEditor from './pages/HomeEditor'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Testimonials from './pages/Testimonials'
import AboutEditor from './pages/AboutEditor'
import Settings from './pages/Settings'
import Labour from './pages/Labour'
import Attendance from './pages/Attendance'
import MyAttendance from './pages/MyAttendance'
import Letterpad from './pages/Letterpad'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

// labour never sees the site editors — their home is their own attendance
function RoleHome() {
  const { isAdmin } = useAuth()
  return isAdmin ? <Dashboard /> : <Navigate to="/admin/my-attendance" replace />
}

const adminOnly = (element) => <ProtectedRoute adminOnly>{element}</ProtectedRoute>

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px' } }} />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<RoleHome />} />

            {/* shared — labour gets a read-only view of their own record */}
            <Route path="my-attendance" element={<MyAttendance />} />

            {/* admin only */}
            <Route path="leads"        element={adminOnly(<Leads />)} />
            <Route path="labour"       element={adminOnly(<Labour />)} />
            <Route path="attendance"   element={adminOnly(<Attendance />)} />
            <Route path="letterpad"    element={adminOnly(<Letterpad />)} />
            <Route path="home"         element={adminOnly(<HomeEditor />)} />
            <Route path="services"     element={adminOnly(<Services />)} />
            <Route path="gallery"      element={adminOnly(<Gallery />)} />
            <Route path="testimonials" element={adminOnly(<Testimonials />)} />
            <Route path="about"        element={adminOnly(<AboutEditor />)} />
            <Route path="settings"     element={adminOnly(<Settings />)} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}
