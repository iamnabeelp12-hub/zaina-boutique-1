# 🌸 Zaina Boutique — Complete Setup Guide

> Follow every step in order. Estimated setup time: 60–90 minutes.

---

## 📋 What You're Building

- React storefront (looks like azafashions.com)
- Supabase backend (database + file storage + auth)
- Hidden admin panel at a secret URL
- WhatsApp order system (+917418701120)
- Customer login with address + GPS location
- Referral / affiliate link system with monthly reports
- Full site customization (colors, SEO, banners, products)
- Deployed free on Vercel, connected to your GitHub repo

---

## STEP 1 — Prerequisites (Install These First)

### 1.1 Install Node.js
- Go to https://nodejs.org
- Download **LTS version** (e.g. 20.x)
- Install it, then verify:
```bash
node --version   # should show v20.x.x
npm --version    # should show 10.x.x
```

### 1.2 Install Git
- Go to https://git-scm.com/downloads
- Download and install for your OS
- Verify:
```bash
git --version
```

---

## STEP 2 — Set Up Supabase (Backend + Database)

### 2.1 Create Supabase Account
1. Go to https://supabase.com
2. Click **Start your project** → sign up with GitHub or email
3. Click **New Project**
4. Fill in:
   - **Name:** `zaina-boutique`
   - **Database Password:** choose a strong password (save it!)
   - **Region:** choose closest to India (e.g. `ap-south-1 Mumbai` if available, else `Southeast Asia`)
5. Click **Create new project** — wait ~2 minutes for it to set up

### 2.2 Run the Database Schema
1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the **entire contents** and paste into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned" — this means all tables were created ✅

### 2.3 Create Storage Buckets
1. In Supabase dashboard, click **Storage** (left sidebar)
2. Click **New bucket** — create these 3 buckets one by one:

| Bucket Name | Public? |
|-------------|---------|
| `products`  | ✅ Yes  |
| `banners`   | ✅ Yes  |
| `general`   | ✅ Yes  |

For each bucket:
- Click **New bucket**
- Enter the name exactly as above
- Toggle **Public bucket** to ON
- Click **Create bucket**

### 2.4 Get Your Supabase Keys
1. In Supabase dashboard, click **Project Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. Copy and save these two values:
   - **Project URL** → looks like `https://xyzxyzxyz.supabase.co`
   - **anon public** key → long string starting with `eyJ...`
   - **service_role** key → another long string (keep this SECRET — admin only)

### 2.5 Create Admin User
1. In Supabase dashboard, click **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your admin email and a strong password
4. Click **Create user**
5. **Copy this email and password** — you'll use it to log into the admin panel

---

## STEP 3 — Set Up the Project Locally

### 3.1 Clone Your GitHub Repository
```bash
# Open Terminal (Mac/Linux) or Command Prompt (Windows)
git clone https://github.com/iamnabeelp12-hub/zaina-boutique-1.git
cd zaina-boutique-1
```

### 3.2 Copy All Project Files
Copy all the files from this project into the cloned folder. Your folder structure should look like:
```
zaina-boutique-1/
├── public/
│   └── index.html
├── src/
│   ├── admin/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminProducts.js
│   │   │   ├── AdminProductForm.js
│   │   │   ├── AdminBanners.js
│   │   │   ├── AdminCategories.js
│   │   │   ├── AdminOrders.js
│   │   │   ├── AdminCustomers.js
│   │   │   ├── AdminCustomize.js
│   │   │   ├── AdminSEO.js
│   │   │   └── AdminReferrals.js
│   │   ├── AdminGuard.js
│   │   ├── AdminLayout.js
│   │   └── AdminLogin.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   └── SiteContext.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── ProductsPage.js
│   │   ├── ProductDetailPage.js
│   │   ├── CategoryPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutPage.js
│   │   ├── OrderSuccessPage.js
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── AccountPage.js
│   │   └── ReferralPage.js
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   └── supabaseClient.js
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── .gitignore
├── package.json
└── SETUP.md
```

### 3.3 Create Your Environment File
```bash
# In the project root folder, create a .env file:
cp .env.example .env
```
Now open `.env` in any text editor (Notepad, VS Code, etc.) and fill in:
```
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...your-anon-key...
REACT_APP_SUPABASE_SERVICE_KEY=eyJ...your-service-role-key...
REACT_APP_ADMIN_SECRET_PATH=zainab-secure-admin-2024
REACT_APP_WHATSAPP_NUMBER=917418701120
REACT_APP_SITE_URL=https://zainaboutique.in
REACT_APP_ADMIN_EMAIL=your-admin@email.com
```

