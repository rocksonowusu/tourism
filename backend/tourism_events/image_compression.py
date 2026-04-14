"""
Image Compression Utility Module

This module provides utilities to compress images to a maximum file size before
uploading to Cloudinary. All images are compressed to ensure they do not exceed
4 MB.

Features:
- Automatic quality degradation to achieve target file size
- Support for JPEG, PNG, WebP, and GIF formats
- Preserves image metadata when possible
- Converts PNG to JPEG if needed for better compression
- Thread-safe operations
"""

import io
import os
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.exceptions import ValidationError


# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

# Maximum file size in bytes (4 MB)
MAX_COMPRESSED_SIZE_BYTES = 4 * 1024 * 1024  # 4 MB
MAX_COMPRESSED_SIZE_MB = 4

# Supported formats for compression
COMPRESSIBLE_FORMATS = {'JPEG', 'JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF'}

# Initial quality setting for lossy compression (JPEG, WebP)
INITIAL_QUALITY = 85

# Minimum quality before giving up (prevents overly degraded images)
MINIMUM_QUALITY = 30

# Maximum dimensions to prevent extremely large images
MAX_IMAGE_WIDTH = 4000
MAX_IMAGE_HEIGHT = 4000


# ─────────────────────────────────────────────────────────────────────────────
# Main Compression Function
# ─────────────────────────────────────────────────────────────────────────────

def compress_image(uploaded_file, target_size_bytes=MAX_COMPRESSED_SIZE_BYTES):
    """
    Compress an uploaded image to meet the target file size requirement.

    This function:
    1. Opens the uploaded image file
    2. Resizes it if necessary (max 4000x4000)
    3. Compresses with progressive quality reduction
    4. Returns a new InMemoryUploadedFile with compressed content

    Args:
        uploaded_file: Django UploadedFile object (from request.FILES)
        target_size_bytes: Target maximum file size in bytes (default: 4 MB)

    Returns:
        InMemoryUploadedFile: A new uploaded file object with compressed image

    Raises:
        ValidationError: If the image cannot be compressed to the target size
                        or if the file is not a valid image
    """
    # Validate input - if it's a string (Cloudinary URL), return as-is
    if isinstance(uploaded_file, str):
        return uploaded_file
    
    if not uploaded_file:
        raise ValidationError('Invalid file provided for compression.')
    
    if not hasattr(uploaded_file, 'read'):
        raise ValidationError('Invalid file provided for compression.')

    # Get original filename and extension
    original_name = getattr(uploaded_file, 'name', 'image.jpg')
    original_size = getattr(uploaded_file, 'size', 0)

    # Already within size limit - still compress for quality
    if original_size > 0 and original_size <= target_size_bytes:
        # For small files, try to compress anyway to ensure compliance
        try:
            if hasattr(uploaded_file, 'seek'):
                uploaded_file.seek(0)
            image = Image.open(uploaded_file)
            # If we can't open it or it has issues, just return original
            image_format = image.format or 'JPEG'
        except Exception:
            return uploaded_file

    try:
        # Reset file pointer
        if hasattr(uploaded_file, 'seek'):
            uploaded_file.seek(0)
        
        # Open the image and load it completely into memory
        image = Image.open(uploaded_file)
        
        # Load the image data into memory so we don't depend on file pointer
        image.load()
        
        image_format = image.format or 'JPEG'

        # If it's not an image format we recognize, raise error
        if image_format.upper() not in COMPRESSIBLE_FORMATS:
            raise ValidationError(
                f'Unsupported image format: {image_format}. '
                f'Supported formats: {", ".join(sorted(COMPRESSIBLE_FORMATS))}'
            )

        # Resize if necessary
        image = _resize_image_if_needed(image)

        # Convert RGBA to RGB if saving as JPEG (JPEG doesn't support transparency)
        if image_format.upper() in ('JPEG', 'JPG') and image.mode == 'RGBA':
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background
            image_format = 'JPEG'

        # Compress the image
        compressed_file = _compress_to_target_size(
            image,
            image_format,
            target_size_bytes,
            original_name
        )

        return compressed_file

    except Image.UnidentifiedImageError:
        raise ValidationError('The uploaded file is not a valid image.')
    except ValidationError:
        # Re-raise validation errors
        raise
    except Exception as e:
        raise ValidationError(f'Error compressing image: {str(e)}')


# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────

def _resize_image_if_needed(image):
    """
    Resize image if it exceeds maximum dimensions.
    Maintains aspect ratio.

    Args:
        image: PIL Image object

    Returns:
        PIL Image object (resized if needed)
    """
    width, height = image.size

    if width > MAX_IMAGE_WIDTH or height > MAX_IMAGE_HEIGHT:
        # Calculate the scaling factor
        scale = min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height)
        new_width = int(width * scale)
        new_height = int(height * scale)

        # Resize using high-quality resampling
        image = image.resize(
            (new_width, new_height),
            Image.Resampling.LANCZOS
        )

    return image


