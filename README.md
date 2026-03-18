# 🎨 Kartik Painter Services — Website

Noida ke sabse trusted painter contractor ki professional website.
Built with **React 18 + Tailwind CSS v3 + Vite**.

---

## 📁 Project Structure

```
kartik-painter-services/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          ← Sticky navbar with mobile menu
│   │   ├── Footer.jsx          ← Full footer with links & contact
│   │   └── WhatsAppButton.jsx  ← Floating WhatsApp button (bottom-right)
│   ├── pages/
│   │   ├── Home.jsx            ← Landing page (Hero, Services, Gallery, Testimonials, CTA)
│   │   ├── Services.jsx        ← All 6 services with pricing
│   │   ├── Gallery.jsx         ← Filterable photo gallery
│   │   ├── About.jsx           ← Story, Team, Brands, Areas
│   │   └── Contact.jsx         ← Quote form + contact info + map
│   ├── data/
│   │   └── data.js             ← ⭐ Sab kuch yahan change karo (phone, prices, areas, etc.)
│   ├── App.jsx                 ← Router + layout
│   ├── main.jsx                ← Entry point
│   └── index.css               ← Tailwind + custom animations
├── index.html                  ← SEO meta tags already included
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🚀 Setup & Run Karo

### Step 1 — Dependencies install karo
```bash
npm install
```

### Step 2 — Development server start karo
```bash
npm run dev
```
Browser mein khulega: `http://localhost:5173`

### Step 3 — Production build
```bash
npm run build
```
`dist/` folder mein ready ho jaayega deploy ke liye.

---

## ✏️ Customize Kaise Karein

### 📞 Phone Number, Email, Address Change Karo
File: `src/data/data.js` — sabse neeche `contact` object

```js
export const contact = {
  phone: '+91 XXXXX XXXXX',       // ← Yahan apna number daalo
  whatsapp: '91XXXXXXXXXX',       // ← WhatsApp number (country code ke saath, no +)
  email: 'youremail@gmail.com',
  address: 'Aapka address yahan',
  timings: 'Mon – Sat: 8:00 AM – 7:00 PM',
}
```

### 💰 Service Prices Change Karo
File: `src/data/data.js` — `services` array mein `price` field update karo

### 📸 Real Photos Add Karo
File: `src/data/data.js` — `gallery` array mein `src` field mein apni photos ka URL daalo.
Ya `public/images/` folder mein photos rakhke `/images/photo.jpg` use karo.

### 🗺️ Areas Update Karo
File: `src/data/data.js` — `areas` array mein apne serve karne waale areas add karo

### 👷 Team Members Update Karo
File: `src/data/data.js` — `team` array mein real names, roles aur photos daalo

---

## 🌐 Deploy Options

### Option 1: Netlify (Free & Easy)
1. `npm run build` run karo
2. [netlify.com](https://netlify.com) pe jaao
3. `dist/` folder drag & drop karo
4. Done! Free `.netlify.app` domain milega

### Option 2: Vercel (Free)
```bash
npm install -g vercel
vercel
```

### Option 3: Traditional Hosting
`npm run build` ke baad `dist/` folder ka saara content cPanel mein upload karo.

---

## 🔍 SEO Already Setup Hai
- Title tag: "Kartik Painter Services – Trusted Painter in Noida"
- Meta description mein keywords: painter noida, painting contractor, etc.
- Open Graph tags for social sharing
- Mobile responsive (Google ranking ke liye important)

---

## 📱 Features
- ✅ 5 Pages: Home, Services, Gallery, About, Contact
- ✅ Mobile Responsive (hamburger menu)
- ✅ WhatsApp floating button (bottom-right, pulsing animation)
- ✅ Gallery with category filter
- ✅ Contact form with validation
- ✅ SEO meta tags
- ✅ Google Map embed
- ✅ Smooth animations & hover effects
- ✅ Sticky navbar
- ✅ Fast loading (Vite build)

---

## 💡 Support
Koi problem ho toh `src/data/data.js` file pehle check karo — 
90% customizations wahan se ho jaati hain bina code samjhe!
# kartikpainterservices


<meta name="description" content="Kartik Painter Services – Noida's most trusted painting contractor. Interior, Exterior, Waterproofing & Texture Painting. 15+ years, 500+ projects. Free estimate!" />
    <link rel="canonical" href="https://kartikpainterservices.com/" />
    <!-- Open Graph -->
    <meta property="og:type"        content="website" />
    <meta property="og:url"         content="https://kartikpainterservices.com/" />
    <meta property="og:title"       content="Kartik Painter Services – Noida's Trusted Painter" />
    <meta property="og:description" content="15+ years, 500+ satisfied clients. Free site visit anywhere in Noida & Greater Noida." />
    <meta property="og:image"       content="https://kartikpainterservices.com/og-image.jpg" />
    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="Kartik Painter Services – Noida's Trusted Painter" />
    <meta name="twitter:description" content="15+ years, 500+ satisfied clients. Free site visit anywhere in Noida & Greater Noida." />