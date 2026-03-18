import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist."
        canonical="/404"
        noIndex
      />

      <section className="bg-white py-24 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="label">404</p>
          <h1 className="text-display-lg font-black text-text-primary mb-4">
            Page Not Found
          </h1>
          <p className="text-text-muted text-[15px] mb-8">
            The link may be broken or the page may have moved.
          </p>
          <Link to="/" className="btn-accent text-[14px]">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  )
}