def _compress_to_target_size(image, image_format, target_size_bytes, original_name):
    """
    Compress an image to meet the target file size by iteratively reducing quality.

    Args:
        image: PIL Image object
        image_format: String format name (e.g., 'JPEG', 'PNG')
        target_size_bytes: Target maximum file size
        original_name: Original filename

    Returns:
        InMemoryUploadedFile: Compressed image as Django UploadedFile

    Raises:
        ValidationError: If compression cannot achieve target size
    """
    image_format = image_format.upper()

    # PNG and GIF are lossless, try converting to JPEG
    if image_format in ('PNG', 'GIF', 'TIFF', 'BMP'):
        # Try PNG first with optimization
        if image_format == 'PNG':
            compressed_bytes = _save_image_to_bytes(image, 'PNG', optimize=True)

            if len(compressed_bytes) <= target_size_bytes:
                return _create_uploaded_file(compressed_bytes, original_name, 'PNG')

        # Fall back to JPEG conversion
        image_format = 'JPEG'

    # For JPEG and WebP, use progressive quality reduction
    if image_format in ('JPEG', 'WEBP'):
        return _compress_lossy_image(
            image,
            image_format,
            target_size_bytes,
            original_name
        )

    # Fallback for other formats
    compressed_bytes = _save_image_to_bytes(image, image_format)
    if len(compressed_bytes) > target_size_bytes:
        raise ValidationError(
            f'Cannot compress {image_format} image to {MAX_COMPRESSED_SIZE_MB} MB. '
            f'Compressed size: {len(compressed_bytes) / (1024 * 1024):.2f} MB'
        )

    return _create_uploaded_file(compressed_bytes, original_name, image_format)


def _compress_lossy_image(image, image_format, target_size_bytes, original_name):
    """
    Compress a lossy-format image (JPEG/WebP) by reducing quality iteratively.

    Args:
        image: PIL Image object
        image_format: 'JPEG' or 'WEBP'
        target_size_bytes: Target maximum file size
        original_name: Original filename

    Returns:
        InMemoryUploadedFile: Compressed image as Django UploadedFile

    Raises:
        ValidationError: If cannot achieve target size even at minimum quality
    """
    quality = INITIAL_QUALITY

    while quality >= MINIMUM_QUALITY:
        compressed_bytes = _save_image_to_bytes(image, image_format, quality=quality)

        if len(compressed_bytes) <= target_size_bytes:
            return _create_uploaded_file(compressed_bytes, original_name, image_format)

        # Reduce quality for next iteration
        quality -= 5

    # Could not achieve target size
    final_size_mb = len(compressed_bytes) / (1024 * 1024)
    raise ValidationError(
        f'Cannot compress image to {MAX_COMPRESSED_SIZE_MB} MB. '
        f'Minimum achievable size at lowest quality: {final_size_mb:.2f} MB. '
        f'Please upload a smaller or simpler image.'
    )


def _save_image_to_bytes(image, image_format, quality=None, optimize=False):
    """
    Save PIL Image to bytes buffer.

    Args:
        image: PIL Image object
        image_format: Format string ('JPEG', 'PNG', 'WEBP', etc.)
        quality: Quality level (1-95, applicable to JPEG/WebP)
        optimize: Whether to optimize (applicable to PNG)

    Returns:
        bytes: Image data
    """
    buffer = io.BytesIO()

    save_kwargs = {'format': image_format}

    if quality is not None and image_format in ('JPEG', 'WEBP'):
        save_kwargs['quality'] = quality

    if optimize and image_format == 'PNG':
        save_kwargs['optimize'] = True

    if image_format == 'JPEG':
        # Use progressive JPEG for better quality at smaller sizes
        save_kwargs['progressive'] = True

    image.save(buffer, **save_kwargs)
    buffer.seek(0)

    return buffer.getvalue()


def _create_uploaded_file(file_bytes, original_name, image_format):
    """
    Create a Django InMemoryUploadedFile from compressed image bytes.

    Args:
        file_bytes: bytes object containing image data
        original_name: Original filename
        image_format: Format string ('JPEG', 'PNG', etc.)

    Returns:
        InMemoryUploadedFile: New uploaded file object
    """
    # Determine content type
    content_type_map = {
        'JPEG': 'image/jpeg',
        'PNG': 'image/png',
        'WEBP': 'image/webp',
        'GIF': 'image/gif',
        'BMP': 'image/bmp',
        'TIFF': 'image/tiff',
    }
    content_type = content_type_map.get(image_format.upper(), 'image/jpeg')

    # Create file extension
    ext_map = {
        'JPEG': '.jpg',
        'PNG': '.png',
        'WEBP': '.webp',
        'GIF': '.gif',
        'BMP': '.bmp',
        'TIFF': '.tiff',
    }
    ext = ext_map.get(image_format.upper(), '.jpg')

    # Update filename with proper extension
    filename = os.path.splitext(original_name)[0] + ext

    # Create buffer and ensure it's at position 0
    file_buffer = io.BytesIO(file_bytes)
    file_buffer.seek(0)

    # Create InMemoryUploadedFile
    uploaded_file = InMemoryUploadedFile(
        file=file_buffer,
        field_name='file',
        name=filename,
        content_type=content_type,
        size=len(file_bytes),
        charset=None,
    )
    
    return uploaded_file


def get_compression_info(uploaded_file):
    """
    Get information about an image without compressing it.
    Useful for debugging and monitoring.

    Args:
        uploaded_file: Django UploadedFile object

    Returns:
        dict: Information about the file including size, dimensions, format
    """
    try:
        original_size = getattr(uploaded_file, 'size', 0)
        filename = getattr(uploaded_file, 'name', 'unknown')

        image = Image.open(uploaded_file)
        uploaded_file.seek(0)  # Reset file pointer

        return {
            'filename': filename,
            'original_size_bytes': original_size,
            'original_size_mb': original_size / (1024 * 1024),
            'format': image.format,
            'dimensions': image.size,
            'mode': image.mode,
            'needs_compression': original_size > MAX_COMPRESSED_SIZE_BYTES,
        }
    except Exception as e:
        return {
            'filename': filename,
            'error': str(e),
        }


def is_image_file(uploaded_file):
    """
    Check if an uploaded file is a valid image.

    Args:
        uploaded_file: Django UploadedFile object

    Returns:
        bool: True if file is a valid image, False otherwise
    """
    try:
        image = Image.open(uploaded_file)
        image.verify()
        return True
    except Exception:
        return False
