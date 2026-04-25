import SEO from '../components/SEO'
import { Link } from 'react-router-dom'
import { PHONE } from '../data/data'
import { getBlogPostBySlug } from '../data/blogPosts'
import { buildBreadcrumbSchema } from '../components/SEO'
import { Phone } from 'lucide-react'

export default function BlogPost({ slug }) {
  const post = getBlogPostBySlug(slug)
  if (!post) return null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: `https://kartikpainterservices.vercel.app/blog/${slug}`,
    headline: post.title,
    description: post.desc,
    datePublished: post.published,
    dateModified: post.updated || post.published,
    image: `https://kartikpainterservices.vercel.app${post.image}`,
    author: {
      '@type': 'Person',
      name: 'Kartik Halder',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kartik Painter Services',
      url: 'https://kartikpainterservices.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kartikpainterservices.vercel.app/logo.png',
      },
    },
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${slug}` },
  ])

  return (
    <>
      <SEO
        title={post.title}
        description={post.desc}
        canonical={`/blog/${slug}`}
        schema={[articleSchema, breadcrumbSchema]}
        keywords={(post.tags || []).join(', ')}
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
              By Kartik Halder · Updated {post.updated || post.published}
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

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/blog" className="btn-outline text-[13px]">More Guides</Link>
            <Link to="/services" className="btn-outline text-[13px]">View Services</Link>
          </div>
        </div>
      </article>
    </>
  )
}
