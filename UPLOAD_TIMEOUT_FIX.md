# Image Upload Timeout Fix

## Problem
When attempting to upload images across the admin portal (tours, events, sites, apartments, etc.), the upload would hang and eventually fail with the error:
```
Error: Signal has been aborted
```

This is the browser's AbortController aborting the request after the timeout expires.

## Root Cause
The 30-second timeout (`VITE_API_TIMEOUT=30000`) was too short for:
1. **Cloudinary uploads** - uploading to Cloudinary can take 15-45+ seconds depending on:
   - File size (can be 3-5 MB after compression)
   - Network latency to Cloudinary's servers
   - Cloudinary's processing queue
2. **Image compression** - PIL image compression on large files can take several seconds
3. **Serializer save operations** - CloudinaryField saves are blocking operations

## Solution Implemented

### 1. **Increased Global Timeout** (Frontend)
- **File**: `frontend/.env.production` and `frontend/.env.development`
- **Change**: `VITE_API_TIMEOUT=30000` → `VITE_API_TIMEOUT=120000` (120 seconds)
- **Reason**: Gives upload requests sufficient time to complete on slower networks

### 2. **Added Upload-Specific Timeout** (Frontend API Client)
- **File**: `frontend/src/api/client.js`
- **Changes**:
  ```javascript
  const UPLOAD_TIMEOUT = Math.max(TIMEOUT * 3, 180_000)  // 3x normal, min 3 min
  ```
  - Detect upload endpoints (`/upload/` in URL)
  - Use `UPLOAD_TIMEOUT` (3 minutes) for upload requests
  - Use normal `TIMEOUT` for all other requests
- **Benefit**: Upload requests get 3x longer to complete

### 3. **Optimized Image Compression** (Backend)
- **File**: `backend/tourism_events/models.py`
- **Changes in `BaseMedia.save()` method**:
  - Skip compression for small images (< 2MB) - they're likely already optimized
  - Only compress larger images that genuinely need it
  - Added timing logs to track compression duration
  - Added upload duration logs
- **Benefit**: Reduces blocking time, allows responses to return faster

### 4. **Added Diagnostic Logging** (Backend)
- **File**: `backend/tourism_events/views.py`
- **Changes**:
  - Added timing logs to `TourViewSet.upload_media()` and `EventViewSet.upload_media()`
  - Logs track:
    - Upload start/end times
    - Individual file processing time
    - Total upload duration
  - Import: `import logging` and create `logger = logging.getLogger('tourism_events.uploads')`
- **Benefit**: When issues occur, you can check `LOGGING` output (Render console) to see exactly where delays happen

## Configuration Details

### Timeout Values
- **Global timeout**: 120 seconds (2 minutes)
- **Upload-specific timeout**: 180 seconds (3 minutes) or 3× global timeout, whichever is longer
- **Image compression threshold**: 2 MB (only compress if larger)

### Logging Configuration
The backend already logs to console via `settings.py` LOGGING config:
```python
'root': {
    'handlers': ['console'],
    'level': 'INFO',
},
```

To see upload timing logs:
1. Check Render's console/logs
2. Search for: `"upload started"`, `"Processing file"`, `"upload completed"`

## Testing Checklist

- [ ] Upload single image to Tours
- [ ] Upload multiple images (3-5) to Events
- [ ] Upload to Sites (max 5 files)
- [ ] Upload to Apartments (max 10 files)
- [ ] Upload to Community Projects (max 10 files)
- [ ] Upload to Vehicles (max 10 files)
- [ ] Check Render logs for timing information
- [ ] Verify no "Signal aborted" errors appear

## Performance Expected

Before fix:
- Upload timeout after ~30 seconds
- Error: "Signal has been aborted"

After fix:
- Uploads up to 3-5 MB complete successfully
- Takes 20-45 seconds depending on file size and network
- Progress updates shown in UI
- Success/failure messages appear

## Render Deployment

After deploying to Render:
1. Rebuild the backend container (to pick up new env timeout values)
2. Frontend will auto-pick up new `.env.production` values
3. Monitor the Render logs during upload to verify timing logs appear

## Future Optimizations (Optional)

1. **Async Image Compression**: Move PIL compression to a background task (Celery)
2. **Frontend Compression**: Compress images on browser before sending to server
3. **Chunked Uploads**: For very large files, implement multipart/chunked upload
4. **CDN Upload**: Upload directly to Cloudinary from frontend, bypassing backend
