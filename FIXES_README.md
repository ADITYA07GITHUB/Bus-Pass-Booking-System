# 🛠️ Bug Fixes — Cloud Bus Pass System

## What Was Fixed & Why

---

### ✅ Fix 1 — Removed Demo Credentials from Login Page
**File:** `app/login/page.tsx`

The login page had hardcoded credentials visible to all users:
```
Admin: admin@demo.com / admin123
User:  user@demo.com  / user1234
```
These have been **removed**. No credentials should ever appear in the UI.

---

### ✅ Fix 2 — Login API No Longer Sends Password Hash
**File:** `app/api/auth/login/route.ts`

The original code used `user.toJSON()` which could include the hashed password in
the API response. Now a `safeUser` object is built manually, explicitly excluding
the password field.

Same fix applied to `app/api/auth/register/route.ts`.

---

### ✅ Fix 3 — Admin Dashboard Now Has Auth Guard
**File:** `app/admin/dashboard/page.tsx`

The dashboard had no protection — any URL visitor could see it.
Now it checks `isAuthenticated` and `user.role === "admin"` and redirects
immediately if either check fails.

---

### ✅ Fix 4 — Seed Script to Create Login Users
**File:** `scripts/seed.ts`

Your MongoDB database had no users, so login always returned "Invalid email or
password". This script creates your admin and test users.

---

## How to Apply These Fixes

### Step 1 — Copy fixed files into your project
Replace these files with the ones provided:
```
app/login/page.tsx
app/api/auth/login/route.ts
app/api/auth/register/route.ts
app/admin/dashboard/page.tsx
```

### Step 2 — Rotate your secrets (IMPORTANT)
Your `.env.local` was shared publicly. Do this NOW:

1. **MongoDB Atlas** → Database Access → Edit user `adityadhokchaule1_db_user` → Change Password
2. Generate new JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Generate new NEXTAUTH_SECRET (run same command again for a different value)
4. Update your `.env.local` with new values using the provided `.env.local.template`

### Step 3 — Seed your database with users
Install tsx if not already installed:
```bash
npm install -D tsx
```

Edit `scripts/seed.ts` and change the email/password values to YOUR credentials,
then run:
```bash
npx tsx scripts/seed.ts
```

You should see:
```
✅ Created admin: admin@cloudbuspass.com
✅ Created user: user@cloudbuspass.com
🎉 Seeding complete!
```

### Step 4 — Test login locally
```bash
npm run dev
```
Go to http://localhost:3000/login and sign in with the credentials you set in the seed script.

### Step 5 — Update .env.local for AWS
Before deploying, change:
```env
NEXTAUTH_URL=https://your-aws-domain-or-ip.com
NEXT_PUBLIC_APP_URL=https://your-aws-domain-or-ip.com
```

---

## Need More Files Fixed?

Please upload these files next if you have more issues:
- `store/slices/authSlice.ts` (Redux auth logic)
- `lib/mongodb.ts` (DB connection)
- `models/User.ts` (User schema)
- `middleware.ts` (route protection)
- Any other pages with errors
