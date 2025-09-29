# SkillMates Supabase Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Get Your Supabase Project Ready

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create new project**:
   - Name: `SkillMates` 
   - Password: `[generate strong password]`
   - Region: `[closest to your users]`

### 2. Set Up Database

1. **Go to SQL Editor in Supabase dashboard**
2. **Copy and paste the entire contents of `supabase-schema.sql`**
3. **Click "RUN" to execute**
   - ✅ Should see "Success. No rows returned"

### 3. Get Your API Keys

1. **Go to Settings → API**
2. **Copy these two values**:
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGc...` (long string)

### 4. Configure Your App

1. **Copy the environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your values**:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

### 5. Start the App

```bash
npm install
npm run dev
```

🎉 **That's it!** Your app should be running at `http://localhost:5173`

## ✅ Test Your Setup

1. **Visit the app** and click "Sign Up"
2. **Create a test account** with your email
3. **Check your email** and confirm your account
4. **Log in and try**:
   - Updating your profile
   - Adding skills
   - Browsing other users (create a second account to test)

## 🔧 Troubleshooting

### "Failed to fetch" error
- ✅ Check your `.env.local` file has the correct Supabase URL and key
- ✅ Make sure you saved the file as `.env.local` (not `.env.local.txt`)

### "Schema/table doesn't exist" error  
- ✅ Make sure you ran the SQL schema in Supabase SQL Editor
- ✅ Check the SQL executed without errors

### Email confirmation not working
- ✅ Check spam/junk folder
- ✅ In Supabase: Settings → Auth → Email Templates (customize if needed)

### Can't see other users
- ✅ Create multiple test accounts to see the user directory
- ✅ Make sure user profiles are set to "public"

## 📋 Next Steps

Once basic setup works:

1. **Customize the database** (add your own fields)
2. **Update the UI** (change colors, layout, etc.)
3. **Add features** (file uploads, notifications, etc.)
4. **Deploy to production**

## 🆘 Need Help?

- **Database issues**: Check Supabase dashboard → Logs
- **Auth issues**: Supabase dashboard → Auth → Users  
- **App issues**: Check browser console (F12)

**Still stuck?** Create an issue in the GitHub repository with:
- What you were trying to do
- Error message (if any)
- Screenshots of Supabase dashboard

---

**Tip**: Keep your Supabase dashboard open in another tab - you'll refer to it often during development!