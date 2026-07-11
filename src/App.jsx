import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import Navbar         from './components/Navbar'
import Footer         from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home           from './pages/Home'
import Services       from './pages/Services'
import ServicePage    from './pages/ServicePage'
import Gallery        from './pages/Gallery'
import About          from './pages/About'
import Contact        from './pages/Contact'
import AreaPage       from './pages/AreaPage'
import Blog           from './pages/Blog'
import BlogPost       from './pages/BlogPost'
import NotFound       from './pages/NotFound'
import LeadPopup       from './components/LeadPopup'

const AdminApp = lazy(() => import('./admin/AdminApp'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <main className="flex-1">
        <Outlet/>
      </main>
      <Footer/>
      <WhatsAppButton/>
      <LeadPopup />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollTop/>
      <Routes>
        <Route path="/admin/*" element={
          <Suspense fallback={<div className="min-h-screen bg-dark-950" />}>
            <AdminApp/>
          </Suspense>
        }/>

        <Route element={<PublicLayout/>}>
          <Route path="/"                 element={<Home/>}/>
          <Route path="/services"         element={<Services/>}/>
          <Route path="/interior-painting" element={<ServicePage/>}/>
          <Route path="/exterior-painting" element={<ServicePage/>}/>
          <Route path="/waterproofing"     element={<ServicePage/>}/>
          <Route path="/texture-painting"  element={<ServicePage/>}/>
          <Route path="/commercial-painting" element={<ServicePage/>}/>
          <Route path="/pop-wall-putty"    element={<ServicePage/>}/>
          <Route path="/wood-polish"       element={<ServicePage/>}/>
          <Route path="/metal-painting"    element={<ServicePage/>}/>
          <Route path="/stencil-wall-art"  element={<ServicePage/>}/>
          <Route path="/gallery"          element={<Gallery/>}/>
          <Route path="/about"            element={<About/>}/>
          <Route path="/contact"          element={<Contact/>}/>
          <Route path="/noida"            element={<AreaPage area="noida" />} />
          <Route path="/greater-noida"    element={<AreaPage area="greater-noida" />} />
          <Route path="/dadri"            element={<AreaPage area="dadri" />} />
          <Route path="/ghaziabad"        element={<AreaPage area="ghaziabad" />} />
          <Route path="/blog"             element={<Blog/>}/>
          <Route path="/blog/painting-cost-noida-2025" element={<BlogPost slug="painting-cost-noida-2025" />} />
          <Route path="*"                 element={<NotFound/>}/>
        </Route>
      </Routes>
    </>
  )
}
