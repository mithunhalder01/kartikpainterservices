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

## 🔐 Backend & Admin Dashboard

The site now has a Node/Express + MongoDB backend and a full admin dashboard at `/admin`
for managing Gallery, Testimonials, About page content, and Leads (CRM) — no redeploy
needed for content changes.

### One-time setup

1. Create a free **MongoDB Atlas** cluster → get the connection string.
2. Create a free **Cloudinary** account → get cloud name, API key, API secret.
3. Copy `.env.example` to `.env` and fill in every value:
   ```bash
   cp .env.example .env
   ```
   - `MONGODB_URI` — your Atlas connection string
   - `JWT_SECRET` / `JWT_REFRESH_SECRET` — random strings, e.g. `openssl rand -hex 64`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the one admin login (password: 10+ characters)
   - `CLOUDINARY_*` — from your Cloudinary dashboard
4. Seed the single admin account (reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`):
   ```bash
   npm run seed:admin
   ```
   Safe to re-run — it updates the existing admin's password/name instead of duplicating.

### Running locally

Run the API and the frontend in two terminals:

```bash
npm run server:dev   # Express API on http://localhost:5050
npm run dev          # Vite dev server on http://localhost:5173 (proxies /api to 5050)
```

Then open `http://localhost:5173/admin/login` and sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### Deploying

- Push to Vercel as usual — `api/[[...path]].js` deploys the whole Express app as a single
  serverless function, so no separate backend host is needed.
- Add every variable from `.env.example` to the Vercel project's Environment Variables
  (Production + Preview). Set `CORS_ORIGINS` to your real production domain.
- Run `npm run seed:admin` once **locally, pointed at the production `MONGODB_URI`**
  (or via `vercel env pull` + local run) to create the admin account in the production
  database — there is no seed step in the deploy pipeline itself, by design.

### Crew, attendance & letter pad

Three admin-only pages sit alongside the site editors:

- **Labour** — add each worker with their phone number, daily wage and joining date.
  A worker can be *active* (shows in the attendance sheet), *inactive* (kept in history
  but hidden from the daily sheet) or *blocked* (login revoked immediately). Deleting a
  worker also deletes their attendance history; deactivating does not.
- **Attendance** — *Mark Day* ticks **P** (present), **H** (half day) or **A** (absent)
  for everyone on one date, with optional overtime hours, site and note; the *Register*
  tab shows the whole month as a grid (click a cell to cycle P → H → A → blank) with
  per-worker P/H/A totals, payable days (H counts as ½) and wage. **Export** downloads the
  month as a PDF (landscape A4 register) or an Excel workbook (Register + Summary sheets).
- **Letter Pad** — type in the box on the left and the A4 sheet on the right fills in live:
  logo top-left, Ref/Date top-right, signature block, and a footer bar with website, phone
  and social handles. *Download PDF* produces the same A4 page as a real, text-based PDF.
  Letterhead details and the logo are edited on the *Letterhead* tab and saved in the database.

### Labour logins

Workers sign in on the same `/admin/login` page using their **phone number** (admins use
their **email**). A labour session can only reach *My Attendance* — a read-only calendar of
their own month, with their own totals and earnings. They can never mark or edit attendance,
and every other admin route rejects their token server-side, not just in the UI.

### Locked out of the admin panel

There is no email-based reset link (no mail provider is wired up), so recovery is either
admin-to-admin or done against the database:

- **Two admins, one forgot** — the other one signs in, opens **Settings → Admins** and clicks
  the key icon next to that account to set a new password. The reset account is signed out
  everywhere immediately.
- **Nobody can get in** — point a local `.env` at the production `MONGODB_URI` and run
  `npm run reset:admin`. With no `ADMIN_EMAIL`/`ADMIN_PASSWORD` set it just lists the admin
  accounts; fill those two in and run it again to reset one.
- **`npm run seed:dummy-admin`** creates a throwaway `admin@admin.com` / `admin123` account
  as a way back in. **These credentials are in this public repository, so treat that account
  as compromised from the moment it exists** — sign in, reset the real password, then delete
  it from Settings → Admins.

### Security notes

- Admin accounts are created only by an existing admin (Settings) or the seed script;
  labour accounts only by an admin. There is no self-registration endpoint anywhere.
- Access tokens carry a role (`admin` or `labour`). Blocking or deactivating a worker
  clears their refresh token, so any live session dies on its next refresh.
- Sessions are httpOnly/Secure/SameSite=Strict cookies (not localStorage) — a 15-minute
  access token plus a rotating 30-day refresh token.
- `/admin` is blocked in `public/robots.txt` and carries no public links from the rest of the site.
- Login and public lead-submission endpoints are rate-limited; every admin write endpoint
  validates input with `zod` and sanitizes strings against XSS/NoSQL-injection.

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
    <link rel="canonical" href="https://kartikpainterservices.vercel.app/" />
    <!-- Open Graph -->
    <meta property="og:type"        content="website" />
    <meta property="og:url"         content="https://kartikpainterservices.vercel.app/" />
    <meta property="og:title"       content="Kartik Painter Services – Noida's Trusted Painter" />
    <meta property="og:description" content="15+ years, 500+ satisfied clients. Free site visit anywhere in Noida & Greater Noida." />
    <meta property="og:image"       content="https://kartikpainterservices.vercel.app/og-image.jpg" />
    <!-- Twitter Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="Kartik Painter Services – Noida's Trusted Painter" />
    <meta name="twitter:description" content="15+ years, 500+ satisfied clients. Free site visit anywhere in Noida & Greater Noida." />