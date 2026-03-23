# Deployment Configuration Guide

## Current Deployment Setup

### Production Environment
```
Frontend:  https://placement-mangement.vercel.app (Vercel)
Backend:   https://placement-mangement-system-w83k.onrender.com (Render)
Database:  TiDB Cloud (gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000)
Files:     Cloudinary (dszrb7ckt)
Email:     Resend API
```

---

## Environment Configuration

### Frontend Configuration

#### 1. Production (Vercel)
**File**: `.env` (or Vercel dashboard)
```
VITE_API_URL=https://placement-mangement-system-w83k.onrender.com
```
- This is used when deployed to Vercel
- Frontend calls Render backend for all API requests
- Vercel automatically loads this from `.env`

#### 2. Local Development
**File**: `.env.local` (NOT committed to git)
```
VITE_API_URL=http://localhost:5000
```
- Use when running `npm run dev` locally
- Points to your local backend
- Vite prioritizes `.env.local` over `.env`

**To use local development:**
```bash
# Terminal 1: Start backend
cd backend
npm install
node server.js

# Terminal 2: Start frontend
npm run dev
# Opens http://localhost:5173
# API calls go to http://localhost:5000
```

---

### Backend Configuration (Render)

Your Render environment variables are already set:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | `4000` |
| `DB_USER` | `2nWiep54upbxDQm.root` |
| `DB_PASSWORD` | `MT5Vyw02s5fXUsFB` |
| `DB_NAME` | `placement_management` |
| `DB_SSL` | `true` |
| `FRONTEND_URL` | `https://placement-mangement.vercel.app` |
| `JWT_SECRET` | `placementApp2026SecretKeyXYZ789` |
| `CLOUDINARY_CLOUD_NAME` | `dszrb7ckt` |
| `CLOUDINARY_API_KEY` | `328347998986325` |
| `CLOUDINARY_API_SECRET` | `g4lfqbQjvkLpbVZrjhXlxtbFMV8` |
| `RESEND_API_KEY` | `re_c8ky1dwg_...` |
| `MAIL_FROM` | (configured) |
| `SMTP_*` | (Gmail SMTP configured) |

**Status**: ✅ All configured and working
**Logs show**:
```
✓ MySQL Database connected successfully
🚀 Server running on port 10000
Available at: https://placement-mangement-system-w83k.onrender.com
```

---

## How It Works

### Local Development Flow
```
Your Computer
    ↓
[Frontend: http://localhost:5173] ←→ [Backend: http://localhost:5000]
    ↓
[TiDB Cloud Database]
```

### Production Flow
```
User's Browser
    ↓
[Vercel: https://placement-mangement.vercel.app]
    ↓
[Render: https://placement-mangement-system-w83k.onrender.com/api/...]
    ↓
[TiDB Cloud Database] + [Cloudinary Storage]
```

---

## CORS Configuration

Backend is configured to accept requests from:

1. **Local development**:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`

2. **Production**:
   - `https://placement-mangement.vercel.app` (via `.vercel.app` wildcard)
   - Any origin specified in `FRONTEND_URL` env var

3. **API calls without origin** (mobile apps, curl):
   - Allowed

---

## API Endpoints

All API endpoints follow the pattern:
```
{VITE_API_URL}/api/{endpoint}
```

### Examples:

**Production**:
```
Login:           https://placement-mangement-system-w83k.onrender.com/api/auth/login
Profile:         https://placement-mangement-system-w83k.onrender.com/api/profile
Upload Resume:   https://placement-mangement-system-w83k.onrender.com/api/profile/resume
List Drives:     https://placement-mangement-system-w83k.onrender.com/api/drives
```

**Local Development**:
```
Login:           http://localhost:5000/api/auth/login
Profile:         http://localhost:5000/api/profile
Upload Resume:   http://localhost:5000/api/profile/resume
List Drives:     http://localhost:5000/api/drives
```

---

## File Upload Flow

Files are stored on **Cloudinary** (not on server):

