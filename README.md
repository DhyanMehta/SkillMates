# SkillMates - Skill Exchange Platform

A modern skill exchange platform built with React, TypeScript, and Supabase, where users can share their expertise and learn new skills through meaningful connections.

## 🚀 Features

- **User Authentication**: Secure sign-up, login, and password reset with Supabase Auth
- **User Profiles**: Comprehensive profiles with skills offered/wanted, ratings, and reviews  
- **Skill Matching**: Smart matching between users based on complementary skills
- **Request System**: Send and manage skill exchange requests
- **Real-time Chat**: Built-in messaging system for coordinating exchanges
- **Announcements**: Admin announcements and community updates
- **Admin Panel**: User moderation and content management
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (Database, Auth, Real-time)
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with custom components

## 📋 Prerequisites

- Node.js 16+ and npm
- A Supabase account and project

## 🏗️ Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd SkillMates

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project URL and anon key from Settings → API

2. **Set Up Database Schema**:
   - Open the Supabase SQL Editor
   - Copy and run the SQL from `supabase-schema.sql`

3. **Configure Environment Variables**:
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your Supabase credentials
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📚 Documentation

- **[Supabase Setup Guide](SUPABASE_SETUP.md)**: Complete setup instructions for Supabase
- **[Migration Guide](MIGRATION_GUIDE.md)**: Guide for migrating from local storage to Supabase

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── context/            # React contexts
│   ├── AuthContext.jsx # Authentication context
│   └── SupabaseStore.tsx # Supabase data management
├── hooks/              # Custom React hooks
│   └── useSupabaseQueries.ts # React Query hooks
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase configuration
│   └── utils.ts        # General utilities
├── pages/              # Route components/pages
├── services/           # API services
│   ├── supabase*.ts    # Supabase service layers
│   └── index.ts        # Service exports
└── ...
```

## 🔑 Key Features Implementation

### Authentication
- Uses Supabase Auth for secure user management
- Automatic profile creation on sign-up
- Password reset via email

### Data Management  
- **Users**: Profile management, skills, ratings
- **Requests**: Skill exchange request lifecycle
- **Chat**: Real-time messaging between users
- **Announcements**: Admin communications

### Real-time Features
- Live chat messaging
- Real-time announcements
- Instant request notifications

### Security
- Row Level Security (RLS) policies
- User-specific data access
- Secure API endpoints

## 🚀 Deployment

### Using Lovable (Recommended)
1. Open [Lovable](https://lovable.dev/projects/01b50079-c7a0-4edb-8edf-10abcdd89904)
2. Click Share → Publish
3. Configure your environment variables in the deployment settings

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables in your hosting dashboard

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [Supabase Setup Guide](SUPABASE_SETUP.md) for setup issues
- Review the [Migration Guide](MIGRATION_GUIDE.md) for upgrading
- Open an issue for bug reports or feature requests

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components  
- [Tailwind CSS](https://tailwindcss.com) for the styling system
- [React Query](https://tanstack.com/query) for data fetching and caching
