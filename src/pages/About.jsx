import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Shield, Award, Users } from 'lucide-react'
import { team, brands, areas, stats } from '../data/data'
import SEO from '../components/SEO'

export default function About() {
  return (
    <>
      <SEO
        title="About Us – 15 Years of Painting in Noida"
        description="Kartik Painter Services has been Noida's trusted painting contractor since 2009. 15+ years, 500+ projects, honest pricing and premium materials."
        canonical="/about"
      />

      <section className="page-hero py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="label text-accent-300">About</p>
          <h1 className="text-display-lg font-black text-white max-w-xl mb-4">
            15 years of craft.
            <br/>One standard.
          </h1>
          <p className="text-white/50 text-[16px] max-w-lg">
            Since 2009, we've been the name Noida families and businesses trust for honest work.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="img-zoom rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop"
                 alt="Kartik Painter Services team Noida"
                 className="w-full h-[460px] object-cover"/>
          </div>
          <div>
            <p className="label">Our Story</p>
            <h2 className="text-display-sm font-black text-text-primary mb-5">
              From two workers to Noida's most trusted
            </h2>
            <p className="text-text-muted text-[15px] leading-relaxed mb-4">
              In 2009, Kartik Halder started with two workers and one principle: do honest work,
              use good materials, and treat every home as your own.
            </p>
            <p className="text-text-muted text-[15px] leading-relaxed mb-8">
              That reputation spread — one satisfied client at a time. Today, 15+ skilled
              professionals cover Noida, Greater Noida, Dadri and beyond. The principle hasn't changed.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {stats.map(({ value, label }) => (
                <div key={label} className="bg-surface rounded-xl p-4 border border-border">
                  <p className="stat-value text-text-primary">{value}</p>
                  <p className="text-text-subtle text-[11px] font-semibold uppercase
                                tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>
            <Link to="/contact" className="btn-dark">Get in Touch <ArrowRight size={14}/></Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-dark-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="label text-accent-300">Values</p>
            <h2 className="text-display-sm font-black text-white">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              [Award, 'Trust First', "Every estimate is honest. Every promise is kept. Our reputation was built client by client — we protect it on every job."],
              [Shield, 'Quality Always', "We use only genuine premium brands. Trained, experienced team held to a high standard on every project, every time."],
              [Users, 'People First', "We respect your home, schedule and budget. We work cleanly, communicate clearly, and don't leave until you're satisfied."],
            ].map(([Icon, t, d]) => (
              <div key={t} className="bg-white/5 border border-white/10 rounded-xl p-7
                                      hover:bg-white/8 transition-colors">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center
                                justify-center mb-5">
                  <Icon size={17} className="text-white/60"/>
                </div>
                <h3 className="font-semibold text-white text-[17px] mb-3">{t}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-16 px-6 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="label">Team</p>
            <h2 className="text-display-sm font-black text-text-primary">Meet our people</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {team.map(m => (
              <div key={m.name} className="group">
                <div className="img-zoom rounded-xl overflow-hidden aspect-square mb-4
                                border border-border group-hover:border-dark/30 transition-colors">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover"/>
                </div>
                <p className="font-semibold text-text-primary text-[15px]">{m.name}</p>
                <p className="text-accent text-[12px] font-medium mt-0.5">{m.role}</p>
                <p className="text-text-subtle text-[11px] mt-0.5">{m.exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands + Areas */}
      <section className="bg-surface py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="label">Materials</p>
            <h2 className="text-display-sm font-black text-text-primary mb-3">Premium brands only</h2>
            <p className="text-text-muted text-[14px] mb-6">
              Genuine certified products — never substituted.
            </p>
            <div className="flex flex-wrap gap-2">
              {brands.map(b => (
                <span key={b} className="text-[13px] font-medium text-text-secondary
                                        border border-border bg-white px-4 py-2 rounded-lg
                                        hover:border-dark transition-colors">{b}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Coverage</p>
            <h2 className="text-display-sm font-black text-text-primary mb-3">Where we work</h2>
            <p className="text-text-muted text-[14px] mb-6">Not listed? Call — we likely cover your area.</p>
            <div className="flex flex-wrap gap-2">
              {areas.map(a => (
                <span key={a}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary
                                 border border-border bg-white px-3.5 py-2 rounded-lg
                                 hover:border-dark transition-colors">
                  <MapPin size={11} className="text-accent"/> {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
