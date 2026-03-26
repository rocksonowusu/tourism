import os
from django.core.exceptions import ValidationError


# ---------------------------------------------------------------------------
# Allowed MIME types
# ---------------------------------------------------------------------------

ALLOWED_IMAGE_TYPES = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
}

ALLOWED_VIDEO_TYPES = {
    'video/mp4',
    'video/quicktime',   # .mov
    'video/x-msvideo',  # .avi
    'video/mpeg',
    'video/webm',
    'video/ogg',
    'video/3gpp',
    'video/x-matroska',  # .mkv
}

ALLOWED_MEDIA_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES

# Allowed file extensions as a secondary check
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.mpeg', '.mpg', '.webm', '.ogg', '.3gp', '.mkv'}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

# ---------------------------------------------------------------------------
# Size limit
# ---------------------------------------------------------------------------

MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024  # 50 MB


# ---------------------------------------------------------------------------
# Validators
# ---------------------------------------------------------------------------

def validate_media_file_type(file):
    """
    Reject files that are not images or videos.
    Checks both MIME content-type and file extension as a safety net.
    """
    # --- MIME type check (works when file is an InMemoryUploadedFile) ---
    content_type = getattr(file, 'content_type', None)
    if content_type and content_type not in ALLOWED_MEDIA_TYPES:
        raise ValidationError(
            f'Unsupported file type "{content_type}". '
            f'Allowed: images (JPEG, PNG, WEBP, GIF, BMP, TIFF) and '
            f'videos (MP4, MOV, AVI, MPEG, WEBM, OGG, 3GP, MKV).'
        )

    # --- Extension check ---
    name = getattr(file, 'name', '') or ''
    ext = os.path.splitext(name)[1].lower()
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f'Unsupported file extension "{ext}". '
            f'Allowed extensions: {", ".join(sorted(ALLOWED_EXTENSIONS))}.'
        )

    # If neither check could run (e.g. Cloudinary URL string), skip silently
    if not content_type and not ext:
        return


def validate_media_file_size(file):
    """
    Reject files larger than MAX_FILE_SIZE_MB.
    """
    size = getattr(file, 'size', None)
    if size is not None and size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f'File size {size / (1024 * 1024):.1f} MB exceeds the '
            f'{MAX_FILE_SIZE_MB} MB limit.'
        )


# ---------------------------------------------------------------------------
# Helper: auto-detect media type from file
# ---------------------------------------------------------------------------

def detect_media_type(file) -> str:
    """
    Return 'image' or 'video' based on the uploaded file's MIME type or
    extension. Falls back to 'image' if detection is not possible.
    """
    content_type = getattr(file, 'content_type', None)
    if content_type:
        if content_type in ALLOWED_VIDEO_TYPES:
            return 'video'
        if content_type in ALLOWED_IMAGE_TYPES:
            return 'image'

    name = getattr(file, 'name', '') or ''
    ext = os.path.splitext(name)[1].lower()
    if ext in ALLOWED_VIDEO_EXTENSIONS:
        return 'video'
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return 'image'

    return 'image'  # safe fallback
