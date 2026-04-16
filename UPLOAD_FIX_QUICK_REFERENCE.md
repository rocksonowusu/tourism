# Quick Fix Summary: Image Upload "Signal Aborted" Issue

## What Was Wrong
- Uploads timing out after 30 seconds → "Signal has been aborted" error
- Cloudinary uploads + image compression taking longer than timeout allowed

## What Was Fixed

### Frontend Changes
1. **`.env.production`** - Increased `VITE_API_TIMEOUT` from 30s → 120s
2. **`.env.development`** - Increased `VITE_API_TIMEOUT` from 30s → 120s  
3. **`src/api/client.js`** - Added upload-specific timeout (180s / 3 min) for `/upload/` endpoints

### Backend Changes
1. **`tourism_events/models.py`**
   - Added smart compression: skip small files (< 2MB)
   - Added timing logs to track where time is spent
   
2. **`tourism_events/views.py`**
   - Added logger import
   - Added diagnostic logs to Tour and Event upload views
   - Tracks: upload start/end time, per-file time, total time

## How to Deploy

```bash
# No database migrations needed - only code/config changes

# Option 1: Local testing
npm run dev          # Frontend picks up new .env.development
python manage.py runserver  # Backend with new logging

# Option 2: Push to production (Render)
git add .
git commit -m "Fix: Increase upload timeout to prevent 'signal aborted' errors"
git push
# Render auto-deploys frontend from Vercel
# Render auto-deploys backend - will rebuild with new settings
```

## Verification

### Before Deploying
Run locally and test upload:
```bash
# Frontend: http://localhost:3000/admin/tours
# Backend: http://localhost:8000
# Try uploading a 3-5 MB image
```

### After Deploying
Check Render logs:
```
Search for: "upload started" or "upload completed"
Look for: timing information showing upload took 20-45 seconds
```

## Upload Endpoints Fixed
- ✅ Tours (`/api/tours/{id}/upload/`)
- ✅ Events (`/api/events/{id}/upload/`)
- ✅ Sites (`/api/sites/{id}/upload/`)
- ✅ Apartments (`/api/apartments/{id}/upload/`)
- ✅ Vehicles (`/api/vehicles/{id}/upload/`)
- ✅ Community Projects (`/api/community-projects/{id}/upload/`)

## New Timeout Values
- **Normal API calls**: 120 seconds (2 minutes)
- **Upload endpoints**: 180 seconds (3 minutes)
- **Image compression**: Skipped for files < 2 MB

## If Issues Still Occur
Check Render logs for timing:
1. If `Processing file` takes > 30s → Cloudinary is slow
2. If `Media save` takes > 60s → Database/Cloudinary issue
3. If frontend still shows abort → May need even longer timeout

Then update:
- `VITE_API_TIMEOUT=180000` (3 min)
- `UPLOAD_TIMEOUT = Math.max(TIMEOUT * 4, 240_000)` (4 min)
