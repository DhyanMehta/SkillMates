# Component Migration Guide

This guide shows how to migrate existing components from the local storage system to Supabase.

## Key Changes

### 1. Import Changes

**Before (Local Storage):**
```js
import { useAppStore } from '@/context/AppStore';
import userService from '../services/userService';
import requestService from '../services/requestService';
```

**After (Supabase):**
```ts
import { useSupabaseStore } from '@/context/SupabaseStore';
import { userService, requestService } from '../services';
// OR use React Query hooks for better UX:
import { useUser, useUsers, useCreateRequest } from '../hooks/useSupabaseQueries';
```

### 2. Context Usage

**Before:**
```js
const { users, requests, currentUserId, isAdmin } = useAppStore();
```

**After:**
```ts
const { users, sentRequests, receivedRequests, currentUser, isAdmin, isLoadingUsers } = useSupabaseStore();
```

### 3. Authentication

**Before:**
```js
// User ID was a number
const currentUserId = 123;
```

**After:**
```ts
// User ID is now a UUID string
const currentUserId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
```

### 4. Loading States

**Before:**
```js
const [loading, setLoading] = useState(false);
const [users, setUsers] = useState([]);

useEffect(() => {
  setLoading(true);
  userService.getAllUsers().then(response => {
    if (response.success) setUsers(response.data);
    setLoading(false);
  });
}, []);
```

**After (with React Query hooks):**
```ts
const { data: usersResponse, isLoading } = useUsers();
const users = usersResponse?.success ? usersResponse.data : [];
```

### 5. Mutations/Updates

**Before:**
```js
const handleUpdateProfile = async (userData) => {
  const response = await userService.updateUserProfile(userData);
  if (response.success) {
    // Handle success
  }
};
```

**After (with React Query):**
```ts
const updateProfileMutation = useUpdateUserProfile();

const handleUpdateProfile = async (userData) => {
  try {
    const response = await updateProfileMutation.mutateAsync(userData);
    if (response.success) {
      // Handle success - React Query automatically updates cache
    }
  } catch (error) {
    // Handle error
  }
};
```

## Step-by-Step Migration

### Step 1: Update Imports

Replace your service imports:
```ts
// Old
import userService from '../services/userService';

// New 
import { userService } from '../services';
```

### Step 2: Update Context Usage

Replace AppStore with SupabaseStore:
```ts
// Old
const { users, requests } = useAppStore();

// New
const { users, sentRequests, receivedRequests } = useSupabaseStore();
```

### Step 3: Handle Loading States

Add loading state handling:
```tsx
if (isLoadingUsers) {
  return <div>Loading...</div>;
}
```

### Step 4: Update User ID References

Change numeric IDs to string UUIDs:
```ts
// Old
const userId = 123;

// New  
const userId = user?.id; // UUID string
```

### Step 5: Use React Query Hooks (Optional but Recommended)

For better UX with caching and optimistic updates:
```ts
// Instead of direct service calls
const { data: userResponse, isLoading } = useUser(userId);
const createRequestMutation = useCreateRequest();
```

## Example Component Migration

### Before (Local Storage):

```jsx
import { useState, useEffect } from 'react';
import { useAppStore } from '@/context/AppStore';
import userService from '../services/userService';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAppStore();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const response = await userService.getUserProfile(userId);
      if (response.success) {
        setUser(response.data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  const handleUpdate = async (userData) => {
    const response = await userService.updateUserProfile(userData);
    if (response.success) {
      setUser(response.data);
      updateUser(response.data);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      {/* User profile content */}
    </div>
  );
};
```

### After (Supabase with React Query):

```tsx
import { useUser, useUpdateUserProfile } from '../hooks/useSupabaseQueries';
import { toast } from '@/components/ui/use-toast';

const UserProfile = ({ userId }: { userId: string }) => {
  const { data: userResponse, isLoading } = useUser(userId);
  const updateProfileMutation = useUpdateUserProfile();

  const user = userResponse?.success ? userResponse.data : null;

  const handleUpdate = async (userData: any) => {
    try {
      const response = await updateProfileMutation.mutateAsync(userData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      {/* User profile content */}
    </div>
  );
};
```

## Common Patterns

### Fetching Data with Error Handling

```tsx
const { data: response, isLoading, error } = useUsers();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
if (!response?.success) return <ErrorMessage message={response?.message} />;

const users = response.data;
```

### Creating Resources

```tsx
const createRequestMutation = useCreateRequest();

const handleCreateRequest = async (requestData) => {
  try {
    await createRequestMutation.mutateAsync(requestData);
    toast({ title: "Request sent!" });
  } catch (error) {
    toast({ title: "Failed to send request", variant: "destructive" });
  }
};
```

### Real-time Updates

```tsx
useEffect(() => {
  // Subscribe to real-time updates
  const unsubscribe = announcementService.subscribeToAnnouncements((announcement) => {
    // Handle new announcement
    queryClient.setQueryData(queryKeys.announcements, (old) => [announcement, ...old]);
  });

  return unsubscribe;
}, []);
```

## Testing Your Migration

1. **Authentication**: Test sign up, sign in, and sign out
2. **Data Display**: Verify all data loads correctly
3. **CRUD Operations**: Test create, read, update, delete operations
4. **Real-time Features**: Test any real-time subscriptions
5. **Error Handling**: Test error scenarios (network issues, validation errors)
6. **Performance**: Check loading states and caching behavior

## Troubleshooting

### "Cannot read property of undefined"
- Ensure you're checking for data existence before rendering
- Use optional chaining: `user?.name`

### "RLS policy violation" 
- Ensure user is authenticated
- Check your RLS policies in Supabase

### "Stale data"
- Use React Query's invalidation features
- Set appropriate stale times

### "Too many re-renders"
- Avoid creating objects in render functions
- Use useMemo for expensive calculations

Remember to test thoroughly after migration and consider implementing changes gradually rather than all at once.