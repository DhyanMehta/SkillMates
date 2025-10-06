# Deployment Guide

This guide covers deployment options for the SkillMates application.

## Prerequisites

1. **Environment Variables**: Set up your environment variables on the deployment platform:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

2. **Database**: Ensure your Supabase project is set up with the required tables and RLS policies.

## Deployment Options

### 1. Vercel (Recommended)

1. **GitHub Integration** (Recommended):
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project

2. **Environment Variables Setup**:
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add the following variables:
     - `VITE_SUPABASE_URL` → Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` → Your Supabase anonymous key
   - Make sure to add them for all environments (Production, Preview, Development)

3. **Manual Deployment** (optional):
   ```bash
   npm install -g vercel
   npm run build
   vercel --prod
   ```

4. **Automatic Deployments**:
   - Every push to `main` branch will trigger automatic deployment
   - Pull requests will create preview deployments

### 2. Netlify

1. **GitHub Integration** (Recommended):
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect to GitHub and select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

2. **Environment Variables Setup**:
   - In Netlify Dashboard → Site Settings → Environment Variables
   - Add the following variables:
     - `VITE_SUPABASE_URL` → Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` → Your Supabase anonymous key

3. **Manual Deployment** (optional):
   ```bash
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod --dir=dist
   ```

4. **Automatic Deployments**:
   - Every push to `main` branch will trigger automatic deployment
   - Pull requests will create deploy previews

### 3. Other Platforms

The application can be deployed on any static hosting platform:
- **Firebase Hosting**
- **GitHub Pages** (with GitHub Actions)
- **AWS S3 + CloudFront**
- **DigitalOcean App Platform**

## Build Commands

- **Development Build**: `npm run build:dev`
- **Production Build**: `npm run build:prod`
- **Preview Build**: `npm run preview`

## Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase database set up
- [ ] Build runs successfully (`npm run build`)
- [ ] No console errors in production build
- [ ] All features tested
- [ ] Performance optimized
- [ ] Security vulnerabilities addressed

## Post-deployment

1. **Test all functionality** in the deployed environment
2. **Monitor performance** and fix any issues
3. **Set up analytics** (optional)
4. **Configure custom domain** (optional)

## Troubleshooting

### Build Failures
- Check for TypeScript errors: `npm run type-check`
- Fix linting issues: `npm run lint:fix`
- Clear cache and rebuild: `npm run clean && npm run build`

### Runtime Issues
- Check environment variables are set correctly
- Verify Supabase connection and database schema
- Check browser console for errors

### Performance Issues
- Analyze bundle size
- Enable compression on hosting platform
- Optimize images and assets
- Consider implementing code splitting