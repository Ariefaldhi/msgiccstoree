# MsgiccStore

Platform top-up aplikasi premium #1 — modern digital marketplace built with Next.js and Supabase.

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (Auth + Database + Storage)
- **Tailwind CSS**
- **TypeScript**

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/MsgiccStoreV2.git
cd MsgiccStoreV2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can get these from your [Supabase project](https://supabase.com) under **Settings > API**.

### 4. Set Up the Database

Run the SQL in `db_schema.sql` inside your Supabase **SQL Editor** to create all tables, RLS policies, and triggers.

If you already have existing packages and want to add features support, also run `alter_table_features.sql`.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. Add your environment variables in **Vercel > Project > Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Admin Access

1. Register a new account.
2. In your Supabase dashboard, go to **Table Editor > profiles** and manually set `role = 'admin'` for your user.
3. Access the admin panel at `/admin`.

## Project Structure

```
app/
  admin/        # Admin dashboard (protected)
  login/        # Auth pages
  page.tsx      # Public storefront
components/
  admin/        # Admin-only components
lib/
  supabase/     # Supabase client helpers
```
