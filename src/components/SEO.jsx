import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://kartikpainterservices.vercel.app'
const SITE_NAME = 'Kartik Painter Services'

const absoluteUrl = (path = '') => {
  if (!path) return SITE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

const OG_IMG = absoluteUrl('/og-image.jpg')

/* ─────────────────────────────────────────────────────────
   ALL SERVICE AREAS — covers every major locality/sector
───────────────────────────────────────────────────────── */
const ALL_AREAS = [
  // Noida Sectors
  'Noida', 'Noida Sector 1', 'Noida Sector 2', 'Noida Sector 3',
  'Noida Sector 6', 'Noida Sector 10', 'Noida Sector 12', 'Noida Sector 15',
  'Noida Sector 15A', 'Noida Sector 16', 'Noida Sector 17', 'Noida Sector 18',
  'Noida Sector 19', 'Noida Sector 20', 'Noida Sector 21', 'Noida Sector 22',
  'Noida Sector 23', 'Noida Sector 25', 'Noida Sector 26', 'Noida Sector 27',
  'Noida Sector 28', 'Noida Sector 29', 'Noida Sector 30', 'Noida Sector 31',
  'Noida Sector 32', 'Noida Sector 33', 'Noida Sector 34', 'Noida Sector 35',
  'Noida Sector 36', 'Noida Sector 37', 'Noida Sector 38', 'Noida Sector 39',
  'Noida Sector 40', 'Noida Sector 41', 'Noida Sector 43', 'Noida Sector 44',
  'Noida Sector 45', 'Noida Sector 46', 'Noida Sector 47', 'Noida Sector 48',
  'Noida Sector 49', 'Noida Sector 50', 'Noida Sector 51', 'Noida Sector 52',
  'Noida Sector 53', 'Noida Sector 55', 'Noida Sector 56', 'Noida Sector 57',
  'Noida Sector 58', 'Noida Sector 61', 'Noida Sector 62', 'Noida Sector 63',
  'Noida Sector 65', 'Noida Sector 66', 'Noida Sector 70', 'Noida Sector 71',
  'Noida Sector 72', 'Noida Sector 73', 'Noida Sector 74', 'Noida Sector 75',
  'Noida Sector 76', 'Noida Sector 77', 'Noida Sector 78', 'Noida Sector 100',
  'Noida Sector 104', 'Noida Sector 107', 'Noida Sector 108', 'Noida Sector 110',
  'Noida Sector 119', 'Noida Sector 120', 'Noida Sector 121', 'Noida Sector 122',
  'Noida Sector 126', 'Noida Sector 128', 'Noida Sector 129', 'Noida Sector 130',
  'Noida Sector 131', 'Noida Sector 132', 'Noida Sector 133', 'Noida Sector 134',
  'Noida Sector 135', 'Noida Sector 136', 'Noida Sector 137', 'Noida Sector 138',
  'Noida Sector 143', 'Noida Sector 143B', 'Noida Sector 144', 'Noida Sector 145',
  'Noida Sector 150', 'Noida Sector 151', 'Noida Sector 152', 'Noida Sector 153',
  'Noida Sector 154', 'Noida Sector 155', 'Noida Sector 157', 'Noida Sector 158',
  'Noida Sector 159', 'Noida Sector 160', 'Noida Sector 162', 'Noida Sector 163',
  'Noida Sector 164', 'Noida Sector 165', 'Noida Sector 166', 'Noida Sector 167',
  'Noida Sector 168',
  // Noida localities
  'Atta Market Noida', 'Brahmaputra Market', 'Bisrakh', 'Block A Noida',
  'DLF Noida', 'Expressway Noida', 'Film City Noida', 'Hosiery Complex',
  'Indira Gandhi Kanya Inter College', 'Logix City Centre', 'Mahamaya Flyover',
  'Mahagun Moderne', 'Mahagun Mywoods', 'Nithari', 'Okhla Phase',
  'Palm Olympia', 'Paras Tierea', 'Prateek Wisteria', 'Saviour Park',
  'Supertech Eco Village', 'Supertech Capetown',
  // Greater Noida
  'Greater Noida', 'Greater Noida West', 'Noida Extension',
  'Alpha 1 Greater Noida', 'Alpha 2 Greater Noida',
  'Beta 1 Greater Noida', 'Beta 2 Greater Noida',
  'Gamma 1 Greater Noida', 'Gamma 2 Greater Noida',
  'Delta 1 Greater Noida', 'Delta 2 Greater Noida',
  'Zeta 1 Greater Noida', 'Zeta 2 Greater Noida',
  'Omega Greater Noida', 'Chi Greater Noida', 'Phi Greater Noida',
  'Psi Greater Noida', 'Mu Greater Noida', 'Xu Greater Noida',
  'Eta Greater Noida', 'Ecotech Greater Noida', 'Surajpur Greater Noida',
  'Knowledge Park 1', 'Knowledge Park 2', 'Knowledge Park 3',
  'Knowledge Park 4', 'Knowledge Park 5',
  'Kasna', 'Rabupura', 'Tughlakabad Greater Noida', 'Bisrakh Greater Noida',
  'Pari Chowk', 'Omaxe Connaught Place Greater Noida',
  'ATS Greens Greater Noida', 'Gaur City', 'Gaur City 2',
  'Gaur Yamuna City', 'Supertech Eco Village 2', 'Supertech Eco Village 3',
  'Mahagun Marvella', 'Ajnara Homes', 'Ajnara Integrity',
  // Dadri & surroundings
  'Dadri', 'Dadri Road', 'Chhapraula', 'Sorkha', 'Bhangel',
  'Shahberi', 'Rampur Jagir', 'Hajipur', 'Sadarpur',
  // Ghaziabad
  'Ghaziabad', 'Indirapuram', 'Vaishali', 'Vasundhara',
  'Raj Nagar Extension', 'Crossings Republik', 'Pratap Vihar',
  'Kaushambi', 'Sahibabad', 'Mohan Nagar', 'Loni', 'Masuri',
  'Vijay Nagar Ghaziabad', 'Govindpuram', 'Dasna',
  'NH-58 Ghaziabad', 'NH-24 Ghaziabad', 'Dilshad Garden',
  'Ankur Vihar', 'Arthala', 'Sanjay Nagar Ghaziabad',
  // Delhi NCR (nearby, for broader reach)
  'Delhi NCR', 'East Delhi', 'Mayur Vihar', 'Patparganj',
  'Vasant Kunj', 'Shahdara', 'Preet Vihar', 'Laxmi Nagar',
]

/* ─────────────────────────────────────────────────────────
   ALL SERVICES with offer catalog
───────────────────────────────────────────────────────── */
const SERVICE_OFFERS = [
  { name: 'Interior Painting',      desc: 'Professional interior wall painting with premium Asian Paints, Berger, Dulux brands. Includes wall putty, primer and 2 top coats.' },
  { name: 'Exterior Painting',      desc: 'Weather-resistant exterior painting for apartments and bungalows in Noida and Greater Noida.' },
  { name: 'Waterproofing',          desc: 'Roof waterproofing, bathroom waterproofing and damp wall treatment across Noida, Ghaziabad and Dadri.' },
  { name: 'Texture Painting',       desc: 'Designer texture painting — sand, stone, venetian plaster and sponge finishes for bedrooms and living rooms.' },
  { name: 'Commercial Painting',    desc: 'Office and commercial space painting in Noida sectors, IT parks and industrial areas.' },
  { name: 'POP & Wall Putty',       desc: 'Smooth wall putty and POP false ceiling work before painting.' },
  { name: 'Epoxy Flooring',         desc: 'Industrial and residential epoxy floor coating in Noida and Greater Noida.' },
  { name: 'Wood Polish & Painting', desc: 'Door, window and furniture wood polish and enamel painting.' },
  { name: 'Roof & Terrace Painting', desc: 'Heatproof and waterproof terrace painting across all Noida sectors.' },
]

/* ─────────────────────────────────────────────────────────
   LOCAL BUSINESS SCHEMA — super detailed
───────────────────────────────────────────────────────── */
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness', 'ProfessionalService'],
  '@id': absoluteUrl('/#business'),
  name: SITE_NAME,
  alternateName: [
    'Kartik Painter',
    'Kartik Painting Services',
    'Best Painter Noida',
    'Painter Noida',
  ],
  description:
    'Kartik Painter Services is the best painting contractor in Noida, Greater Noida, Dadri and Ghaziabad. ' +
    'We offer interior painting, exterior painting, waterproofing, texture painting, wood polish and commercial painting. ' +
    '15+ years of experience, 500+ projects completed, 200+ 5-star Google reviews. Free site visit and written estimate.',
  url: SITE_URL,
  telephone: '+917500770667',
  email: 'kartikpainterservices@gmail.com',
  foundingDate: '2009',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Bank Transfer, Cheque',
  image: [OG_IMG, absoluteUrl('/home.jpeg'), absoluteUrl('/living-room.jpeg')],
  logo: absoluteUrl('/logo.png'),
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Near Sector 45 Metro Station',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201301',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '28.5672',
    longitude: '77.3910',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '09:00',
      closes: '17:00',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '200',
    bestRating: '5',
    worstRating: '1',
  },
  areaServed: ALL_AREAS.map(area => ({
    '@type': 'City',
    name: area,
  })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Painting & Waterproofing Services in Noida NCR',
    itemListElement: SERVICE_OFFERS.map((s, i) => ({
      '@type': 'Offer',
      position: i + 1,
      itemOffered: {
        '@type': 'Service',
        name: s.name,
        description: s.desc,
        provider: { '@type': 'LocalBusiness', name: SITE_NAME },
        areaServed: 'Noida, Greater Noida, Dadri, Ghaziabad',
      },
    })),
  },
  sameAs: [
    'https://g.co/kgs/kartikpainterservices',
    'https://www.justdial.com/Noida/Kartik-Painter-Services',
    'https://www.sulekha.com/kartik-painter-services-noida',
  ],
  keywords:
    'painter noida, painting contractor noida, best painter noida, ' +
    'interior painting noida, exterior painting noida, waterproofing noida, ' +
    'texture painting noida, painter near me noida, painting service noida, ' +
    'painter greater noida, painter ghaziabad, painter dadri, ' +
    'wall painting noida, house painting noida, flat painting noida',
}

