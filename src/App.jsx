import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar         from './components/Navbar'
import Footer         from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home           from './pages/Home'
import Services       from './pages/Services'
import Gallery        from './pages/Gallery'
import About          from './pages/About'
import Contact        from './pages/Contact'
import AreaPage       from './pages/AreaPage'
import BlogPost       from './pages/BlogPost'
import NotFound       from './pages/NotFound'
import LeadPopup       from './components/LeadPopup'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollTop/>
      <Navbar/>
      <main className="flex-1">
        <Routes>
          <Route path="/"                 element={<Home/>}/>
          <Route path="/services"         element={<Services/>}/>
          <Route path="/gallery"          element={<Gallery/>}/>
          <Route path="/about"            element={<About/>}/>
          <Route path="/contact"          element={<Contact/>}/>
          <Route path="/noida"            element={<AreaPage area="noida" />} />
          <Route path="/greater-noida"    element={<AreaPage area="greater-noida" />} />
          <Route path="/dadri"            element={<AreaPage area="dadri" />} />
          <Route path="/ghaziabad"        element={<AreaPage area="ghaziabad" />} />
          <Route path="/blog/painting-cost-noida-2025" element={<BlogPost slug="painting-cost-noida-2025" />} />
          <Route path="*"                 element={<NotFound/>}/>
        </Routes>
      </main>
      <Footer/>
      <WhatsAppButton/>
      <LeadPopup />
    </div>
  )
}
