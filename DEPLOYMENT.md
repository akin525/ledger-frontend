# Deployment Guide - Bills Ledger Frontend

This guide covers deploying the Bills Ledger frontend to various platforms.

## Prerequisites

- Node.js 18+ installed
- Backend API deployed and accessible
- Environment variables configured

## Environment Variables

Before deployment, ensure you have the following environment variables set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_WS_URL=https://your-backend-api.com
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

**Steps:**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd bills-frontend
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

**Custom Domain:**
- Add your custom domain in Vercel dashboard
- Update DNS records as instructed

### 2. Netlify

**Steps:**

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Set environment variables:
   ```bash
   netlify env:set NEXT_PUBLIC_API_URL "https://your-api.com/api"
   netlify env:set NEXT_PUBLIC_WS_URL "https://your-api.com"
   ```

### 3. Docker

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and Run:**

```bash
docker build -t bills-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api.com/api \
  -e NEXT_PUBLIC_WS_URL=https://your-api.com \
  bills-frontend
```

### 4. AWS (EC2 + Nginx)

**Steps:**

1. SSH into your EC2 instance

2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clone and setup:
   ```bash
   git clone <your-repo>
   cd bills-frontend
   npm install
   npm run build
   ```

4. Install PM2:
   ```bash
   sudo npm install -g pm2
   ```

5. Start the application:
   ```bash
   pm2 start npm --name "bills-frontend" -- start
   pm2 save
   pm2 startup
   ```

6. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Enable SSL with Let's Encrypt:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### 5. DigitalOcean App Platform

**Steps:**

1. Create a new app in DigitalOcean

2. Connect your GitHub repository

3. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`

4. Add environment variables in the app settings

5. Deploy

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Check API connectivity
- [ ] Test WebSocket connections
- [ ] Verify responsive design on mobile
- [ ] Test all CRUD operations
- [ ] Check error handling
- [ ] Monitor performance
- [ ] Set up analytics (optional)
- [ ] Configure CDN (optional)

## Performance Optimization

### 1. Enable Compression

Already configured in Next.js by default.

### 2. Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image 
  src="/path/to/image.jpg" 
  alt="Description"
  width={500}
  height={300}
/>
```

### 3. Code Splitting

Next.js automatically code-splits by route.

### 4. Caching

Configure caching headers in `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

## Monitoring

### Error Tracking

Integrate Sentry:
```bash
npm install @sentry/nextjs
```

### Analytics

Integrate Google Analytics or Vercel Analytics.

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is accessible from frontend

### WebSocket Connection Fails

- Verify `NEXT_PUBLIC_WS_URL` is correct
- Check firewall settings
- Ensure WebSocket support on hosting platform

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Store sensitive keys on the server side only
3. **HTTPS**: Always use HTTPS in production
4. **CSP Headers**: Configure Content Security Policy
5. **Rate Limiting**: Implement on backend API

## Backup and Recovery

1. Regular database backups (backend)
2. Version control for code
3. Document deployment process
4. Keep deployment logs

## Support

For issues or questions:
- Check the README.md
- Review API documentation
- Check backend logs
- Contact support team

---

Last Updated: 2024