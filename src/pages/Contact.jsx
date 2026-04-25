import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle, Send } from 'lucide-react'
import { contact, PHONE, WA_NUMBER } from '../data/data'
import SEO, { buildBreadcrumbSchema } from '../components/SEO'

const svcOptions = [
  'Interior Painting','Exterior Painting','Waterproofing',
  'Texture / Designer Painting','Commercial Painting',
  'POP & Wall Putty','Multiple Services',
]

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Kartik Painter Services',
  description: 'Get a free painting estimate in Noida. Call, WhatsApp or fill the form.',
  url: 'https://kartikpainterservices.vercel.app/contact',
}

const contactBreadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
])

const WA = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function Contact() {
  const [form, setForm] = useState({ name:'',phone:'',email:'',city:'',service:'',message:'' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [waPrefillUrl, setWaPrefillUrl] = useState(`https://wa.me/${WA_NUMBER}`)

  const validate = () => {
    const e={}
    if(!form.name.trim()) e.name='Name is required'
    if(!form.phone.trim()||form.phone.replace(/\D/g,'').length<10) e.phone='Valid phone number required'
    if(form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email='Valid email required'
    return e
  }
  const handle = e => {
    setForm({ ...form, [e.target.name]:e.target.value })
    setErrors({ ...errors, [e.target.name]:'' })
    setSubmitError('')
  }

  const buildWaUrl = () => {
    const lines = [
      'Hello Kartik Painter Services,',
      '',
      'I need a painting estimate.',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      form.email.trim()   ? `Email: ${form.email.trim()}`     : null,
      form.city.trim()    ? `Area: ${form.city.trim()}`       : null,
      form.service.trim() ? `Service: ${form.service.trim()}` : null,
      form.message.trim() ? `Details: ${form.message.trim()}` : null,
    ].filter(Boolean)
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const submit = (evt) => {
    evt.preventDefault()
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setErrors({})
    const waUrl = buildWaUrl()
    setWaPrefillUrl(waUrl)
    const popup = window.open(waUrl, '_blank', 'noopener,noreferrer')
    if (!popup) {
      setSubmitError('WhatsApp did not open automatically. Use the button below.')
    }
    setSent(true)
  }

  return (
    <>
      <SEO
        title="Contact – Free Painting Estimate in Noida"
        description="Get a free painting estimate in Noida. Call +91 7500770667, WhatsApp or fill the form. Kartik Painter Services responds within the hour."
        canonical="/contact"
        schema={[contactSchema, contactBreadcrumbSchema]}
        keywords="contact painter noida, free painting estimate noida, painter phone number noida"
      />

      <section className="page-hero py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="label text-accent-300">Contact</p>
          <h1 className="text-display-lg font-black text-white max-w-xl mb-4">
            Let's discuss
            <br/>your project.
          </h1>
          <p className="text-white/50 text-[16px] max-w-lg">
            Free site visit and estimate — we respond within the hour.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="font-bold text-[22px] text-text-primary mb-1">Request an estimate</h2>
            <p className="text-text-muted text-[14px] mb-8">We reply within 24 hours — usually within the hour.</p>

            {sent ? (
              <div className="border border-green-200 bg-green-50 rounded-2xl p-12 text-center">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-4"/>
                <h3 className="font-bold text-[22px] text-text-primary mb-2">Message Received</h3>
                <p className="text-text-muted text-[14px] mb-6">We'll call back shortly — usually within the hour.</p>
                {submitError && (
                  <p className="text-amber-700 text-[12px] mb-4">{submitError}</p>
                )}
                <a href={waPrefillUrl} target="_blank" rel="noreferrer"
                   className="btn-accent text-[14px] inline-flex">
                  <WA/> Also chat on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.14em]
                                      text-text-subtle uppercase mb-2">Full Name *</label>
                    <input name="name" type="text" placeholder="Your name"
                           className={`field ${errors.name?'!border-red-400':''}`}
                           value={form.name} onChange={handle} autoComplete="name"/>
                    {errors.name&&<p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.14em]
                                      text-text-subtle uppercase mb-2">Phone Number *</label>
                    <input name="phone" type="tel" placeholder="+91 XXXXX XXXXX"
                           className={`field ${errors.phone?'!border-red-400':''}`}
                           value={form.phone} onChange={handle} autoComplete="tel"/>
                    {errors.phone&&<p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.14em]
                                      text-text-subtle uppercase mb-2">Email</label>
                    <input name="email" type="email" placeholder="you@example.com"
                           className="field" value={form.email} onChange={handle}/>
                    {errors.email&&<p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-[0.14em]
                                      text-text-subtle uppercase mb-2">Your Area</label>
                    <input name="city" type="text" placeholder="Sector 62, Noida"
                           className="field" value={form.city} onChange={handle}/>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em]
                                    text-text-subtle uppercase mb-2">Service</label>
                  <select name="service" className="field text-text-muted"
                          value={form.service} onChange={handle}>
                    <option value="">Select a service...</option>
                    {svcOptions.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em]
                                    text-text-subtle uppercase mb-2">Details</label>
                  <textarea name="message" rows={4} className="field resize-none"
                            placeholder="Property size, requirements or questions..."
                            value={form.message} onChange={handle}/>
                </div>
                <button type="submit" className="btn-accent w-full py-4 text-[15px]">
                  <Send size={15}/> Send Enquiry
                </button>
                <p className="text-center text-[11px] text-text-subtle">
                  Reply within 24 hours · Your details stay private
                </p>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-bold text-[22px] text-text-primary mb-6">Direct contact</h2>

            {[
              {Icon:Phone, label:'Phone',   v:contact.phone,   href:`tel:${contact.phone}`},
              {Icon:Mail,  label:'Email',    v:contact.email,   href:`mailto:${contact.email}`},
              {Icon:MapPin,label:'Address',  v:contact.address, href:null},
              {Icon:Clock, label:'Hours',    v:contact.timings, href:null},
            ].map(({Icon,label,v,href})=>(
              <div key={label} className="flex gap-3 items-start p-4 rounded-xl border border-border
                                          hover:border-dark/30 transition-colors">
                <div className="w-9 h-9 bg-surface rounded-lg flex items-center
                                justify-center flex-shrink-0">
                  <Icon size={15} className="text-text-muted"/>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-text-subtle uppercase mb-0.5">
                    {label}
                  </p>
                  {href
                    ? <a href={href} className="text-accent text-[14px] font-medium hover:text-accent-700 transition-colors">{v}</a>
                    : <p className="text-text-secondary text-[13px] leading-snug">{v}</p>}
                </div>
              </div>
            ))}

            <a href={`https://wa.me/${WA_NUMBER}?text=Hello%2C+I+need+a+painting+quote`}
               target="_blank" rel="noreferrer"
               className="flex items-center gap-3 bg-[#25D366] rounded-xl p-4
                          hover:bg-[#20b858] transition-colors">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center
                              justify-center flex-shrink-0 text-white">
                <WA/>
              </div>
              <div>
                <p className="font-semibold text-white text-[14px]">Chat on WhatsApp</p>
                <p className="text-white/70 text-[12px] mt-0.5">Typically replies in minutes</p>
              </div>
            </a>

            <div className="rounded-xl overflow-hidden border border-border">
              <iframe src={contact.mapEmbed} width="100%" height="200"
                      style={{border:0,display:'block'}} allowFullScreen loading="lazy"
                      title="Kartik Painter Services — Noida Location"/>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
