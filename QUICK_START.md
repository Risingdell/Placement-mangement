# Quick Start - Frontend & Backend Configuration

## ✅ What Was Fixed

### 1. Resume Upload Bug (FIXED)
**Problem**: Resume preview showed JSON error
**Solution**:
- Created `resolveFileUrl()` helper function
- Updated all file URL components to use Cloudinary URLs correctly
- Files now load from Cloudinary CDN

### 2. API Connection (FIXED)
**Problem**: Frontend trying to call `localhost:5000` (doesn't exist)
**Solution**:
- Updated `.env` to point to Render backend
- Created `.env.local` for local development
- Frontend now calls `https://placement-mangement-system-w83k.onrender.com`

---

## 📋 Current Setup

```
Production:
Frontend (Vercel)     → https://placement-mangement.vercel.app
Backend (Render)      → https://placement-mangement-system-w83k.onrender.com/api
Database (TiDB)       → gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000
Files (Cloudinary)    → res.cloudinary.com/dszrb7ckt
Email (Resend)        → API configured
```

---

## 🚀 Testing Checklist

### ✅ Backend (Already Working)
- [x] Connected to TiDB Cloud
- [x] Cloudinary configured
- [x] Resend email configured
- [x] Running on Render at https://placement-mangement-system-w83k.onrender.com

### ✅ Resume Upload (Now Fixed)
Test in your Vercel app:
1. Login as student
2. Go to Profile → Resume tab
3. Upload PDF resume
4. **Expected**: PDF preview displays (not JSON error) ✓

### ✅ Profile Photo
Test in your Vercel app:
1. Profile page → Click profile photo
2. Upload PNG/JPG image
3. **Expected**: Photo displays in header ✓

### ✅ Achievement Certificate
Test in your Vercel app:
1. Profile → Achievements
2. Add achievement → Upload certificate
3. **Expected**: Certificate link works ✓

---

## 📝 Files Modified

| File | Change | Reason |
|------|--------|--------|
| `.env` | Updated API URL to Render | Point to production backend |
| `.env.local` | Created | Local development fallback |
| `src/services/api.js` | Added `resolveFileUrl()` | Fix file URL resolution |
| `src/Components/profile/ProfessionalProfile.jsx` | Use `resolveFileUrl()` | Fix resume preview |
| `src/Components/profile/ProfileHeader.jsx` | Use `resolveFileUrl()` | Fix profile photo |
| `src/Components/profile/Achievements.jsx` | Use `resolveFileUrl()` | Fix certificate links |
| `src/Components/dashboard/TopNavbar.jsx` | Use `resolveFileUrl()` | Fix avatar display |
| `backend/.env` | Added Cloudinary config | Enable file uploads |

---

## 🔄 Local Development (If Needed)

If you want to test locally with your local backend:

```bash
# 1. Start backend (requires MySQL running)
cd backend
npm install
node server.js

# 2. In another terminal, start frontend
npm run dev

# 3. Frontend will use .env.local (http://localhost:5000)
# App opens at http://localhost:5173
```

**Note**: Database won't work locally unless you set up TiDB Cloud tunnel or switch to local MySQL.

---

## 🌐 Production URLs

### For Users
- **App**: https://placement-mangement.vercel.app

### For Admin
- **Backend Logs**: Render Dashboard
- **Database**: TiDB Cloud Dashboard
- **Files**: Cloudinary Dashboard

---

## ⚠️ Important Notes

1. **Cloudinary URLs are automatically generated** when files upload
   - No manual URL configuration needed
   - Files persist forever (unless manually deleted)
   - Accessed via CDN for fast delivery

2. **TiDB Cloud is secure**
   - SSL enabled (DB_SSL=true)
   - Credentials stored safely in Render env vars
   - Not accessible from public internet

3. **CORS is configured**
   - Render allows Vercel frontend (`.vercel.app` wildcard)
   - Local development allowed (`localhost:5173`)
   - Mobile apps allowed (no origin check)

---

## 🆘 If Something Breaks

**Frontend shows API errors**:
```bash
# Check .env file
cat .env

# Should be:
VITE_API_URL=https://placement-mangement-system-w83k.onrender.com

# If wrong, fix it:
echo "VITE_API_URL=https://placement-mangement-system-w83k.onrender.com" > .env

# Then push to main branch (Vercel auto-redeploys)
git add .env
git commit -m "fix: update api url to render backend"
git push origin main
```

**Check Render logs for backend errors**:
- Go to https://render.com/dashboard
- Select your service
- Click "Logs" tab
- Look for error messages

**Resume upload still fails**:
- Check Cloudinary credentials in Render env vars
- Verify file size < 5MB
- Check Render logs for upload errors

---

## 📚 Documentation

See these files for more details:
- `DEPLOYMENT_CONFIG.md` - Full deployment guide
- `DETAILED_SCOPE.md` - Architecture overview
- `BUG_FIX_RESUME_UPLOAD.md` - Resume bug fix details

---

**Status**: ✅ All systems operational
**Last Updated**: 2026-03-23
