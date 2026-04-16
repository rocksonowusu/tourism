# Tours Media Upload Fix

## Problem
When uploading images for tours in the admin edit form, the tour details would save successfully but **the media files were not being uploaded** to the server.

## Root Cause
The `closeModal()` function was being called **immediately after the tour details were saved**, but **before** the media upload was finished. This meant:
1. Modal closes while upload is still in progress
2. Media state gets reset when modal closes
3. Upload request might get cancelled or lose context
4. Images appear to not be saved

## The Fix

### 1. **Sequential Execution** (Lines 314-348)
Changed from parallel execution to sequential:
- **Before**: Save tour details, then immediately close modal while upload happens in background
- **After**: Save tour details → Upload media files (one by one) → THEN close modal

```javascript
// Now awaits the upload before closing
await api.tours.upload(tourId, fd)  // Waits for completion
setMediaUploading(false)
closeModal()  // Only closes AFTER upload is done
```

### 2. **Added Progress Tracking** (Lines 147-149)
Added state for real-time upload feedback:
- `uploadProgress`: Percentage (0-100%)
- `uploadMessage`: Status text ("Uploaded X of Y files...")

### 3. **Sequential File Upload** (Lines 314-348)
Instead of uploading all files in one request:
```javascript
// BEFORE: All files at once
const fd = new FormData()
mediaFiles.forEach(f => fd.append('file', f))
await api.tours.upload(tourId, fd)

// AFTER: One file at a time with progress
for (let i = 0; i < mediaFiles.length; i++) {
  const fd = new FormData()
  fd.append('file', file)
  await api.tours.upload(tourId, fd)
  // Update progress...
}
```

**Benefits:**
- Better error handling (if one file fails, others still upload)
- Real-time progress feedback
- More reliable upload process

### 4. **UI Improvements**
- Progress bar shows during upload
- Upload button disabled during upload
- File input disabled during upload  
- Delete buttons disabled during upload
- Clear success/failure messages
- Shows "X of Y files uploaded"

### 5. **CSS Styling** (Tours.module.css)
Added progress card styling:
- Animated progress bar with gold gradient
- Glowing shadow effect
- Real-time percentage display
- Status message

## Files Modified
1. `/src/admin/pages/Tours.jsx`
   - Added `uploadProgress` and `uploadMessage` state
   - Updated `handleSave()` to sequential upload with progress
   - Added progress UI to media step
   - Disabled inputs during upload

2. `/src/admin/pages/Tours.module.css`
   - Added `.uploadProgressCard` styles
   - Added `.progressBar`, `.progressFill` styles
   - Added `.uploadStatus` and `.uploadPercent` styles

## Testing
✅ Upload single file - should complete before modal closes  
✅ Upload multiple files - should show progress for each  
✅ Test with network delay - should maintain proper state  
✅ Check that images appear in database after upload  
✅ Verify delete button disabled during upload  
✅ Check progress bar animation  

## Result
Tours media uploads now **reliably save** to the database because:
1. Modal stays open until upload completes
2. Upload happens sequentially with proper error handling
3. Users see real-time progress feedback
4. Modal only closes after successful upload
