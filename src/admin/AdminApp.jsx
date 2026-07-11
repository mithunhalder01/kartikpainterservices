import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layout/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Testimonials from './pages/Testimonials'
import AboutEditor from './pages/AboutEditor'
import Settings from './pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px' } }} />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="services" element={<Services />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="about" element={<AboutEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}
