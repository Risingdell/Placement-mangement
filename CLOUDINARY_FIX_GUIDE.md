# Cloudinary Upload Not Working - Complete Fix Guide

## The Problem
- Resume uploads say "successful" ✓
- But file doesn't exist on Cloudinary (404 error) ❌
- URL format is correct but file never uploaded

## Root Cause
**Upload is failing silently** - likely Cloudinary credentials or configuration issue on Render

---

## Diagnosis: Run Cloudinary Test

### On Render (via Console)

1. **Go to Render Dashboard**:
   - https://render.com/dashboard
   - Select `placement-mangement-system-w83k`
   - Click **Shell** tab

2. **Run test**:
```bash
cd /app/backend && node test-cloudinary.js
```

3. **Look for output**:

**✅ If you see**:
```
1️⃣ Checking Environment Variables:
   CLOUDINARY_CLOUD_NAME: ✅ SET
   CLOUDINARY_API_KEY: ✅ SET
   CLOUDINARY_API_SECRET: ✅ SET

2️⃣ Testing Cloudinary API Connection...
   ✅ Cloudinary API is working!
   Status: ok

3️⃣ Testing List Resources...
   ✅ Successfully listed resources!
   Total resources found: X
```
→ **Cloudinary is working!** Problem is elsewhere.

**❌ If you see**:
```
2️⃣ Testing Cloudinary API Connection...
   ❌ Cloudinary API Error:
   Error: Invalid signature
   Status: 401
```
→ **Credentials are wrong!** Fix them.

**❌ If you see**:
```
1️⃣ Checking Environment Variables:
   CLOUDINARY_CLOUD_NAME: ❌ MISSING
   CLOUDINARY_API_KEY: ❌ MISSING
   CLOUDINARY_API_SECRET: ❌ MISSING
```
→ **Environment variables not set on Render!** Add them.

---

## Fix #1: Verify Cloudinary Credentials on Render

1. **Go to Render Dashboard**
2. Select service `placement-mangement-system-w83k`
3. Click **Environment** tab
4. **Verify these are set** (exactly):

| Variable | Value |
|----------|-------|
| `CLOUDINARY_CLOUD_NAME` | `dszrb7ckt` |
| `CLOUDINARY_API_KEY` | `328347998986325` |
| `CLOUDINARY_API_SECRET` | `g4lfqbQjvkLpbVZrjhXlxtbFMV8` |

**If missing or wrong**:
- Click **Add Environment Variable**
- Add each one
- **Deploy** (click "Deploy" button or `git push`)

---

## Fix #2: Check Backend Configuration

### In `backend/.env` (for local testing):
```env
CLOUDINARY_CLOUD_NAME=dszrb7ckt
CLOUDINARY_API_KEY=328347998986325
CLOUDINARY_API_SECRET=g4lfqbQjvkLpbVZrjhXlxtbFMV8
```

### In `uploadMiddleware.js`, ensure:
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```
✅ This is correct

---

## Fix #3: Restart Backend

After adding/updating environment variables:

1. **Option A: On Render**
   - Go to Service
   - Click **Manual Deploy** or **Redeploy**
   - Wait for deployment to complete

2. **Option B: Via Git**
```bash
git add .
git commit -m "fix: verify cloudinary credentials"
git push origin main
# Render auto-deploys when you push
```

---

## Fix #4: Test Upload Again

1. **Go to Vercel app**: https://placement-mangement.vercel.app
2. **Login** as student
3. **Upload resume**: Profile → Resume tab → Upload
4. **Check if it appears** in preview
5. **Open DevTools** (F12) → Network tab
6. **Look for Cloudinary request**:
   - Should see POST to `upload.cloudinary.com`
   - Status should be `200`

---

## Fix #5: Check Render Logs for Errors

If still not working:

1. **Go to Render Dashboard**
2. **Select service**
3. **Click Logs** tab
4. **Look for errors** like:
   - `Invalid signature` → Credentials wrong
   - `401 Unauthorized` → API key wrong
   - `Network error` → Connection issue
   - `ENOENT` → File not found locally

**Share any errors you see!**

---

## Common Errors & Solutions

### Error: "Invalid signature"
**Cause**: API credentials wrong
**Fix**: Double-check credentials in Render environment variables
**Verify**: Run `node test-cloudinary.js` on Render

### Error: "401 Unauthorized"
**Cause**: API key or secret wrong
**Fix**: Update in Render environment → Redeploy
**Verify**: `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`

### Error: "Resource not found"
**Cause**: Cloud name wrong
**Fix**: Verify `CLOUDINARY_CLOUD_NAME=dszrb7ckt`
**Verify**: Run test-cloudinary.js

### No error but file not uploaded
**Cause**: File rejected by filter or multer issue
**Fix**: Check Render logs for detailed error
**Verify**: File is .pdf and under 5MB

---

## Complete Checklist

- [ ] Run `node test-cloudinary.js` on Render
- [ ] Verify all 3 Cloudinary env vars on Render
- [ ] Redeploy or push to trigger deployment
- [ ] Upload fresh resume
- [ ] Check Render logs for errors
- [ ] Test direct Cloudinary URL in browser

---

## If All Else Fails

**Option 1: Reset Cloudinary**
1. Go to https://cloudinary.com/
2. Login to your account
3. Check if cloud name is `dszrb7ckt`
4. Regenerate API keys if needed
5. Update on Render

**Option 2: Use Alternative Storage**
- Switch to local file storage
- Or use different cloud storage service

**Option 3: Direct Upload to Cloudinary**
- Upload file manually to Cloudinary
- Copy URL
- Manually update database

---

## Next Steps

1. **Run the test**: `node test-cloudinary.js` on Render shell
2. **Tell me the output** (what did you see?)
3. **Check credentials** match exactly
4. **Redeploy** if you made changes
5. **Try uploading** again

**Once I see the test output, I can pinpoint the exact issue!**

---

**Status**: Diagnosing upload failure
**Need**: Output from `test-cloudinary.js` test
