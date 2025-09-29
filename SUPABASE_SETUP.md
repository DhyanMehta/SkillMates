# Supabase Integration Setup Guide

This guide will help you set up Supabase as the backend for your SkillMates application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: SkillMates (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 2-3 minutes)

## Step 2: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql` from your project root
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL script

This will create:
- Users table (extends Supabase auth.users)
- Swap requests table
- Announcements table
- Chat threads and messages tables
- All necessary indexes and Row Level Security policies
- Triggers for automatic user profile creation

## Step 3: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## Step 5: Update Your Application

### Option A: Full Migration (Recommended for new projects)

Replace the existing providers in your main App file:

```tsx
// Replace AppStoreProvider with SupabaseStoreProvider
import { SupabaseStoreProvider } from './context/SupabaseStore';

function App() {
  return (
    <SupabaseStoreProvider>
      <AuthContextProvider>
        {/* Your app content */}
      </AuthContextProvider>
    </SupabaseStoreProvider>
  );
}
```

### Option B: Gradual Migration (For existing projects with data)

You can use both systems side by side:

```tsx
import { AppStoreProvider } from './context/AppStore';
import { SupabaseStoreProvider } from './context/SupabaseStore';

function App() {
  return (
    <SupabaseStoreProvider>
      <AppStoreProvider>
        <AuthContextProvider>
          {/* Your app content */}
        </AuthContextProvider>
      </AppStoreProvider>
    </SupabaseStoreProvider>
  );
}
```

## Step 6: Update Component Imports

For components that currently use the local storage services, you can now use:

### Instead of:
```js
import { userService } from '../services/userService';
```

### Use:
```ts
import { userService } from '../services'; // Now uses Supabase
// OR use React Query hooks for better UX:
import { useUser, useUpdateUserProfile } from '../hooks/useSupabaseQueries';
```

### Example component update:
```tsx
// Old way
const [user, setUser] = useState(null);
useEffect(() => {
  userService.getUserProfile(userId).then(response => {
    if (response.success) setUser(response.data);
  });
}, [userId]);

// New way with React Query
const { data: userResponse, isLoading } = useUser(userId);
const user = userResponse?.success ? userResponse.data : null;
```

## Step 7: Authentication Flow

The authentication now uses Supabase Auth:

1. **Sign up**: Creates both Supabase auth user and profile in users table
2. **Sign in**: Uses Supabase authentication
3. **Password reset**: Supported via email
4. **Session management**: Automatic with Supabase

Users will need to create new accounts (existing local storage data won't carry over).

## Step 8: Real-time Features (Optional)

Supabase supports real-time subscriptions. Some services already include subscription methods:

```ts
// Example: Subscribe to new announcements
const unsubscribe = announcementService.subscribeToAnnouncements((announcement) => {
  console.log('New announcement:', announcement);
});

// Don't forget to unsubscribe when component unmounts
return () => unsubscribe();
```

## Step 9: Row Level Security (RLS)

The database schema includes comprehensive RLS policies:

- Users can only see public profiles or their own
- Users can only view/modify requests they're involved in
- Chat messages are only visible to thread participants
- Announcements are read-only for regular users

## Step 10: Testing

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Test creating skill requests
4. Verify data persistence across browser sessions

## Deployment Considerations

When deploying to production:

1. **Environment Variables**: Set up your production environment variables
2. **Database Backups**: Enable automatic backups in Supabase dashboard
3. **Database Migrations**: Use Supabase CLI for schema changes
4. **Monitoring**: Set up alerts in Supabase dashboard

## Troubleshooting

### Common Issues:

1. **"Failed to fetch"**: Check your environment variables
2. **"Row Level Security violation"**: Verify user is authenticated
3. **"Function not found"**: Ensure schema was applied correctly
4. **"Invalid JWT"**: Clear browser storage and re-authenticate

### Debugging:

1. Check browser console for errors
2. Use Supabase dashboard logs
3. Verify network requests in browser dev tools

## Advanced Features

Once the basic setup is working, you can explore:

1. **File storage**: For user avatars and documents
2. **Edge functions**: For custom server-side logic
3. **Webhooks**: For integrating with external services
4. **Custom domains**: For professional email templates

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com/)
- Check the generated TypeScript types in `src/lib/supabase.ts`