import 'dotenv/config'
import mongoose from 'mongoose'
import Service from '../models/Service.js'
import Testimonial from '../models/Testimonial.js'
import { services, testimonials } from '../../src/data/data.js'

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

  await mongoose.disconnect()
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
