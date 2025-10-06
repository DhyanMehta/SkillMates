# SkillMates# SkillMates - Skill Exchange Platform



A modern skill exchange platform where users can teach and learn from each other. Built with React, TypeScript, Supabase, and Tailwind CSS.A modern skill exchange platform built with React, TypeScript, and Supabase, where users can share their expertise and learn new skills through meaningful connections.



## 🚀 Features## 🚀 Features



- **User Authentication** - Secure login/signup with email verification- **User Authentication**: Secure sign-up, login, and password reset with Supabase Auth

- **User Profiles** - Comprehensive profiles with skills, bio, and ratings- **User Profiles**: Comprehensive profiles with skills offered/wanted, ratings, and reviews  

- **Skill Exchange** - Create requests to learn or teach skills- **Skill Matching**: Smart matching between users based on complementary skills

- **Rating System** - Rate and review completed exchanges- **Request System**: Send and manage skill exchange requests

- **Real-time Updates** - Live notifications and updates- **Real-time Chat**: Built-in messaging system for coordinating exchanges

- **Responsive Design** - Works perfectly on desktop and mobile- **Announcements**: Admin announcements and community updates

- **Admin Panel**: User moderation and content management

## 🛠️ Technology Stack- **Responsive Design**: Works seamlessly on desktop and mobile



- **Frontend**: React 18, TypeScript, Vite## 🛠️ Technologies Used

- **Backend**: Supabase (PostgreSQL + Auth + Real-time)

- **Styling**: Tailwind CSS, shadcn/ui components- **Frontend**: React 18, TypeScript, Vite

- **State Management**: React Context API- **UI Components**: shadcn/ui, Tailwind CSS, Radix UI

- **Routing**: React Router v6- **Backend**: Supabase (Database, Auth, Real-time)

- **State Management**: React Query (@tanstack/react-query)

## 📦 Installation- **Routing**: React Router DOM

- **Styling**: Tailwind CSS with custom components

1. Clone the repository:

```bash## 📋 Prerequisites

git clone https://github.com/DhyanMehta/SkillMates.git

cd SkillMates- Node.js 16+ and npm

```- A Supabase account and project



2. Install dependencies:## 🏗️ Setup Instructions

```bash

npm install### 1. Clone and Install

```

```bash

3. Set up environment variables:# Clone the repository

```bashgit clone <YOUR_GIT_URL>

cp .env.example .envcd SkillMates

```

# Install dependencies

Update the `.env` file with your Supabase credentials:npm install

```env```

VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key### 2. Set Up Supabase

```

1. **Create a Supabase Project**:

4. Start the development server:   - Go to [supabase.com](https://supabase.com) and create a new project

```bash   - Note your project URL and anon key from Settings → API

npm run dev

```2. **Set Up Database Schema**:

   - Open the Supabase SQL Editor

## 🏗️ Build & Deploy   - Copy and run the SQL from `supabase-schema.sql`



1. Build for production:3. **Configure Environment Variables**:

```bash   ```bash

npm run build   # Copy the example environment file

```   cp .env.example .env.local

   

2. Preview the production build:   # Edit .env.local with your Supabase credentials

```bash   VITE_SUPABASE_URL=https://your-project-id.supabase.co

npm run preview   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

```   ```



3. Deploy to your preferred platform (Vercel, Netlify, etc.)### 3. Start Development Server



## 🗄️ Database Setup```bash

npm run dev

The application uses Supabase as the backend. Make sure to:```



1. Create a Supabase projectVisit `http://localhost:5173` to see the application.

2. Set up the required tables (users, swap_requests, ratings)

3. Configure Row Level Security (RLS) policies## 📚 Documentation

4. Update your environment variables

- **[Supabase Setup Guide](SUPABASE_SETUP.md)**: Complete setup instructions for Supabase

## 📱 Usage- **[Migration Guide](MIGRATION_GUIDE.md)**: Guide for migrating from local storage to Supabase



1. **Sign up** for a new account or **login** to existing one## 🏗️ Project Structure

2. **Complete your profile** with skills you can teach and want to learn

3. **Browse users** and find people with skills you're interested in```

4. **Send requests** to connect with other userssrc/

5. **Exchange skills** and **rate** your experience├── components/          # Reusable UI components

│   ├── ui/             # shadcn/ui components

## 🤝 Contributing│   └── ...             # Custom components

├── context/            # React contexts

1. Fork the repository│   ├── AuthContext.jsx # Authentication context

2. Create a feature branch (`git checkout -b feature/amazing-feature`)│   └── SupabaseStore.tsx # Supabase data management

3. Commit your changes (`git commit -m 'Add some amazing feature'`)├── hooks/              # Custom React hooks

4. Push to the branch (`git push origin feature/amazing-feature`)│   └── useSupabaseQueries.ts # React Query hooks

5. Open a Pull Request├── lib/                # Utility libraries

│   ├── supabase.ts     # Supabase configuration

## 📄 License│   └── utils.ts        # General utilities

├── pages/              # Route components/pages

This project is open source and available under the [MIT License](LICENSE).├── services/           # API services

│   ├── supabase*.ts    # Supabase service layers

## 🙏 Acknowledgments│   └── index.ts        # Service exports

└── ...

- Built with [Vite](https://vitejs.dev/)```

- UI components from [shadcn/ui](https://ui.shadcn.com/)

- Backend powered by [Supabase](https://supabase.com/)## 🔑 Key Features Implementation

- Icons by [Lucide React](https://lucide.dev/)

### Authentication

## 📞 Support- Uses Supabase Auth for secure user management

- Automatic profile creation on sign-up

If you have any questions or need help, please open an issue on GitHub.- Password reset via email

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
