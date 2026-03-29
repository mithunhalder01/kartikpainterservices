import { Home, Building2, Droplets, Sparkles, Briefcase, Layers } from 'lucide-react'

export const PHONE     = '+91 7500770667'
export const PHONE_RAW = '917500770667'
export const WA_NUMBER = '917500770667'
export const EMAIL     = 'kartikpainterservices@gmail.com'

export const services = [
  {
    id: 'interior',
    Icon: Home,
    title: 'Interior Painting',
    shortDesc: 'Flawless finishes for living rooms, bedrooms and kitchens — using low-odour, washable paints that last.',
    desc: 'We use low-odour, washable premium paints for a smooth, lasting finish. Every project includes surface prep, wall putty, primer and two top coats.',
    price: '₹12 – ₹45 / sq.ft',
    image: '/living-room.jpeg',
    slug: 'interior-painting',
  },
  {
    id: 'exterior',
    Icon: Building2,
    title: 'Exterior Painting',
    shortDesc: 'Weather-resistant coatings that protect your home from rain, UV and humidity for 5+ years.',
    desc: 'Anti-fungal primer with a two-coat weather-shield system. Protects against rain, UV and humidity for 5+ years — and looks sharp doing it.',
    price: '₹40 – ₹60 / sq.ft',
    image: '/exterior-painting.jpeg',
    slug: 'exterior-painting',
  },
  {
    id: 'waterproofing',
    Icon: Droplets,
    title: 'Waterproofing',
    shortDesc: 'Permanent protection against seepage, leakage and damp walls — roof, bathroom or basement.',
    desc: 'Chemical-based waterproofing for roofs, bathrooms, basements and external walls. Includes crack filling, bonding coat and a final waterproof membrane.',
    price: 'Custom Quote',
    image: '/waterprofing.jpeg',
    slug: 'waterproofing',
  },
  {
    id: 'texture',
    Icon: Sparkles,
    title: 'Texture & Designer Painting',
    shortDesc: 'Sand, marble, 3D and geometric effects that make your walls a feature, not a background.',
    desc: 'From subtle sand-texture to bold feature walls — we work with specialist tools and imported materials to create looks that feel custom-designed.',
    price: '₹100 – ₹150 / sq.ft',
    image: '/texure.jpeg',
    slug: 'texture-painting',
  },
  {
    id: 'commercial',
    Icon: Briefcase,
    title: 'Commercial Painting',
    shortDesc: 'Large-scale painting for offices, showrooms and warehouses — with night shifts available.',
    desc: 'We handle commercial projects of any size with dedicated crews. Night shifts and weekend work available to keep your operations running.',
    price: 'Custom Quote',
    image: '/Commercial.jpeg',
    slug: 'commercial-painting',
  },
  {
    id: 'pop',
    Icon: Layers,
    title: 'POP & Wall Putty',
    shortDesc: 'Perfect surface preparation — the foundation of every great paint job.',
    desc: 'Wall putty, POP ceilings, false ceilings and cornice work. We ensure every surface is perfectly smooth before a single drop of paint goes on.',
    price: '₹60 – ₹80 / sq.ft',
    image: '/pop.jpeg',
    slug: 'pop-wall-putty',
  },
  {
    id: 'wood-polish',
    Icon: Layers,
    title: 'Wood Polish',
    shortDesc: 'Premium polish finishes for doors, wardrobes, furniture and wooden panels.',
    desc: 'We provide melamine, PU and touchwood polish for doors, wardrobes, railings and furniture. Includes sanding, stain matching and protective top coat for a smooth, long-lasting finish.',
    price: '₹60 – ₹80 / sq.ft',
    image: '/woodpolish.jpeg',
    slug: 'wood-polish',
  },
  {
    id: 'metal-painting',
    Icon: Layers,
    title: 'Metal Painting',
    shortDesc: 'Anti-rust primer and enamel coating for grills, gates, railings and metal frames.',
    desc: 'We clean rust, apply anti-corrosion primer and finish with durable enamel or PU coating. Best for gates, grills, stair railings and all outdoor metal surfaces.',
    price: '₹35 – ₹70 / sq.ft',
    image: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=700&h=480&fit=crop',
    slug: 'metal-painting',
  },
  {
    id: 'stencil-wall-art',
    Icon: Sparkles,
    title: 'Stencil & Wall Art',
    shortDesc: 'Custom stencil patterns and decorative wall art for premium feature walls.',
    desc: 'From geometric stencil designs to modern feature-wall art, we create custom decorative finishes with precise masking and long-lasting top coats.',
    price: '₹80 – ₹180 / sq.ft',
    image: '/Stencil.jpeg',
    slug: 'stencil-wall-art',
  },
]

