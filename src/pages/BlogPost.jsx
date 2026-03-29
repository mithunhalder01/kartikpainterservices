// src/pages/BlogPost.jsx
// Simple blog post template for SEO articles
import SEO from '../components/SEO'
import { Link } from 'react-router-dom'
import { PHONE } from '../data/data'
import { Phone } from 'lucide-react'

const posts = {
  'painting-cost-noida-2025': {
    title: 'Painting Cost in Noida 2025 – Complete Price Guide',
    desc: 'Complete guide to painting costs in Noida 2025. Interior, exterior, waterproofing prices per sq.ft. by Kartik Painter Services.',
    published: '2025-01-15',
    content: [
      {
        h2: 'How Much Does Painting Cost in Noida?',
        p: `Painting costs in Noida vary depending on the type of work, the quality of paint, and the size of your property. Here is a complete price guide for 2025.`,
      },
      {
        h2: 'Interior Painting Cost in Noida',
        p: `Interior painting in Noida starts from ₹8 to ₹15 per square foot. This includes wall putty application, primer coat, and two finishing coats using premium brands like Asian Paints or Berger.`,
        table: [
          ['Work Type', 'Price Range'],
          ['Basic Interior (2 coats)', '₹8 – ₹10 / sq.ft'],
          ['Premium Interior (putty + primer)', '₹10 – ₹15 / sq.ft'],
          ['Luxury / Designer Finish', '₹15 – ₹25 / sq.ft'],
        ],
      },
      {
        h2: 'Exterior Painting Cost in Noida',
        p: `Exterior painting costs more due to the need for weather-resistant paints. Prices range from ₹12 to ₹20 per square foot including surface preparation and anti-fungal primer.`,
        table: [
          ['Work Type', 'Price Range'],
          ['Standard Exterior', '₹12 – ₹15 / sq.ft'],
          ['Weather Shield (5-year)', '₹15 – ₹20 / sq.ft'],
        ],
      },
      {
        h2: 'Waterproofing Cost in Noida',
        p: `Waterproofing treatment for roofs, bathrooms and basements ranges from ₹30 to ₹50 per square foot depending on the area and type of treatment required.`,
      },
      {
        h2: 'Texture Painting Cost in Noida',
        p: `Texture and designer painting starts from ₹25 per square foot for basic sand texture and can go up to ₹60 per square foot for custom 3D effects.`,
      },
      {
        h2: 'How to Get the Best Price in Noida?',
        p: `Always get a written estimate before starting work. Ask for the brand of paint being used. Avoid contractors who give very low quotes — they typically use inferior paint. Kartik Painter Services offers free site visits and written estimates across Noida.`,
      },
    ],
  },
}

export default function BlogPost({ slug }) {
  const post = posts[slug]
  if (!post) return null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.desc,
    datePublished: post.published,
    author: {
      '@type': 'Person',
      name: 'Kartik Halder',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kartik Painter Services',
      url: 'https://kartikpainterservices.com',
    },
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.desc}
        canonical={`/blog/${slug}`}
        schema={articleSchema}
        ogType="article"
      />

      <article className="bg-white">
        {/* Header */}
        <div className="page-hero py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <p className="label text-accent-300 mb-3">Guide</p>
            <h1 className="text-[clamp(24px,4vw,40px)] font-black text-white leading-tight">
              {post.title}
            </h1>
            <p className="text-white/50 text-[13px] mt-4">
              By Kartik Halder · Updated {post.published}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          {post.content.map(({ h2, p, table }) => (
            <div key={h2} className="mb-8">
              <h2 className="font-bold text-[20px] text-text-primary mb-3">{h2}</h2>
              <p className="text-text-muted text-[15px] leading-relaxed mb-4">{p}</p>
              {table && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[14px]">
                    <thead>
                      <tr className="bg-surface">
                        {table[0].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-semibold
                                                  text-text-primary border border-border">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.slice(1).map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                          {row.map(cell => (
                            <td key={cell} className="px-4 py-3 border border-border
                                                       text-text-secondary">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* CTA inside article */}
          <div className="mt-10 p-6 bg-surface border border-border rounded-2xl text-center">
            <p className="font-bold text-text-primary text-[18px] mb-2">
              Get a Free Quote in Noida
            </p>
            <p className="text-text-muted text-[14px] mb-5">
              Free site visit and written estimate — no obligation.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={`tel:${PHONE}`} className="btn-accent text-[14px]">
                <Phone size={14}/> Call Now
              </a>
              <Link to="/contact" className="btn-outline text-[14px]">
                Send Message
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
