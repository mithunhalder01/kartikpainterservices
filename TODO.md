# SEO Implementation TODO

## Task: Complete On-Page, Local & Technical SEO for Kartik Painter Services

### Step 1: Update Title Tags & Meta Descriptions ✅
- [x] `index.html` — Update `<title>` to "Best Painter in Noida | Kartik Painter Services"
- [x] `index.html` — Update meta description with Noida focus
- [x] `src/components/SEO.jsx` — Update default `fullTitle` to include "Best Painter in Noida"
- [x] `src/components/SEO.jsx` — Update default meta description

### Step 2: Add Noida-Focused Content to Homepage ✅
- [x] `src/pages/Home.jsx` — Add "Noida Coverage" section with Sector 18, 62, 78 mentions
- [x] `src/pages/Home.jsx` — Add Hindi/English content: "Hum Noida Sector 18, 62, aur poore Noida mein best painting services dete hain."
- [x] `src/pages/Home.jsx` — Add more Noida locality keywords naturally

### Step 3: Create Individual Service Pages ✅
- [x] `src/data/data.js` — Add SEO metadata (title, desc, keywords) for each service
- [x] `src/pages/ServicePage.jsx` — Create dynamic service page component
- [x] `src/App.jsx` — Add routes for all 9 service pages
- [x] Each service page must include "Noida" in title, description, and content

### Step 4: Update Sitemap ✅
- [x] `public/sitemap.xml` — Add all 9 new service page URLs
- [x] Update lastmod dates

### Step 5: Local Citations & NAP Consistency ✅
- [x] `src/components/Footer.jsx` — Add structured NAP (Name, Address, Phone) with schema
- [x] `src/components/Footer.jsx` — Add directory listing links (Justdial, Sulekha, Indiamart)
- [x] `src/components/Navbar.jsx` — Update service dropdown to link to individual pages

### Step 6: Technical SEO ✅
- [x] Verify Google Search Console meta tag is present
- [x] Run `npm run build` to verify — **BUILD SUCCESS** (4.49s)

### Step 7: Final Verification ✅
- [x] Check all pages have unique titles with "Noida"
- [x] Verify sitemap is complete
- [x] Confirm no build errors