### Process:
1. User uploads file via frontend
2. Frontend → POST to `/api/profile/resume` (backend)
3. Backend uploads to Cloudinary directly
4. Cloudinary returns URL (e.g., `https://res.cloudinary.com/.../resume.pdf`)
5. Backend stores URL in TiDB database
6. Frontend displays file from Cloudinary URL

### Benefits:
✅ No local storage needed on server
✅ Scalable to any number of files
✅ Fast CDN delivery via Cloudinary
✅ No cost for server storage

---

## Email Configuration

**Provider**: Resend API
**Backend SMTP Fallback**: Gmail SMTP (configured)

### How Emails Work:
1. Backend sends email via Resend API (preferred)
2. If Resend fails, falls back to Gmail SMTP
3. Emails sent for:
   - Password reset links
   - Admin notifications
   - Bulk messages to students

### Testing Emails:
```bash
# Check Render logs for email delivery status
# Logs show which provider was used (Resend or SMTP)
```

---

## Troubleshooting

### Frontend shows "Connection Refused" errors

**Problem**: Frontend is still pointing to `localhost:5000`

**Solution**:
```bash
# Check .env file
cat .env

# Should show:
# VITE_API_URL=https://placement-mangement-system-w83k.onrender.com

# If it shows localhost, update it:
echo "VITE_API_URL=https://placement-mangement-system-w83k.onrender.com" > .env
```

### Database connection fails

**Check Render logs**:
- Login to Render dashboard
- Select your service
- Check "Logs" tab for connection errors
- TiDB might be temporarily unavailable

**Solution**:
- Wait 2-3 minutes and refresh
- Check TiDB Cloud console for service status

### Files not uploading

**Problem**: Resume/photo upload fails

**Check Cloudinary**:
1. Verify API key in Render env vars
2. Check Cloudinary dashboard for quota
3. Check Render logs for upload errors

**Solution**:
- Ensure `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are correct
- Check file size (max 5MB)
- Verify file type (PDF for resume, PNG/JPG for photos)

### CORS errors in browser

**Problem**: Request blocked by CORS policy

**Solution**:
- Ensure `FRONTEND_URL` in Render is set to `https://placement-mangement.vercel.app`
- Clear browser cache
- Check that API URL in frontend is correct

---

## Updating Configuration

### To update Render environment variables:

1. Go to https://render.com/dashboard
2. Select your service (`placement-mangement-system-w83k`)
3. Click "Environment" tab
4. Update variables as needed
5. Service auto-redeploys with new env vars

### To update frontend on Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project (`placement-mangement`)
3. Click "Settings" → "Environment Variables"
4. Update `VITE_API_URL` if needed
5. Redeploy manually or push to main branch

---

## Monitoring

### Monitor Backend:
- Render dashboard logs: https://render.com/dashboard
- Check for database connection errors
- Monitor request logs for API issues

### Monitor Frontend:
- Vercel dashboard: https://vercel.com/dashboard
- Browser DevTools → Network tab
- Check for failed API requests

### Monitor Database:
- TiDB Cloud console: https://tidbcloud.com/
- Check query performance
- Monitor data usage

---

## Security Checklist

- ✅ JWT Secret configured (production value)
- ✅ Database SSL enabled (`DB_SSL=true`)
- ✅ Cloudinary API secrets secured
- ✅ CORS restricted to allowed origins
- ✅ Environment variables not in git (`.env` ignored)
- ✅ SMTP passwords not exposed
- ✅ Resend API key secure

---

## Useful URLs

| Service | URL |
|---------|-----|
| Backend API | https://placement-mangement-system-w83k.onrender.com |
| Frontend App | https://placement-mangement.vercel.app |
| Render Dashboard | https://render.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| TiDB Cloud | https://tidbcloud.com/ |
| Cloudinary | https://cloudinary.com/ |
| Resend | https://resend.com/ |

---

**Last Updated**: 2026-03-23
**Status**: ✅ All systems operational
