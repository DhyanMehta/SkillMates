# Deployment Guide

This guide covers deployment options for the SkillMates application.

## Prerequisites

1. **Environment Variables**: Set up your environment variables on the deployment platform:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

2. **Database**: Ensure your Supabase project is set up with the required tables and RLS policies.

## Deployment Options

### 1. Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **GitHub Integration**:
   - Connect your GitHub repository to Vercel
   - Vercel will automatically deploy on every push to main branch

3. **Manual Deployment**:
   ```bash
   npm run deploy:vercel
   ```

4. **Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add your Supabase credentials

### 2. Netlify

1. **Install Netlify CLI** (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. **GitHub Integration**:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Manual Deployment**:
   ```bash
   npm run deploy:netlify
   ```

4. **Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add your Supabase credentials

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