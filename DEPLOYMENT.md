# Ashama AI - Deployment Guide

This guide provides step-by-step instructions for deploying Ashama AI to production.

---

## 🎯 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Production API key obtained
- [ ] Environment variables configured
- [ ] Build tested with `npm run build && npm run preview`
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)

---

## 🔑 API Key Setup

### Development vs Production Keys

It's recommended to use separate API keys for development and production:

1. **Development Key**: Used in `.env.local` (not committed to git)
2. **Production Key**: Set in hosting platform environment variables

### Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Store securely - never commit to version control

### For Veo Video Generation

Veo requires a paid Google Cloud billing project:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable billing for the project
4. Enable the Vertex AI API
5. Create an API key associated with the billing project
6. See [Gemini API Billing](https://ai.google.dev/gemini-api/docs/billing) for pricing

---

## 🚀 Deployment Options

### Option 1: Firebase Hosting (Recommended)

Firebase Hosting is fast, secure, and has excellent CDN support.

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Login to Firebase

```bash
firebase login
```

#### Step 3: Initialize Firebase

```bash
firebase init hosting
```

Select:
- Use an existing project or create new
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No` (we'll build manually)

#### Step 4: Build the Project

```bash
npm run build
```

#### Step 5: Deploy

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project.web.app`

#### Step 6: Set Environment Variables

Firebase Hosting doesn't support server-side environment variables for static sites. You have two options:

**Option A: Build-time variables** (Recommended)
```bash
# Set env var before building
$env:VITE_GEMINI_API_KEY="your_production_key"
npm run build
firebase deploy
```

**Option B: Use Firebase Functions** (More secure)
Create a Firebase Function to proxy API calls and keep the key server-side.

---

### Option 2: Vercel

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
vercel
```

Follow the prompts to link your project.

#### Step 3: Set Environment Variables

```bash
vercel env add VITE_GEMINI_API_KEY
```

Paste your production API key when prompted.

#### Step 4: Redeploy

```bash
vercel --prod
```

---

### Option 3: Netlify

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Build

```bash
npm run build
```

#### Step 3: Deploy

```bash
netlify deploy --prod --dir=dist
```

#### Step 4: Set Environment Variables

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add `VITE_GEMINI_API_KEY` with your production key
3. Trigger a new deploy

---

### Option 4: GitHub Pages

#### Step 1: Update `vite.config.ts`

```typescript
export default defineConfig({
  base: '/ashama-ai/', // Replace with your repo name
  plugins: [react()],
});
```

#### Step 2: Build

```bash
npm run build
```

#### Step 3: Deploy

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

npm run deploy
```

**Note**: GitHub Pages doesn't support environment variables. You'll need to hardcode the API key (not recommended for production) or use a backend proxy.

---

## 🔒 Security Best Practices

### 1. API Key Protection

**Never expose your API key in client-side code for production!**

For production, consider:
- Using a backend proxy to make API calls
- Implementing API key rotation
- Setting up usage quotas and alerts

### 2. Domain Restrictions

In Google Cloud Console:
1. Go to APIs & Services → Credentials
2. Edit your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your production domain(s)

### 3. Rate Limiting

Implement client-side rate limiting to prevent abuse:
- Maximum requests per minute
- Cooldown periods
- User authentication (optional)

---

## 📊 Monitoring & Analytics

### Error Tracking with Sentry (Optional)

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Install Sentry SDK:
   ```bash
   npm install @sentry/react
   ```
4. Initialize in `index.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production",
   });
   ```

### Analytics (Privacy-Respecting)

Consider using:
- **Plausible Analytics**: Privacy-friendly, GDPR compliant
- **Simple Analytics**: No cookies, privacy-first
- **Google Analytics 4**: Most features, but privacy concerns

---

## 🧪 Testing Production Build Locally

Before deploying, always test the production build:

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

Open `http://localhost:4173` and test:
- All chat features
- Voice chat
- Export functionality
- Offline mode
- Mobile responsiveness

---

## 🔄 Continuous Deployment

### GitHub Actions (Firebase)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

Add `VITE_GEMINI_API_KEY` to GitHub Secrets.

---

## 🌍 Custom Domain Setup

### Firebase Hosting

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Add the provided DNS records to your domain registrar
5. Wait for SSL certificate provisioning (can take up to 24 hours)

### Vercel

1. In Vercel dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

---

## 📈 Performance Optimization

### 1. Code Splitting

Vite automatically code-splits. Verify with:
```bash
npm run build
```

Check that multiple JS chunks are created in `dist/assets/`.

### 2. Image Optimization

If adding custom images:
- Use WebP format
- Compress images
- Use lazy loading

### 3. Caching Strategy

The app already implements:
- LocalStorage for chat history
- Response caching (30min TTL)
- Service worker (optional enhancement)

---

## 🐛 Troubleshooting Deployment

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Environment Variables Not Working

- Ensure they start with `VITE_`
- Restart dev server after changes
- Check hosting platform's env var syntax

### API Calls Fail in Production

- Verify API key is set correctly
- Check domain restrictions in Google Cloud Console
- Verify CORS settings
- Check browser console for errors

### Blank Page After Deployment

- Check browser console for errors
- Verify `base` path in `vite.config.ts`
- Ensure all assets are in `dist/`
- Check hosting platform's SPA configuration

---

## 📞 Support

For deployment issues specific to Ashama AI, contact:

**Newaz Nezif**  
AI Engineer & Cyber Analyst  
Jimma AI Lab

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all features in production
2. ✅ Monitor error logs for 24-48 hours
3. ✅ Set up uptime monitoring (e.g., UptimeRobot)
4. ✅ Share with users and gather feedback
5. ✅ Plan iterative improvements

---

<div align="center">
  <p><strong>Ashama AI - Production Ready</strong></p>
  <p>Built with ❤️ by Newaz Nezif</p>
</div>
