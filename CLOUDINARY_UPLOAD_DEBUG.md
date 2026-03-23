# Cloudinary Upload Debug Guide

## Issue
File uploads succeed (show "uploaded successfully") but files return 404 on Cloudinary.

## Root Cause
**Unknown** - need to check Render logs to see what's being uploaded.

---

## Step 1: Check Render Backend Logs

**Go to**:
1. https://render.com/dashboard
2. Select service: `placement-mangement-system-w83k`
3. Click **Logs** tab
4. Scroll down to recent logs

**Look for** (in order):
```
☁️ Cloudinary Upload Config:
  - Original filename: Resume.pdf
  - Sanitized filename: Resume.pdf
  - Public ID: 30002_1774274305991_Resume.pdf
  - Folder: placement-system/resumes
  - Resource type: raw
  - MIME type: application/pdf

📄 Resume Upload Debug:
  - req.file.secure_url: https://res.cloudinary.com/...
  - Final URL to save: https://res.cloudinary.com/...
```

**Copy these logs and show me!**

---

## Step 2: Verify Cloudinary Credentials

In Render environment variables, check:

| Variable | Should Be |
|----------|-----------|
| `CLOUDINARY_CLOUD_NAME` | `dszrb7ckt` |
| `CLOUDINARY_API_KEY` | `328347998986325` |
| `CLOUDINARY_API_SECRET` | `g4lfqbQjvkLpbVZrjhXlxtbFMV8` |

**If wrong, update them!**

---

## Step 3: Manual Cloudinary Test

**In Render logs**, look for any error messages like:
- `401 Unauthorized` → Credentials wrong
- `Invalid signature` → Credentials wrong
- `Invalid folder` → Folder path wrong
- `File rejected` → File type not allowed

---

## Step 4: Check File Extension

**Expected filename format**:
```
30002_1774274305991_Resume.pdf
↑      ↑                 ↑     ↑
userId timestamp         name  .ext ← MUST have extension!
```

**If you see**: `30002_1774274305991_Resume` (no .pdf)
→ Extension stripping is still happening

---

## Possible Issues & Fixes

### Issue 1: Extension Still Being Stripped
**Evidence**: Logs show `Resume` instead of `Resume.pdf`
**Fix**: Already fixed in code
**Test**: Push latest code to Render

### Issue 2: Cloudinary Credentials Wrong
**Evidence**: Logs show `401 Unauthorized` or `Invalid signature`
**Fix**: Verify in Render environment variables
**Test**: Update credentials and redeploy

### Issue 3: Cloudinary Upload Folder Wrong
**Evidence**: Logs show upload succeeds but different folder
**Fix**: Check `folder: 'placement-system/resumes'` in uploadMiddleware.js
**Test**: Verify folder path is correct

### Issue 4: File MIME Type Issue
**Evidence**: Upload fails silently or wrong type error
**Fix**: Check file filter allows `.pdf`
**Test**: Verify `documentFilter` in uploadMiddleware.js

### Issue 5: req.file Not Populated
**Evidence**: Logs show `undefined` for secure_url
**Fix**: Multer not capturing file correctly
**Test**: Check middleware order in profileRoutes.js

---

## What to Do Now

### Step A: Deploy Latest Code
```bash
git add .
git commit -m "debug: add cloudinary upload logging"
git push origin main
```

### Step B: Upload Fresh Resume
1. Go to Vercel app
2. Profile → Resume tab
3. Upload new PDF file

### Step C: Check Render Logs
1. Go to Render dashboard
2. Click Logs
3. Look for `☁️ Cloudinary Upload Config` and `📄 Resume Upload Debug`
4. **Screenshot or copy the logs**

### Step D: Report Back
Tell me:
1. What the Render logs show
2. The actual Cloudinary URL being saved
3. Any errors in the logs

---

## Example Good Logs

```
☁️ Cloudinary Upload Config:
  - Original filename: Resume.pdf
  - Sanitized filename: Resume.pdf
  - Public ID: 30002_1774274305991_Resume.pdf
  - Folder: placement-system/resumes
  - Resource type: raw
  - MIME type: application/pdf

📄 Resume Upload Debug:
  - req.file.fieldname: resume
  - req.file.originalname: Resume.pdf
  - req.file.encoding: 7bit
  - req.file.mimetype: application/pdf
  - req.file.size: 296000
  - req.file.path: undefined
  - req.file.secure_url: https://res.cloudinary.com/dszrb7ckt/raw/upload/v1774274306/placement-system/resumes/30002_1774274305991_Resume.pdf
  - req.file.url: https://res.cloudinary.com/dszrb7ckt/raw/upload/v1774274306/placement-system/resumes/30002_1774274305991_Resume.pdf
  - Final URL to save: https://res.cloudinary.com/dszrb7ckt/raw/upload/v1774274306/placement-system/resumes/30002_1774274305991_Resume.pdf
```

**If you see this**, Cloudinary upload is working! The file exists!

---

## Example Bad Logs

```
☁️ Cloudinary Upload Config:
  - Original filename: Resume.pdf
  - Sanitized filename: Resume.pdf
  - Public ID: 30002_1774274305991_Resume.pdf
  - ...

😡 Error uploading to Cloudinary: Invalid signature (error code 401)
```

**This means**: Credentials are wrong!

---

## Next Actions

Based on your logs, I can:
1. Fix the extension stripping issue
2. Verify Cloudinary credentials
3. Fix the upload configuration
4. Add fallback mechanisms

**Please share your Render logs!**

---

**Status**: Awaiting debug logs
**Need**: Render backend logs from resume upload
