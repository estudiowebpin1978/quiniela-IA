# 🚀 SETUP-FINAL: Complete Step-by-Step Guide

This guide will help you get **Quiniela Predictor** running locally in 10 minutes.

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.9+ installed (`python --version`)
- [ ] Git installed (`git --version`)
- [ ] A Supabase account (free: https://supabase.com)
- [ ] A terminal/command prompt

---

## 📥 Step 1: Clone & Install

```bash
# Clone the repo (or extract ZIP)
git clone <repo-url> quiniela-ia
cd quiniela-ia

# Install Node dependencies
npm install

# Install Python dependencies
pip install -r scripts/requirements-scraper.txt
```

**Expected Output:**
```
added 150+ packages in 45s
Successfully installed requests beautifulsoup4 python-dotenv
```

---

## 🔑 Step 2: Get Supabase Credentials

1. Go to https://app.supabase.com and create a new project (or use existing)
2. Click **Settings** (gear icon, bottom left)
3. Click **API** tab
4. Copy these values:
   - **Project URL** → Your NEXT_PUBLIC_SUPABASE_URL
   - **`anon` public key** → Your NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **`service_role` secret key** → Your SUPABASE_SERVICE_ROLE_KEY (⚠️ KEEP SECRET)

---

## 📝 Step 3: Create `.env.local`

Create a new file **`.env.local`** in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important:**
- Never commit `.env.local` to Git
- Keep SERVICE_ROLE_KEY private
- File should be in project root: `quiniela-ia/.env.local`

---

## 🗄️ Step 4: Create Database Table

### Option A: Automatic (Recommended)

Start the dev server first:
```bash
npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:3000/api/init-db
```

This will return SQL. Copy it and go to Option B.

### Option B: Manual SQL

1. Open Supabase Dashboard for your project
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.draws (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  date DATE NOT NULL,
  numbers INTEGER[] NOT NULL,
  province TEXT DEFAULT 'Nacional',
  turno TEXT DEFAULT 'Mañana',
  source TEXT,
  UNIQUE(date, province, turno)
);

CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(date DESC);
CREATE INDEX IF NOT EXISTS idx_draws_turno ON draws(turno);
```

5. Click **Run** button
6. Verify: `Query successful (no results)`

---

## 🎯 Step 5: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.1.6
- Local:        http://localhost:3000
- Environments: .env.local, .env

✓ Ready in 2.5s
```

Open http://localhost:3000 in your browser. You should see the home page.

---

## 👤 Step 6: Create Test User (Optional but Recommended)

In a new terminal:

```bash
node test-premium.js test@example.com
```

**Expected Output:**
```
✓ Test user created: test@example.com
  Password: Test123!@#
  Premium: Enabled (1 year)
```

---

## 🗂️ Step 7: Populate Sample Data

In your terminal:

```bash
python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure
```

**Expected Output:**
```
Fetching: https://ruta1000.com.ar
Parsing quiniela data...
PREVIA: 5 numbers
PRIMERA: 5 numbers
MATUTINA: 5 numbers
VESPERTINA: 5 numbers
NOCTURNA: 5 numbers
✓ Inserted 5 draws to Supabase
```

**Note:** If you get errors like "Relation 'draws' does not exist", the table wasn't created properly. Go back to Step 4.

---

## 🧪 Step 8: Test Login Flow

### Option A: With Test User
1. Go to http://localhost:3000/login
2. Enter: `test@example.com` / `Test123!@#`
3. Click **Login**
4. You should be redirected to `/dashboard` with your email shown

### Option B: Create New User
1. Go to http://localhost:3000/register
2. Enter an email and password
3. Click **Register**
4. Auto-redirects to `/login`
5. Log in with your credentials
6. You'll have free access (no premium yet)

---

## 🎰 Step 9: View Predictions

1. Logged in at http://localhost:3000/dashboard
2. Click **"Ver Predicciones"** or navigate to http://localhost:3000/predictions
3. Select a turno: **PREVIA**, **PRIMERA**, **MATUTINA**, **VESPERTINA**, or **NOCTURNA**
4. See:
   - **2 Cifras** (blue card, always visible): 10 predicted numbers
   - **3 Cifras** (green card, 🔒 locked if not premium)
   - **4 Cifras** (purple card, 🔒 locked if not premium)

### If You See "Sin datos disponibles":
- Run Step 7 again
- Or check http://localhost:3000/pending to see if inserts failed

---

## 💳 Step 10: Test Premium Feature (Optional)

If you created a test user with premium status, you should see 3-cifras and 4-cifras predictions unlocked.

To upgrade another account to premium:

```bash
# Send a simulated payment webhook
curl -X POST "http://localhost:3000/api/webhooks/uala?test=1&email=your@email.com"
```

**Expected:** User gains premium access for 1 year.

---

## 🔄 Step 11: Retry Failed Inserts (Optional)

If some predictions didn't insert to Supabase:

1. Go to http://localhost:3000/pending
2. You'll see a list of failed inserts (from data/pending_draws.jsonl)
3. Click **Reintentar** to retry Supabase insert
4. On success, the row is removed from the queue

---

## ✨ Verification Checklist

After completing all steps, verify:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads successfully
- [ ] Can log in with credentials
- [ ] `/predictions` page shows predictions for at least one turno
- [ ] Can see 2-cifras (always visible)
- [ ] Premium features are 🔒 locked (or unlocked if premium account)
- [ ] `/pending` page loads (even if empty)
- [ ] `npm run lint` shows 0 errors/warnings
- [ ] `npm run build` completes successfully

---

## 🐛 Common Issues & Fixes

### ❌ Issue: "Cannot find module 'next'"
**Fix:** Run `npm install` in project root

### ❌ Issue: "Connection refused: ECONNREFUSED localhost:3000"
**Fix:** Dev server isn't running. Run `npm run dev`

### ❌ Issue: "Relation 'draws' does not exist"
**Fix:** Table wasn't created. Go back to Step 4 and run SQL in Supabase

### ❌ Issue: ".env.local not found"
**Fix:** Create the file in project root with Supabase credentials

### ❌ Issue: "Invalid API key"
**Fix:** Check your Supabase keys in `.env.local`. Make sure you copied the full key

### ❌ Issue: "TLS certificate verification failed"
**Fix:** When running scraper, add `--insecure` flag:
```bash
python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure
```

### ❌ Issue: Build fails with ESLint errors
**Fix:** Run `npm run lint` to see issues, then fix:
```bash
npm run lint -- --fix
```

---

## 🚀 Next Steps (Optional Enhancements)

Once setup is complete, you can:

1. **Deploy to Vercel:**
   ```bash
   git push origin main
   # Connect to Vercel: https://vercel.com/new
   ```

2. **Set up automatic daily ingestion:**
   - Use a cron job (e.g., GitHub Actions) to run `python scripts/ingest_ruta1000.py`
   - Or use Supabase Edge Functions for serverless scheduling

3. **Improve predictions:**
   - Modify `scripts/parse_quiniela.py` to analyze historical patterns
   - Add machine learning model in `/app/ia/iapredict.py`

4. **Add more payment gateways:**
   - Integrate Stripe, Mercado Pago, etc.
   - Webhook handlers in `/app/api/webhooks/`

---

## 📚 Documentation

- **Full docs:** See [DOCUMENTATION.md](DOCUMENTATION.md)
- **API reference:** See DOCUMENTATION.md → API Reference section
- **Architecture:** See DOCUMENTATION.md → Architecture section
- **Troubleshooting:** See DOCUMENTATION.md → Troubleshooting section

---

## 🎉 Success!

You should now have a fully functional **Quiniela Predictor** app running locally!

**Happy predicting! 🎰**

---

## 💬 Questions?

If something doesn't work:
1. Check the **Common Issues** section above
2. Verify all files are in place: `ls -la` (Linux/Mac) or `dir` (Windows)
3. Check Supabase project status in the dashboard
4. Look for error messages in the terminal

