# Quiniela Predictor - Complete Documentation

## 📋 Project Overview

**Quiniela IA** is a full-stack web application for predicting lottery numbers from the Buenos Aires Quiniela (a numbers lottery). The app provides:

- **Free Tier**: Access to 2-digit predictions (10 numbers)
- **Premium Tier**: Access to 3-digit and 4-digit predictions
- **Real-time Data**: Automatic scraping from [ruta1000.com.ar](https://ruta1000.com.ar)
- **5 Daily Turnos**: PREVIA, PRIMERA, MATUTINA, VESPERTINA, NOCTURNA
- **3D Visualization**: Interactive 3D display of top predictions
- **Local Fallback**: SQLite + JSONL storage when Supabase is unavailable

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (App Router)              │
├─────────────────────────────────────────────────────────────────┤
│  / (home) → /login → /register → /predictions → /pending        │
│  /dashboard → /profile                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    REST API Endpoints                           │
├─────────────────────────────────────────────────────────────────┤
│  /api/predictions?turno=PREVIA&premium=1                       │
│  /api/pending                  (list failed inserts)            │
│  /api/retry                    (retry failed inserts)           │
│  /api/init-db                  (check draws table)              │
│  /api/webhooks/uala            (payment webhook)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Data Storage Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  PRIMARY: Supabase PostgreSQL (draws table)                    │
│  FALLBACK: SQLite (data/draws.db)                              │
│  FALLBACK: JSONL (data/pending_draws.jsonl)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Python Ingestion Scripts                       │
├─────────────────────────────────────────────────────────────────┤
│  scripts/html_to_json.py       (generic HTML→JSON scraper)     │
│  scripts/parse_quiniela.py     (Quiniela-specific parser)       │
│  scripts/ingest_ruta1000.py    (fetch→parse→store logic)       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Data Source                         │
├─────────────────────────────────────────────────────────────────┤
│  https://ruta1000.com.ar (Quiniela results by turno)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Premium Gating

### User Roles
- **Free User**: Can view 2-cifra predictions
- **Premium User**: Can view 2-cifra, 3-cifra, 4-cifra predictions

### Premium Status Storage
User metadata in Supabase Auth:
```json
{
  "role": "premium",
  "premium_expires": "2025-12-31T23:59:59Z"
}
```

### Premium Check Flow
1. Frontend: `getSupabase()` retrieves user and checks `user.user_metadata.role === 'premium'`
2. Backend API: `?premium=1` query param filters predictions by tier
3. UI: Premium content shows lock icons 🔒 when not premium

---

## 📊 Data Pipeline

### 1. Scraping (Python)
```bash
python scripts/ingest_ruta1000.py [URL] [--insecure]
```
- Fetches HTML from ruta1000.com.ar
- Parses by turno using `parse_quiniela.py`
- Normalizes numbers: "01" → 1, "99" → 99

### 2. Ingestion Logic
For each parsed turno:
```
┌─ Try INSERT to Supabase
│  └─ Success (201) → Done
│  └─ Error (e.g., 404 table missing)
│     ├─ Append to data/pending_draws.jsonl
│     └─ Insert to data/draws.db (SQLite)
```

### 3. Data Format (JSONL)
```jsonl
{"date":"2025-01-15","turno":"PREVIA","numbers":[1,23,45,67,89],"province":"Nacional","source":"ruta1000"}
{"date":"2025-01-15","turno":"PRIMERA","numbers":[12,34,56,78,90],"province":"Nacional","source":"ruta1000"}
```

### 4. Retry Mechanism
Via `/api/retry` endpoint:
```
POST /api/retry { id: 0 }
→ Fetch row from pending_draws.jsonl[0]
→ Attempt INSERT to Supabase
→ On success: Remove row from JSONL, delete Supabase entry
→ On error: Keep in JSONL, user can retry later
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ (installed with `nvm` recommended)
- Python 3.9+ (with pip)
- Supabase account (free tier at https://supabase.com)

### Step 1: Clone & Install Dependencies
```bash
cd quiniela-ia
npm install
pip install -r scripts/requirements-scraper.txt
```

### Step 2: Configure Supabase
1. Create a Supabase project: https://app.supabase.com
2. Get your credentials:
   - **NEXT_PUBLIC_SUPABASE_URL**: Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Anon public key
   - **SUPABASE_SERVICE_ROLE_KEY**: Service role key (⚠️ keep private)
3. Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Create Database Table
Run the SQL in Supabase SQL Editor:
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

Or call the endpoint:
```bash
curl -X POST http://localhost:3000/api/init-db
```

### Step 4: Start Development Server
```bash
npm run dev
```
App runs at http://localhost:3000

### Step 5: Populate Test Data
```bash
python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure
```

This fetches live data from ruta1000 and inserts to Supabase (or local fallback if table missing).

---

## 🧪 Testing

### Test Local Development Flow

#### 1. Create Test User (Admin Only)
```bash
# Generate service role key (from Supabase Dashboard > Settings > API)
# Then run:
node test-premium.js test@example.com
```

This creates a user with:
- Email: `test@example.com`
- Password: `Test123!@#`
- Premium role: ✓ Active for 1 year

#### 2. Simulate Payment Webhook
```bash
# Trigger payment simulation (no HMAC verification in test mode)
curl -X POST http://localhost:3000/api/webhooks/uala \
  -H "Content-Type: application/json" \
  -d '{"eventType":"payment_confirmed","user_email":"test@example.com"}'
```

Or use URL param:
```
http://localhost:3000/api/webhooks/uala?test=1&email=test@example.com
```

#### 3. View Predictions
1. Open http://localhost:3000/login
2. Enter `test@example.com` / `Test123!@#`
3. Navigate to /predictions
4. Select turno (PREVIA, PRIMERA, etc.)
5. View 2-cifra (always visible) + 3-cifra & 4-cifra (premium only)

#### 4. Troubleshoot Pending Inserts
1. Go to http://localhost:3000/pending
2. View rows that failed to insert (JSONL entries)
3. Click "Reintentar" to retry Supabase insert

---

## 📁 Project Structure

```
quiniela-ia/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── libsupabase.js              # Supabase client
│   ├── globals.css                 # Tailwind styles
│   │
│   ├── api/
│   │   ├── predictions/
│   │   │   └── route.js            # GET /api/predictions?turno=PREVIA&premium=1
│   │   ├── pending/
│   │   │   └── route.js            # GET /api/pending (list failed inserts)
│   │   ├── retry/
│   │   │   └── route.js            # POST /api/retry (retry failed insert)
│   │   ├── init-db/
│   │   │   └── route.js            # POST /api/init-db (check table)
│   │   └── webhooks/
│   │       └── uala/
│   │           └── route.js        # POST /api/webhooks/uala (payment)
│   │
│   ├── auth/
│   │   ├── login/page.jsx          # Login page
│   │   ├── register/page.jsx       # Register page
│   │   └── forgot-password/page.jsx
│   │
│   ├── predictions/
│   │   └── page.jsx                # Main predictions page (turno selector + premium gating)
│   ├── pending/
│   │   └── page.jsx                # Pending inserts queue page
│   ├── dashboard/
│   │   └── page.jsx                # User dashboard
│   ├── profile/
│   │   └── page.jsx                # User profile
│   │
│   ├── components/
│   │   └── ThreeScene.jsx          # 3D visualization component
│   │
│   └── ia/
│       └── iapredict.py            # (Legacy) AI prediction logic
│
├── scripts/
│   ├── html_to_json.py             # Generic HTML→JSON scraper
│   ├── parse_quiniela.py           # Quiniela-specific parser (by turno)
│   ├── ingest_ruta1000.py          # Full pipeline (fetch→parse→store)
│   └── requirements-scraper.txt    # Python dependencies
│
├── data/
│   ├── pending_draws.jsonl         # Failed inserts queue (JSONL)
│   └── draws.db                    # SQLite fallback database
│
├── public/                         # Static assets
├── test-premium.js                 # Test user creation script
├── .env.local                      # Supabase credentials (⚠️ DON'T COMMIT)
├── package.json                    # Node dependencies
├── tsconfig.json                   # TypeScript config
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind CSS config
└── README.md                       # Quick start guide

```

---

## 🔌 API Reference

### GET /api/predictions
Fetch predictions for a given turno and premium tier.

**Query Params:**
- `turno` (required): PREVIA | PRIMERA | MATUTINA | VESPERTINA | NOCTURNA
- `premium` (optional): 0 (free) | 1 (premium). Default: 0

**Response:**
```json
{
  "two": [1, 23, 45, 67, 89],
  "three": [123, 234, 345],
  "four": [1234, 2345]
}
```

**Note:** If `premium=0`, only `two` is populated. Premium tiers return `three` and `four`.

---

### GET /api/pending
List all pending (failed) draw inserts.

**Response:**
```json
[
  {"id": 0, "status": "pending", "data": {...}},
  {"id": 1, "status": "pending", "data": {...}}
]
```

---

### POST /api/retry
Retry a single pending insert to Supabase.

**Body:**
```json
{"id": 0}
```

**Response:**
```json
{"success": true, "message": "Moved to Supabase"}
```

On failure, row stays in JSONL for next retry.

---

### POST /api/init-db
Check if `draws` table exists. If not, return SQL snippet.

**Response (table exists):**
```json
{"ok": true, "message": "Table draws exists"}
```

**Response (table missing):**
```json
{
  "warning": "Table draws does not exist. Please run SQL manually...",
  "sql": "CREATE TABLE IF NOT EXISTS...",
  "next": "Go to Supabase > SQL Editor and paste the SQL above"
}
```

---

### POST /api/webhooks/uala
Payment webhook handler (Ualá integration).

**Body:**
```json
{
  "eventType": "payment_confirmed",
  "user_email": "user@example.com",
  "amount": 99.99
}
```

**Test Mode:** (No HMAC verification)
```
POST /api/webhooks/uala?test=1&email=user@example.com
```

---

## 🐛 Troubleshooting

### Issue: "Table draws does not exist" (404)
**Solution:**
1. Call `POST /api/init-db`
2. Copy the SQL snippet
3. Go to Supabase Dashboard > SQL Editor
4. Paste and execute the SQL

---

### Issue: Predictions show "Sin datos disponibles"
**Solution:**
1. Run ingestion: `python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure`
2. Check pending: `GET /api/pending`
3. Retry failed: `POST /api/retry` with pending `id`

---

### Issue: "TLS certificate error" during scraping
**Solution:** Add `--insecure` flag (skips certificate verification during dev):
```bash
python scripts/ingest_ruta1000.py https://ruta1000.com.ar --insecure
```

---

### Issue: Supabase credentials rejected
**Solution:**
1. Verify `.env.local` is in project root
2. Check credentials in Supabase Dashboard > Settings > API
3. Ensure SERVICE_ROLE_KEY starts with `eyJ`
4. Restart `npm run dev` after updating `.env.local`

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push to GitHub: `git push origin main`
2. Connect Vercel: https://vercel.com/new
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy: Click "Deploy"

### Deploy to Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t quiniela-ia .
docker run -e NEXT_PUBLIC_SUPABASE_URL=... -p 3000:3000 quiniela-ia
```

---

## 📈 Performance & Caching

- **Predictions Cache**: 5-minute client-side cache via state
- **3D Visualization**: Lazy-loaded via `react-three-fiber` (300KB)
- **Database Indexes**: `idx_draws_date` (most queries), `idx_draws_turno`
- **CDN**: Vercel CDN for static assets (if deployed)

---

## 🔒 Security

- ✅ **Auth**: Supabase JWT with expiration
- ✅ **Service Key**: Stored in `.env.local` (never committed)
- ✅ **Premium Check**: Server-side verification in API routes
- ✅ **Webhook HMAC**: Production uses HMAC verification (test mode skips for local dev)
- ⚠️ **TODO**: Add rate limiting on `/api/predictions` for free tier

---

## 📝 License

This project is provided as-is for educational purposes. Quiniela data is for entertainment only.

---

## 🤝 Support

For issues:
1. Check the **Troubleshooting** section above
2. Review `.env.local` configuration
3. Check Supabase Dashboard for table status
4. Run `npm run lint && npm run build` to validate