/* ─────────────────────────────────────────────────────────
   WEBSITE SCHEMA
───────────────────────────────────────────────────────── */
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  url: SITE_URL,
  name: SITE_NAME,
  description: 'Best painting contractor in Noida, Greater Noida, Dadri and Ghaziabad',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/?s={search_term_string}') },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+917500770667',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['Hindi', 'English'],
    },
  },
}

/* ─────────────────────────────────────────────────────────
   BREADCRUMB SCHEMA (for inner pages)
───────────────────────────────────────────────────────── */
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/* ─────────────────────────────────────────────────────────
   SEO COMPONENT
───────────────────────────────────────────────────────── */
export default function SEO({
  title,
  description,
  canonical,
  noIndex = false,
  schema,
  keywords,
  ogImage,
  ogType = 'website',
}) {
  const cleanTitle = title?.trim()
  const fullTitle = cleanTitle
    ? (cleanTitle.toLowerCase().includes(SITE_NAME.toLowerCase())
        ? cleanTitle
        : `${cleanTitle} | ${SITE_NAME}`)
    : `Best Painter in Noida | Professional Home Painting Services | Kartik`

  const metaDesc = description ||
    'Noida mein best painting services chahiye? Kartik Painters dete hain Interior, Exterior & Waterproofing ' +
    '100% quality ke saath. 15+ years experience. Aaj hi FREE Inspection & Quote payein!'

  const canonicalURL = canonical ? absoluteUrl(canonical) : SITE_URL
  const imageURL = ogImage ? absoluteUrl(ogImage) : OG_IMG

  const defaultKeywords =
    'painter noida, best painter noida, painting contractor noida, ' +
    'painter near me noida, painter near me, interior painting noida, exterior painting noida, ' +
    'waterproofing noida, texture painting noida, house painting noida, ' +
    'flat painting noida, wall painting noida, painter greater noida, ' +
    'painter ghaziabad, painter dadri, painting service noida, ' +
    'best painter greater noida, best painter ghaziabad, ' +
    'painting contractor greater noida, painting contractor ghaziabad, ' +
    'painter noida sector 45, painter noida sector 62, painter noida sector 50, ' +
    'painter noida sector 18, painter noida sector 78, painter noida sector 137, ' +
    'painter noida sector 150, painter indirapuram, painter vaishali, ' +
    'painter vasundhara, painter raj nagar extension, painter crossings republik, ' +
    'asian paints contractor noida, berger paints noida, dulux paints noida, ' +
    'waterproofing contractor noida, damp wall repair noida, roof waterproofing noida, ' +
    'commercial painting noida, office painting noida, pop work noida, ' +
    'wall putty noida, wood polish noida, epoxy flooring noida, ' +
    'painting estimate noida, free site visit noida, painting cost noida, ' +
    'painter noida ncr, best painting service ncr, painting contractor ncr, ' +
    'painting services near me, house painters near me, home painting near me, ' +
    'painters near me noida, painting contractor near me, best painter near me, ' +
    'सबसे अच्छा पेंटर नोएडा, पेंटर नोएडा, दादरी पेंटर, गाज़ियाबाद पेंटर, ' +
    'पेंटिंग ठेकेदार नोएडा, पेंटिंग सेवा नोएडा, घर पेंटिंग नोएडा, ' +
    'नोएडा में पेंटर, नोएडा में पेंटिंग सर्विस, बेस्ट पेंटर नोएडा'

  return (
    <Helmet>
      {/* ── Core ── */}
      <html lang="hi-IN" />
      <title>{fullTitle}</title>
      <meta name="description"        content={metaDesc} />
      <meta name="keywords"           content={keywords || defaultKeywords} />
      <meta name="author"             content={SITE_NAME} />
      <meta name="robots"             content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'} />
      <meta name="googlebot"          content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="revisit-after"      content="3 days" />
      <meta name="rating"             content="general" />
      <meta name="geo.region"         content="IN-UP" />
      <meta name="geo.placename"      content="Noida, Uttar Pradesh, India" />
      <meta name="geo.position"       content="28.5672;77.3910" />
      <meta name="ICBM"               content="28.5672, 77.3910" />
      <meta name="DC.title"           content={fullTitle} />
      <meta name="DC.description"     content={metaDesc} />
      <meta name="DC.subject"         content="Painting Services Noida" />
      <meta name="DC.language"        content="hi, en" />
      <meta name="DC.coverage"        content="Noida, Greater Noida, Dadri, Ghaziabad, Delhi NCR" />
      <link rel="canonical"           href={canonicalURL} />

      {/* ── Open Graph ── */}
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={metaDesc} />
      <meta property="og:url"          content={canonicalURL} />
      <meta property="og:image"        content={imageURL} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt"    content="Kartik Painter Services – Best Painter in Noida" />
      <meta property="og:type"         content={ogType} />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:locale"       content="hi_IN" />
      <meta property="og:locale:alternate" content="en_IN" />

      {/* ── Twitter ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={imageURL} />
      <meta name="twitter:image:alt"   content="Kartik Painter Services Noida" />

      {/* ── Mobile & PWA ── */}
      <meta name="viewport"            content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color"         content="#f59e0b" />
      <meta name="mobile-web-app-capable"    content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

      {/* ── Local Business hints ── */}
      <meta name="category"            content="Painting Services, Home Improvement, Waterproofing" />
      <meta name="classification"      content="Business, Services, Home Improvement" />
      <meta name="coverage"            content="Noida, Greater Noida, Dadri, Ghaziabad, Delhi NCR" />
      <meta name="target"              content="all" />
      <meta name="HandheldFriendly"    content="True" />
      <meta name="MobileOptimized"     content="320" />

      {/* ── JSON-LD: LocalBusiness (always) ── */}
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>

      {/* ── JSON-LD: Website (always) ── */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* ── JSON-LD: Page-specific schema (optional) ── */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