> ⚠️ **IMPORTANT:** Never share your `.env` file. Never commit it to GitHub. The `.gitignore` already excludes it.

> 💡 You can change `REACT_APP_ADMIN_SECRET_PATH` to any secret word. This becomes your hidden admin URL, e.g. `/my-secret-admin-2024`.

### 3.4 Install Dependencies
```bash
npm install
```
This downloads all required packages. Takes 2–5 minutes.

### 3.5 Run Locally to Test
```bash
npm start
```
Your browser will open at `http://localhost:3000`

Test these URLs:
- `http://localhost:3000` → Homepage
- `http://localhost:3000/zainab-secure-admin-2024/login` → Admin login
- `http://localhost:3000/products` → Product listing
- `http://localhost:3000/login` → Customer login

---

## STEP 4 — Deploy to Vercel (Free Hosting)

### 4.1 Push Code to GitHub
```bash
git add .
git commit -m "Initial Zaina Boutique setup"
git push origin main
```

### 4.2 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Click **Add New Project**
4. Find `zaina-boutique-1` in the list → click **Import**
5. Under **Framework Preset** — select **Create React App**
6. Click **Environment Variables** — add each variable from your `.env` file:

| Variable Name | Value |
|--------------|-------|
| `REACT_APP_SUPABASE_URL` | your supabase URL |
| `REACT_APP_SUPABASE_ANON_KEY` | your anon key |
| `REACT_APP_SUPABASE_SERVICE_KEY` | your service role key |
| `REACT_APP_ADMIN_SECRET_PATH` | `zainab-secure-admin-2024` |
| `REACT_APP_WHATSAPP_NUMBER` | `917418701120` |
| `REACT_APP_SITE_URL` | your domain or vercel URL |
| `REACT_APP_ADMIN_EMAIL` | your admin email |

7. Click **Deploy**
8. Wait ~3 minutes — you'll get a free URL like `zaina-boutique-1.vercel.app`

### 4.3 Add a Custom Domain (Optional)
If you have a domain like `zainaboutique.in`:
1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Click **Add Domain** → enter your domain
3. Vercel will show DNS records — go to your domain registrar (GoDaddy, Namecheap, etc.)
4. Add the CNAME or A records as shown by Vercel
5. Wait up to 24 hours for DNS to propagate

---

## STEP 5 — Configure Supabase Auth

### 5.1 Set Site URL for Email Confirmation
1. Supabase dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL or custom domain:
   - e.g. `https://zaina-boutique-1.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://zaina-boutique-1.vercel.app/**`
4. Click **Save**

### 5.2 Configure Email Templates (Optional)
1. Supabase → **Authentication** → **Email Templates**
2. Edit the "Confirm signup" email to use your branding
3. Add your site name "Zaina Boutique" to the template

---

## STEP 6 — First Time Admin Setup

### 6.1 Log Into Admin Panel
1. Go to: `https://your-site.vercel.app/zainab-secure-admin-2024/login`
2. Use the admin email and password you created in Step 2.5
3. You should see the admin dashboard ✅

### 6.2 Add Your First Category
1. Admin → **Categories** → **Add Category**
2. Add: Sarees, Kurtas, Lehengas, Dresses, Accessories
3. Upload a circular image for each (300×300px recommended)

### 6.3 Upload Hero Banner
1. Admin → **Banners** → **Add Banner**
2. Select type: **Hero Slider**
3. Enter title: "New Collection 2024"
4. Enter subtitle: "Discover our latest arrivals"
5. Link: `/products`
6. Upload a wide image (1920×800px recommended)

### 6.4 Add Your First Products
1. Admin → **Products** → **Add Product**
2. Fill in name, price, description
3. Select category
4. Upload product photos (3:4 ratio recommended)
5. Add sizes (S, M, L, XL or Free Size)
6. Toggle **Featured** ON for products to show on homepage
7. Click **Create Product**

### 6.5 Customize Site Colors
1. Admin → **Customization** → **Colors tab**
2. Try a Quick Theme or adjust individual colors
3. Changes preview live — click **Save All Changes**

### 6.6 Set Up SEO
1. Admin → **SEO Settings**
2. Fill in Site Title, Meta Description, Keywords
3. Upload an OG image (1200×630px) for social sharing
4. Click **Save SEO Settings**

