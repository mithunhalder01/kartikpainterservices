/**
 * Service-area / locality pages — single source of truth.
 *
 * Imported by:
 *   - src/pages/AreaPage.jsx  (renders the page + schema)
 *   - src/App.jsx             (auto-generates a <Route> per key)
 *   - scripts/prerender.mjs   (static HTML + sitemap entry per key)
 *
 * Each entry has genuinely unique local copy (real societies / sub-localities)
 * to provide real value and avoid thin/duplicate "doorway page" issues.
 */
export const areaData = {
  /* ── Primary hubs ─────────────────────────────────────────────── */
  noida: {
    name: 'Noida',
    title: 'Best Painter in Noida – Interior, Exterior & Texture',
    desc: 'Painter in Noida for interior, exterior, waterproofing and texture work. 15+ years, 500+ projects, free site visit. Call +91 75007 70667.',
    h1: 'Painter in Noida',
    sub: 'Professional painting contractor serving all sectors of Noida — Sector 45, 62, 78, 100, 137 and more.',
    keywords: ['painter in noida', 'painting contractor noida', 'best painter noida', 'interior painter noida', 'house painter noida'],
    sectors: ['Sector 45', 'Sector 62', 'Sector 78', 'Sector 100', 'Sector 137', 'Sector 18', 'Sector 15', 'Sector 27', 'Noida Extension', 'Sector 50'],
  },
  'greater-noida': {
    name: 'Greater Noida',
    title: 'Painter in Greater Noida – Home & Society Painting',
    desc: 'Painter in Greater Noida for flat, villa and society painting across Alpha, Beta, Gamma and Knowledge Park. Call +91 75007 70667.',
    h1: 'Painter in Greater Noida',
    sub: 'Trusted painting contractor in Greater Noida West, Alpha, Beta, Gamma sectors and Knowledge Park.',
    keywords: ['painter in greater noida', 'painting contractor greater noida', 'best painter greater noida', 'house painter greater noida'],
    sectors: ['Greater Noida West', 'Alpha I', 'Alpha II', 'Beta I', 'Beta II', 'Gamma I', 'Knowledge Park', 'Omicron', 'Chi', 'Psi'],
  },
  dadri: {
    name: 'Dadri',
    title: 'Painter in Dadri – Interior, Exterior & Waterproofing',
    desc: 'Painter in Dadri for interior, exterior and waterproofing work. 15+ years experience, written estimate before starting. Call +91 75007 70667.',
    h1: 'Painter in Dadri',
    sub: 'Professional painting contractor serving Dadri, GB Nagar and surrounding areas.',
    keywords: ['painter in dadri', 'painting contractor dadri', 'best painter dadri'],
    sectors: ['Dadri Town', 'GB Nagar', 'Sorkha', 'Bhangel', 'Barna', 'Saidpur'],
  },
  ghaziabad: {
    name: 'Ghaziabad',
    title: 'Painter in Ghaziabad – Trusted Painting Contractor',
    desc: 'Painter in Ghaziabad for interior, exterior, waterproofing and texture painting. Free site visit and written quote. Call +91 75007 70667.',
    h1: 'Painter in Ghaziabad',
    sub: 'Professional painting services across Ghaziabad — Indirapuram, Vaishali, Crossings Republik and more.',
    keywords: ['painter in ghaziabad', 'painting contractor ghaziabad', 'best painter ghaziabad', 'house painter ghaziabad'],
    sectors: ['Indirapuram', 'Vaishali', 'Crossings Republik', 'Raj Nagar', 'Kaushambi', 'Vasundhara', 'Mohan Nagar'],
  },

  /* ── Noida localities ─────────────────────────────────────────── */
  'noida-extension': {
    name: 'Noida Extension',
    title: 'Painter in Noida Extension – Society Flat Painting',
    desc: 'Painter in Noida Extension (Noida West) for society flat painting, texture and waterproofing around Gaur City. Call +91 75007 70667.',
    h1: 'Painter in Noida Extension (Noida West)',
    sub: 'Society-specialist painting contractor for Noida Extension high-rises — Gaur City, Cherry County, Panchsheel Greens, Amrapali Dream Valley and Nirala Estate. Fast society approvals, minimal disruption, premium brands only.',
    keywords: ['painter in noida extension', 'painter noida west', 'society painting noida extension', 'flat painting noida west', 'best painter noida extension'],
    sectors: ['Gaur City', 'Gaur City 2', 'Cherry County', 'Panchsheel Greens', 'Amrapali Dream Valley', 'Nirala Estate', 'Supertech Eco Village', 'Ajnara Homes', 'Mahagun Mywoods', 'Golf Avenue'],
  },
  'noida-sector-137': {
    name: 'Noida Sector 137',
    title: 'Painter in Noida Sector 137 – Society Flat Painting',
    desc: 'Painter in Noida Sector 137 for apartment painting, texture and waterproofing in Paras Tierea and Logix Blossom. Call +91 75007 70667.',
    h1: 'Painter in Noida Sector 137',
    sub: 'Expressway-side society painting for Sector 137 — Paras Tierea, Logix Blossom County, Supertech CapeTown and Amrapali Silicon City. Written estimate and clean, on-time delivery.',
    keywords: ['painter in noida sector 137', 'society painting sector 137 noida', 'best painter sector 137', 'flat painting noida expressway'],
    sectors: ['Paras Tierea', 'Logix Blossom County', 'Supertech CapeTown', 'Amrapali Silicon City', 'Sikka Karmic Greens', 'Purvanchal Royal Park'],
  },
  'noida-sector-150': {
    name: 'Noida Sector 150',
    title: 'Painter in Noida Sector 150 – Premium Flat & Villa',
    desc: 'Painter in Noida Sector 150 for premium flat and villa painting, texture and waterproofing in ATS and Tata societies. Call +91 75007 70667.',
    h1: 'Painter in Noida Sector 150',
    sub: 'Premium painting for Sector 150’s low-density green townships — ATS Le Grandiose, Tata Eureka Park, Godrej Nest, Ace Divino and Great Value Sharanam.',
    keywords: ['painter in noida sector 150', 'premium painting sector 150 noida', 'best painter sector 150', 'villa painting noida 150'],
    sectors: ['ATS Le Grandiose', 'ATS Pious Hideaways', 'Tata Eureka Park', 'Godrej Nest', 'Ace Divino', 'Great Value Sharanam', 'Lotus Panache', 'Prateek Canary'],
  },
  'noida-sector-78': {
    name: 'Noida Sector 78',
    title: 'Painter in Noida Sector 78 – Flat & Society Painting',
    desc: 'Painter in Noida Sector 78 for flat painting, texture and waterproofing in Mahagun Moderne and Antriksh Forest. Call +91 75007 70667.',
    h1: 'Painter in Noida Sector 78',
    sub: 'High-rise painting for Sector 78 — Mahagun Moderne, Antriksh Forest, Hyde Park, AVP Grand and Sethi Max Royal. Society-friendly scheduling and premium finishes.',
    keywords: ['painter in noida sector 78', 'society painting sector 78 noida', 'best painter sector 78', 'flat painting noida 78'],
    sectors: ['Mahagun Moderne', 'Antriksh Forest', 'Hyde Park', 'AVP Grand', 'Sethi Max Royal', 'Aims Golf Avenue', 'Prateek Wisteria'],
  },
  'noida-sector-62': {
    name: 'Noida Sector 62',
    title: 'Painter in Noida Sector 62 – Home & Office Painting',
    desc: 'Painter in Noida Sector 62 for home, office and commercial painting with texture and waterproofing work. Call +91 75007 70667.',
    h1: 'Painter in Noida Sector 62',
    sub: 'Home and office painting across Sector 62’s residential blocks and corporate offices near Fortis Hospital and the Blue Line metro. Weekend and after-hours work available for offices.',
    keywords: ['painter in noida sector 62', 'office painting sector 62 noida', 'best painter sector 62', 'commercial painting noida 62'],
    sectors: ['Block A', 'Block B', 'Block C', 'Block D', 'Near Fortis Hospital', 'IT Park 62', 'Metro Station 62', 'Ithum Towers'],
  },
  'noida-sector-18': {
    name: 'Noida Sector 18',
    title: 'Painter in Noida Sector 18 – Shop, Office & Home',
    desc: 'Painter in Noida Sector 18 for shop, showroom, office and home painting near Atta Market and DLF Mall. Call +91 75007 70667.',
    h1: 'Painter in Noida Sector 18',
    sub: 'Commercial and residential painting in Sector 18 — showrooms and offices around Atta Market, DLF Mall of India and the Great India Place, plus nearby residential blocks.',
    keywords: ['painter in noida sector 18', 'shop painting sector 18 noida', 'office painting noida 18', 'best painter sector 18'],
    sectors: ['Atta Market', 'DLF Mall of India', 'Great India Place', 'Sector 18 Market', 'Near Sector 18 Metro', 'Brahmaputra Complex'],
  },

  /* ── Greater Noida West ───────────────────────────────────────── */
  'gaur-city': {
    name: 'Gaur City',
    title: 'Painter in Gaur City – Flat Painting & Texture',
    desc: 'Painter in Gaur City, Greater Noida West for flat painting, texture and waterproofing in Gaur City 1 and 2. Call +91 75007 70667.',
    h1: 'Painter in Gaur City',
    sub: 'Painting specialist for Gaur City 1 & 2 high-rises and the Gaur City Mall area — fast society gate-pass approvals, minimal disruption and premium Asian Paints / Berger finishes.',
    keywords: ['painter in gaur city', 'flat painting gaur city', 'best painter gaur city greater noida west', 'society painting gaur city'],
    sectors: ['Gaur City 1', 'Gaur City 2', '11th Avenue', '12th Avenue', '14th Avenue', '16th Avenue', 'Gaur City Center', 'Galaxy North Avenue'],
  },

  /* ── Ghaziabad localities ─────────────────────────────────────── */
  indirapuram: {
    name: 'Indirapuram',
    title: 'Painter in Indirapuram – Flat & Villa Painting',
    desc: 'Painter in Indirapuram, Ghaziabad for flat and villa painting, texture and waterproofing in Shipra Suncity. Call +91 75007 70667.',
    h1: 'Painter in Indirapuram',
    sub: 'Professional painting contractor across Indirapuram — Shipra Suncity, Ahinsa Khand, Nyay Khand, Vaibhav Khand and Gyan Khand. Trusted by hundreds of Indirapuram families.',
    keywords: ['painter in indirapuram', 'painting contractor indirapuram', 'flat painting indirapuram', 'best painter indirapuram', 'house painter indirapuram'],
    sectors: ['Shipra Suncity', 'Ahinsa Khand 1', 'Ahinsa Khand 2', 'Nyay Khand 1', 'Nyay Khand 2', 'Vaibhav Khand', 'Gyan Khand', 'Shakti Khand', 'Abhay Khand', 'Niti Khand'],
  },
  vaishali: {
    name: 'Vaishali',
    title: 'Painter in Vaishali – Interior & Exterior Painting',
    desc: 'Painter in Vaishali, Ghaziabad for interior, exterior and texture painting across all Vaishali sectors. Call +91 75007 70667.',
    h1: 'Painter in Vaishali',
    sub: 'Reliable painting services across all Vaishali sectors near the Blue Line metro — apartments, kothis and builder floors. Quick response and clean, on-time work.',
    keywords: ['painter in vaishali', 'painting contractor vaishali', 'best painter vaishali ghaziabad', 'flat painting vaishali'],
    sectors: ['Vaishali Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6', 'Sector 9', 'Ramprastha', 'Near Vaishali Metro'],
  },
  vasundhara: {
    name: 'Vasundhara',
    title: 'Painter in Vasundhara – Home & Flat Painting',
    desc: 'Painter in Vasundhara, Ghaziabad for interior, exterior, waterproofing and texture painting. Free site visit. Call +91 75007 70667.',
    h1: 'Painter in Vasundhara',
    sub: 'Painting contractor covering every Vasundhara sector — from independent kothis to society flats. Genuine brands, written estimate and a tidy, dust-controlled finish.',
    keywords: ['painter in vasundhara', 'painting contractor vasundhara', 'best painter vasundhara', 'house painter vasundhara ghaziabad'],
    sectors: ['Sector 1', 'Sector 2A', 'Sector 3', 'Sector 5', 'Sector 9', 'Sector 13', 'Sector 15', 'Sector 17', 'Sector 18'],
  },
  'raj-nagar-extension': {
    name: 'Raj Nagar Extension',
    title: 'Painter in Raj Nagar Extension – Society Painting',
    desc: 'Painter in Raj Nagar Extension, Ghaziabad for high-rise society painting, texture and waterproofing. Call +91 75007 70667.',
    h1: 'Painter in Raj Nagar Extension',
    sub: 'Society-specialist painting contractor for Raj Nagar Extension towers — SG Homes, KW Srishti, Charms Castle, Panchsheel Wellington and Rajhans. Gate-pass and society-committee friendly.',
    keywords: ['painter in raj nagar extension', 'society painting raj nagar extension', 'best painter rne ghaziabad', 'flat painting raj nagar extension'],
    sectors: ['SG Homes', 'KW Srishti', 'Charms Castle', 'Panchsheel Wellington', 'Rajhans', 'Saviour Greenisle', 'Migsun', 'River Heights'],
  },
  'crossings-republik': {
    name: 'Crossings Republik',
    title: 'Painter in Crossings Republik – Flat Painting',
    desc: 'Painter in Crossings Republik for apartment painting, texture and waterproofing in Gaur and Paramount. Call +91 75007 70667.',
    h1: 'Painter in Crossings Republik',
    sub: 'Trusted apartment painting across the Crossings Republik townships — Gaur Cascades, Paramount Symphony, Assotech The Nest and Mahagun Mascot.',
    keywords: ['painter in crossings republik', 'apartment painting crossings republik', 'best painter crossings republik'],
    sectors: ['Gaur Cascades', 'Paramount Symphony', 'Assotech The Nest', 'Mahagun Mascot', 'Ajnara Gen X', 'Panchsheel Pratistha', 'Supertech Livingston'],
  },
}

// Ordered keys — used to auto-generate routes and links.
export const areaKeys = Object.keys(areaData)
