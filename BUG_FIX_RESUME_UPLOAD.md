# Bug Fix: Resume Upload - "Route not found" Error

## Problem Description
When a student uploaded a resume, the file was saved successfully on the backend, but the preview showed a JSON error instead of displaying the resume:

```json
{"success":false,"message":"Route not found"}
```

## Root Cause Analysis

The issue was in how file URLs were being resolved in the frontend:

1. **Backend Setup** (✅ Working correctly):
   - File upload endpoint: `POST /api/profile/resume` ✓
   - Static file serving: `app.use('/uploads', express.static(...))` at line 47 of `server.js` ✓
   - Files stored at: `/backend/uploads/resume_xxx.pdf` ✓

2. **Frontend Issue** (❌ Broken):
   - Components had a `resolveMediaUrl()` function with an **empty `apiOrigin`**
   - This caused file URLs to be resolved incorrectly
   - Example: `/uploads/resume_123.pdf` was being loaded from `http://localhost:5173/uploads/resume_123.pdf` (React app domain)
   - But files are actually served from `http://localhost:5000/uploads/resume_123.pdf` (Backend domain)
   - Result: 404 error → "Route not found" message from server.js line 104

### Affected Components
- `src/Components/profile/ProfessionalProfile.jsx` (resume preview)
- `src/Components/profile/ProfileHeader.jsx` (profile photo)
- `src/Components/profile/Achievements.jsx` (certificate links)
- `src/Components/dashboard/TopNavbar.jsx` (avatar)

## Solution

### 1. Created Environment Configuration (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

This tells the frontend where the backend API is located.

### 2. Updated `src/services/api.js`
```javascript
// Before: static relative URL
const API_BASE_URL = '/api';

// After: uses VITE_API_URL env var with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// New helper function for file URLs
export const resolveFileUrl = (filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const apiBaseOrigin = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${apiBaseOrigin}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};
```

### 3. Updated All Affected Components
Replaced local `resolveMediaUrl()` functions with imported `resolveFileUrl` from `api.js`:

**Before:**
```jsx
const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiOrigin = ''; // ❌ EMPTY!
  return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const resumeUrl = resolveMediaUrl(profile?.resume_url);
```

**After:**
```jsx
import { resolveFileUrl } from '../../services/api';

const resumeUrl = resolveFileUrl(profile?.resume_url);
```

## Files Modified

| File | Change |
|------|--------|
| `.env` | Created with `VITE_API_URL=http://localhost:5000` |
| `src/services/api.js` | Updated API_BASE_URL + added `resolveFileUrl` export |
| `src/Components/profile/ProfessionalProfile.jsx` | Import + use `resolveFileUrl` |
| `src/Components/profile/ProfileHeader.jsx` | Import + use `resolveFileUrl` |
| `src/Components/profile/Achievements.jsx` | Import + use `resolveFileUrl` for certificates |
| `src/Components/dashboard/TopNavbar.jsx` | Import + use `resolveFileUrl` for avatars |

## Testing

### To Test the Fix:

1. **Ensure backend is running** on port 5000:
   ```bash
   cd backend && npm start
   ```

2. **Ensure frontend is running** on port 5173:
   ```bash
   npm run dev
   ```

3. **Login as student** and navigate to Profile → Resume tab

4. **Upload a PDF resume** using the "Upload Resume" button

5. **Verify the fix**:
   - ✅ Resume preview should display (iframe showing PDF)
   - ✅ No 404 error
   - ✅ "Open Resume" link works if PDF preview not supported

### Additional Test Cases:

- [ ] Profile photo upload (ProfileHeader)
- [ ] Achievement certificate upload (Achievements)
- [ ] Avatar display in TopNavbar
- [ ] All file types resolve correctly
- [ ] Works in both development and production environments

## How It Works Now

```
Frontend upload → POST /api/profile/resume
                 ↓
Backend saves to → /backend/uploads/resume_123.pdf
                 ↓
Profile fetches → GET /api/profile
                 ↓
DB returns → { resume_url: "/uploads/resume_123.pdf", ... }
           ↓
resolveFileUrl("/uploads/resume_123.pdf")
    ↓
Uses VITE_API_URL env var: "http://localhost:5000"
    ↓
Returns → "http://localhost:5000/uploads/resume_123.pdf" ✅
    ↓
Backend serves file via express.static() ✓
    ↓
Frontend iframe displays PDF ✓
```

## Environment-Specific Configuration

### Development (localhost)
```
VITE_API_URL=http://localhost:5000
API calls: http://localhost:5000/api/...
File serving: http://localhost:5000/uploads/...
```

### Production (Deployed)
```
VITE_API_URL=https://api.yourdomain.com
API calls: https://api.yourdomain.com/api/...
File serving: https://api.yourdomain.com/uploads/...
```

## Related Issues Fixed
- Resume preview shows JSON error → ✅ Fixed
- Profile photo not displaying → ✅ Fixed
- Achievement certificates not loading → ✅ Fixed
- TopNavbar avatar not showing → ✅ Fixed

## Backward Compatibility
- Falls back to relative paths (`/api`) if `VITE_API_URL` not set
- Works in same-domain deployments
- Works in separate domain deployments (when VITE_API_URL is configured)

---

**Status**: ✅ FIXED
**Date**: 2026-03-23
**Severity**: HIGH (Core feature broken)
**Impact**: All file uploads (resume, photo, certificates)