---

## STEP 7 — How the WhatsApp Order System Works

When a customer clicks **"Order via WhatsApp"** on a product page:
1. Their details (name, phone, address, GPS location) are collected
2. A formatted WhatsApp message is created automatically
3. Customer is redirected to WhatsApp with the pre-filled message
4. The order is also saved to your Supabase `orders` table
5. You receive the message at **+917418701120**

To reply and confirm:
- Simply reply to the WhatsApp message confirming the order
- Update the order status in Admin → **Orders** → change from `pending` to `confirmed`
- The customer can see their order status in My Account → My Orders

---

## STEP 8 — How the Referral / Affiliate System Works

### For Customers (Referrers):
1. Customer logs in and goes to any product page
2. Clicks **"Generate My Referral Link"**
3. A unique link is created: `your-site.com/products/saree-name?ref=CODE`
4. They share this link on WhatsApp, Instagram, etc.
5. When someone clicks the link, the referral code is tracked

### For Orders:
1. When a buyer visits via a referral link, the code is stored in their browser
2. At checkout, the referral code is attached to the order
3. A commission (default 5%) is recorded in the `referral_commissions` table

### For Admin (Paying Out):
1. Admin → **Referrals** → **Commissions tab**
2. See all pending commissions by referrer name, amount, month
3. Click ✓ to mark as **Approved**, then ✓ again to mark as **Paid**
4. Click the WhatsApp icon to send payment confirmation to the referrer
5. **Monthly Report tab** shows total commissions per month
6. Click **Export CSV** to download a full report for any month

---

## STEP 9 — Future Updates (Deploying Changes)

Every time you update the code:
```bash
git add .
git commit -m "Describe what you changed"
git push origin main
```
Vercel automatically detects the push and redeploys in ~2 minutes.

---

## 🛡️ Security Checklist

- [x] Admin panel URL is hidden (secret path in `.env`)
- [x] `.env` file is in `.gitignore` — never committed to GitHub
- [x] Supabase Row Level Security (RLS) is enabled on all tables
- [x] Customers can only see their own orders and addresses
- [x] Service role key is never exposed to the frontend
- [x] Admin requires authenticated Supabase session

---

## 🗂️ Admin Panel Features Summary

| Section | What You Can Do |
|---------|----------------|
| **Dashboard** | View total orders, revenue, products, customers at a glance |
| **Products** | Add, edit, delete products; upload photos; set sizes, colors, stock |
| **Categories** | Add categories with images; control display order |
| **Orders** | View all orders; update status (pending→confirmed→shipped→delivered); send WhatsApp updates |
| **Banners** | Upload hero slider images and offer banners; show/hide them |
| **Customers** | View all registered customers; see order history; contact via WhatsApp |
| **Referrals** | View all affiliate links; approve/pay commissions; monthly reports; export CSV |
| **Customization** | Change site colors live; update site name, tagline, WhatsApp number, shipping threshold |
| **SEO** | Set page title, meta description, OG image, Google Analytics ID |

---

## ❓ Troubleshooting

### "Cannot read properties of undefined" error
→ Check your `.env` file has all variables filled in correctly with no spaces around `=`

### Admin panel shows blank page
→ Make sure you logged in at `/zainab-secure-admin-2024/login` first
→ Check browser console for errors

### Images not uploading
→ Verify storage buckets `products`, `banners`, `general` exist and are set to **public** in Supabase

### WhatsApp not opening
→ Check `REACT_APP_WHATSAPP_NUMBER` in `.env` is just digits: `917418701120` (no `+`, no spaces)

### Orders not saving to database
→ Run the SQL migration again in Supabase SQL Editor
→ Check Supabase → Table Editor → confirm `orders` table exists

### Customer signup email not arriving
→ Check Supabase → Authentication → URL Configuration → Site URL is set correctly
→ Check spam folder

### Vercel build failing
→ Check the build logs in Vercel dashboard
→ Make sure all environment variables are added in Vercel (not just local `.env`)

---

## 📞 Your Key Details Reference

| Item | Value |
|------|-------|
| WhatsApp Orders | +917418701120 |
| GitHub Repo | https://github.com/iamnabeelp12-hub/zaina-boutique-1.git |
| Admin Path | `/zainab-secure-admin-2024/login` |
| Supabase Dashboard | https://supabase.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |

---

*Built for Zaina Boutique. Powered by React + Supabase + Vercel.*