export const gallery = [
  { id:1,  cat:'Interior',   label:'Living Room',          src:'/living-room.jpeg' },
  { id:2,  cat:'Exterior',   label:'Bungalow Exterior',    src:'/exterior-painting.jpeg' },
  { id:3,  cat:'Texture',    label:'Sand Texture Wall',    src:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=420&fit=crop' },
  { id:4,  cat:'Interior',   label:'Master Bedroom',       src:'/master-bed.jpeg' },
  { id:5,  cat:'Interior',   label:'Modern Kitchen',       src:'/kitchen.jpeg' },
  { id:6,  cat:'Commercial', label:'Corporate Office',     src:'/Corporate.jpeg' },
  { id:7,  cat:'Exterior',   label:'Apartment Block',      src:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=420&fit=crop' },
  { id:8,  cat:'Texture',    label:'3D Pattern',           src:'https://images.unsplash.com/photo-1600607688066-890987f18a86?w=600&h=420&fit=crop' },
  { id:9,  cat:'Interior',   label:"Children's Room",      src:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=420&fit=crop' },
  { id:10, cat:'Exterior',   label:'Villa Exterior',       src:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=420&fit=crop' },
  { id:11, cat:'Commercial', label:'Retail Showroom',      src:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=420&fit=crop' },
  { id:12, cat:'Texture',    label:'Marble Effect',        src:'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&h=420&fit=crop' },
]

export const testimonials = [
  { name:'Rahul Sharma',  loc:'Sector 62, Noida',       stars:5, text:'Entire 3BHK painted in 5 days — spotless work, zero disruption. The finish is genuinely better than I expected at this price.' },
  { name:'Priya Agarwal', loc:'Greater Noida West',     stars:5, text:'Waterproofing done 3 years ago, not a single leak since. Honest, on-time, and they cleaned up perfectly after the job.' },
  { name:'Deepak Verma',  loc:'Dadri, GB Nagar',        stars:5, text:'The texture work on our feature wall is stunning — people genuinely think we hired an interior designer.' },
  { name:'Sunita Yadav',  loc:'Noida Extension',        stars:5, text:'Office painted in night shifts so we had zero downtime. Professional team, no disruptions. Remarkable service.' },
]

export const team = [
  { name:'Kartik Halder', role:'Founder & Head Painter',   exp:'15+ yrs', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
  { name:'Suresh Kumar',  role:'Senior Painter',            exp:'10+ yrs', img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
  { name:'Mukesh Yadav',  role:'Texture Specialist',        exp:'8+ yrs',  img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face' },
  { name:'Ravi Singh',    role:'Waterproofing Expert',      exp:'7+ yrs',  img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
]

export const brands   = ['Asian Paints','Berger Paints','Dulux','Nippon Paint','JSW Paints']
export const areas    = ['Noida','Greater Noida','Dadri','Ghaziabad','Noida Extension','Greater Noida West','Jewar','Bulandshahr','Hapur']

export const stats = [
  { value:'500+', label:'Projects Done' },
  { value:'15+',  label:'Years Experience' },
  { value:'4.9',  label:'Google Rating' },
  { value:'100%', label:'On-Time Delivery' },
]

export const process = [
  { n:'01', t:'Call or WhatsApp',   d:'Reach out anytime — we respond within an hour.' },
  { n:'02', t:'Free Site Visit',    d:'We visit your property at your convenience — no charge.' },
  { n:'03', t:'Written Estimate',   d:'Clear itemised quote, every cost explained upfront.' },
  { n:'04', t:'Work Begins',        d:'We arrive on the agreed date and finish on time.' },
]

export const contact = {
  phone:    PHONE,
  phoneRaw: PHONE_RAW,
  whatsapp: WA_NUMBER,
  email:    EMAIL,
  address:  'Near Sector 45 Metro Station, Noida, UP – 201301',
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.2!2d77.3910!3d28.5672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a43173357b!2sNoida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890',
  timings:  'Monday – Saturday, 8:00 AM – 7:00 PM',
}
