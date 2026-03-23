# Resume Preview Debugging Guide

## Symptoms
- Resume shows "uploaded successfully" ✓
- But preview area is **blank** ❌
- Something is being downloaded

---

## Step 1: Check Console Logs

**In your browser**:
1. Open Vercel app: https://placement-mangement.vercel.app
2. Login as student
3. Go to Profile → Resume tab
4. **Open DevTools** (Press F12)
5. Go to **Console** tab
6. Look for logs starting with `📄 Resume`

**Expected logs**:
```
📄 Resume - Resolved URL: https://res.cloudinary.com/dszrb7ckt/raw/upload/v1234567/30002_1774272103061_Resume
📄 Resume - Original Cloudinary URL: https://res.cloudinary.com/dszrb7ckt/raw/upload/v1234567/30002_1774272103061_Resume
📄 Resume - Transformed URL: https://res.cloudinary.com/dszrb7ckt/raw/upload/fl_attachment:false/v1234567/30002_1774272103061_Resume
```

**If you see different logs, tell me what they say!**

---

## Step 2: Check Network Requests

**In DevTools**:
1. Click **Network** tab
2. Upload a fresh resume
3. Look for requests to `cloudinary.com`
4. Click on the request
5. Check:
   - **URL** - Should show the transformation
   - **Status** - Should be `200`
   - **Response** - Should show PDF data or empty (that's ok)

---

## Step 3: Check iframe src Attribute

**In DevTools**:
1. Go to **Elements** tab (Inspector)
2. Find the `<iframe>` tag
3. Right-click → **Inspect**
4. Check the `src` attribute
5. **Copy the URL** and share it

**Example of what to look for**:
```html
<iframe
  title="Resume Preview"
  src="https://res.cloudinary.com/dszrb7ckt/raw/upload/fl_attachment:false/v1234567/30002_Resume"
  class="w-full h-[520px] bg-white"
></iframe>
```

---

## Common Issues & Fixes

### Issue 1: URL shows `/upload//` (double slash)
**Problem**: Transformation inserted incorrectly
**Fix**: Already fixed in code - uses simpler regex

### Issue 2: URL missing `fl_attachment:false`
**Problem**: Transformation not applied
**Fix**: Check console logs to see why

### Issue 3: iframe is blank but no errors
**Problem**: Could be:
- CORS issue
- Cloudinary URL malformed
- Browser can't display PDF

**Debug**: Try opening URL directly in browser:
1. Copy the URL from iframe src
2. Open new tab
3. Paste URL
4. See what happens:
   - ✓ PDF displays → Iframe should work
   - ✓ PDF downloads → Check `fl_attachment:false` applied
   - ✗ 404 error → URL is wrong
   - ✗ CORS error → Cloudinary issue

---

## Manual URL Test

**Test the transformation manually**:

1. **Original URL** (without transformation):
```
https://res.cloudinary.com/dszrb7ckt/raw/upload/v1234567/30002_Resume
```

2. **With transformation**:
```
https://res.cloudinary.com/dszrb7ckt/raw/upload/fl_attachment:false/v1234567/30002_Resume
```

3. **Open both in browser**:
   - Original → Should download
   - With transformation → Should preview

---

## If Preview Still Blank

The iframe might just be loading a blank white page. This could be because:

1. **Browser PDF viewer disabled** - Some browsers disable embedded PDF viewing
2. **CORS issue** - Unlikely with Cloudinary CDN
3. **File too large** - Try with a small PDF

### Fallback: Use Open Resume Link

If iframe doesn't work, the fallback link should work:
- Click "Open Resume" link
- Should open PDF in new tab
- At minimum, this verifies the URL works

---

## What to Do

### Option 1: Let me see the URLs
1. Open browser DevTools (F12)
2. Go to Console
3. Upload resume
4. Copy all logs with `📄 Resume`
5. Tell me the URLs shown

### Option 2: Check the Network Request
1. Open DevTools (F12)
2. Click Network tab
3. Upload resume
4. Look for `cloudinary` request
5. Check Response and Status

### Option 3: Test URL Directly
1. In Console, type:
```javascript
console.log(document.querySelector('iframe').src)
```
2. Copy the URL
3. Paste in new tab
4. Tell me what happens (displays? downloads? error?)

---

## Code Changes Made

### api.js
- Simplified Cloudinary transformation regex
- Added console logs to trace transformation
- Check for existing transformation

### ProfessionalProfile.jsx
- Added debug logging for URLs
- Logs show: Original → Transformed → Expected

---

## Next Steps

1. **Refresh Vercel app** (Ctrl+Shift+R for hard refresh)
2. **Upload a fresh resume** (or re-save current one)
3. **Check browser console** for logs
4. **Tell me what you see**

Based on your logs, I can pinpoint the exact issue and fix it!

---

**Status**: Debugging in progress
**Need**: Console logs showing URLs
