import 'dotenv/config'
import mongoose from 'mongoose'
import Service from '../models/Service.js'
import Testimonial from '../models/Testimonial.js'
import SiteContent from '../models/SiteContent.js'
import { services, testimonials, team, brands, areas, stats } from '../../src/data/data.js'

const HOME_SECTIONS = {
  whyChooseUs: {
    heading: "Quality you can see.\nHonesty you can trust.",
    paragraph: "We don't cut corners, use inferior materials, or surprise you with extra bills. Every project gets the same level of care — whether it's one room or an entire building.",
    image: '/why-chose.jpeg',
    ctaLabel: 'Book Free Site Visit',
    points: [
      { title: 'On-Time Delivery', desc: 'The date we commit to is the date we deliver. No excuses.' },
      { title: 'Premium Brands Only', desc: 'Genuine Asian Paints, Berger and Dulux — verified, never substituted.' },
      { title: 'Transparent Quotes', desc: 'Full written estimate before work starts. No hidden charges.' },
      { title: 'Clean Site Guarantee', desc: 'We protect your furniture and leave the space spotless.' },
    ],
  },
}

const ABOUT_SECTIONS = {
  hero: {
    heading: '15 years of craft.\nOne standard.',
    subheading: "Since 2009, we've been the name Noida families and businesses trust.",
  },
  story: {
    heading: "From two workers to Noida's most trusted",
    paragraph1: 'In 2009, Kartik Halder started with two workers and one principle: do honest work, use good materials, and treat every home as your own.',
    paragraph2: "That reputation spread — one satisfied client at a time. Today, 15+ skilled professionals cover Noida, Greater Noida, Dadri and beyond. The principle hasn't changed.",
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  },
  stats,
  team,
  brands,
  areas,
}

const ICON_NAMES = {
  interior: 'Home',
  exterior: 'Building2',
  waterproofing: 'Droplets',
  texture: 'Sparkles',
  commercial: 'Briefcase',
  pop: 'Layers',
  'wood-polish': 'Layers',
  'metal-painting': 'Layers',
  'stencil-wall-art': 'Sparkles',
}

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set')
  await mongoose.connect(process.env.MONGODB_URI)

  let servicesCreated = 0
  let servicesSkipped = 0
  for (const [i, s] of services.entries()) {
    const existing = await Service.findOne({ slug: s.slug })
    if (existing) { servicesSkipped++; continue }
    await Service.create({
      slug: s.slug,
      iconName: ICON_NAMES[s.id] || 'Layers',
      title: s.title,
      shortDesc: s.shortDesc,
      desc: s.desc,
      longDesc: s.longDesc,
      price: s.price,
      image: s.image,
      seoTitle: s.seoTitle,
      seoDesc: s.seoDesc,
      seoKeywords: s.seoKeywords || '',
      features: s.features || [],
      areas: s.areas || [],
      order: i,
      updatedBy: 'seed-script',
    })
    servicesCreated++
  }

  let testimonialsCreated = 0
  let testimonialsSkipped = 0
  for (const [i, t] of testimonials.entries()) {
    const existing = await Testimonial.findOne({ name: t.name, text: t.text })
    if (existing) { testimonialsSkipped++; continue }
    await Testimonial.create({
      name: t.name,
      location: t.loc || '',
      stars: t.stars,
      text: t.text,
      order: i,
      updatedBy: 'seed-script',
    })
    testimonialsCreated++
  }

  console.log(`Services: ${servicesCreated} created, ${servicesSkipped} already existed`)
  console.log(`Testimonials: ${testimonialsCreated} created, ${testimonialsSkipped} already existed`)

  for (const [pageKey, sections] of [['home', HOME_SECTIONS], ['about', ABOUT_SECTIONS]]) {
    const existing = await SiteContent.findOne({ pageKey })
    if (existing) {
      console.log(`SiteContent "${pageKey}": already exists, skipped`)
      continue
    }
    await SiteContent.create({ pageKey, sections, updatedBy: 'seed-script' })
    console.log(`SiteContent "${pageKey}": created`)
  }

  await mongoose.disconnect()
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
