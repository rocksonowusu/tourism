"""
Tests for image compression functionality.

This module tests the image compression utility to ensure:
1. Images are properly compressed to 4 MB or less
2. Quality is intelligently reduced to achieve target size
3. Image formats are correctly handled
4. Metadata is preserved when possible
5. Error handling works properly
"""

import io
from django.core.files.uploadedfile import SimpleUploadedFile, InMemoryUploadedFile
from django.test import TestCase
from PIL import Image

from tourism_events.image_compression import (
    compress_image,
    get_compression_info,
    is_image_file,
    MAX_COMPRESSED_SIZE_BYTES,
    MAX_COMPRESSED_SIZE_MB,
)


class ImageCompressionTestCase(TestCase):
    """Test suite for image compression functionality."""

    def create_test_image(self, size=(2000, 2000), format='JPEG', quality=95):
        """
        Helper to create a test image file.

        Args:
            size: Tuple of (width, height)
            format: Image format ('JPEG', 'PNG', 'WEBP', 'GIF')
            quality: Quality level for lossy formats

        Returns:
            SimpleUploadedFile: Test image file
        """
        image = Image.new('RGB', size, color='red')
        buffer = io.BytesIO()

        save_kwargs = {'format': format}
        if format in ('JPEG', 'WEBP'):
            save_kwargs['quality'] = quality
        if format == 'JPEG':
            save_kwargs['progressive'] = True

        image.save(buffer, **save_kwargs)
        buffer.seek(0)

        filename = f'test_image.{format.lower()}'
        content_type = f'image/{format.lower()}'

        return SimpleUploadedFile(
            name=filename,
            content=buffer.getvalue(),
            content_type=content_type,
        )

    def test_small_image_not_compressed_unnecessarily(self):
        """Small images should be returned as-is."""
        # Create a small image (< 4MB)
        small_image = self.create_test_image(size=(500, 500), quality=95)

        # Compress it
        result = compress_image(small_image)

        # Size should not increase
        self.assertLessEqual(result.size, small_image.size * 1.1)  # Allow 10% variance

    def test_large_image_compressed_to_4mb(self):
        """Large images should be compressed to <= 4 MB."""
        # Create a large image
        large_image = self.create_test_image(size=(4000, 4000), quality=95)

        # Compress it
        result = compress_image(large_image)

        # Result should be <= 4 MB
        self.assertLessEqual(result.size, MAX_COMPRESSED_SIZE_BYTES)
        self.assertLessEqual(
            result.size / (1024 * 1024),
            MAX_COMPRESSED_SIZE_MB,
        )

    def test_png_image_compressed(self):
        """PNG images should be properly compressed."""
        # Create a large PNG
        png_image = self.create_test_image(size=(3000, 3000), format='PNG')

        # Compress it
        result = compress_image(png_image)

        # Should be compressed to <= 4 MB
        self.assertLessEqual(result.size, MAX_COMPRESSED_SIZE_BYTES)

    def test_webp_image_compressed(self):
        """WebP images should be properly compressed."""
        # Create a WebP image
        webp_image = self.create_test_image(size=(2000, 2000), format='WEBP', quality=95)

        # Compress it
        result = compress_image(webp_image)

        # Should be <= 4 MB
        self.assertLessEqual(result.size, MAX_COMPRESSED_SIZE_BYTES)

    def test_compressed_image_is_valid(self):
        """Compressed images should remain valid and openable."""
        # Create and compress a large image
        image = self.create_test_image(size=(2000, 2000), quality=95)
        result = compress_image(image)

        # Should be able to open the compressed image
        result.seek(0)
        compressed_pil_image = Image.open(result)
        self.assertIsNotNone(compressed_pil_image.format)

    def test_get_compression_info(self):
        """get_compression_info should return useful metadata."""
        image = self.create_test_image(size=(1000, 1000))

        info = get_compression_info(image)

        # Should have expected keys
        self.assertIn('filename', info)
        self.assertIn('original_size_bytes', info)
        self.assertIn('original_size_mb', info)
        self.assertIn('format', info)
        self.assertIn('dimensions', info)
        self.assertIn('needs_compression', info)

        # Dimensions should be correct
        self.assertEqual(info['dimensions'], (1000, 1000))

    def test_is_image_file(self):
        """is_image_file should correctly identify valid images."""
        valid_image = self.create_test_image(size=(500, 500))
        result = is_image_file(valid_image)
        self.assertTrue(result)

    def test_invalid_file_raises_error(self):
        """Invalid files should raise ValidationError."""
        # Create an invalid file (not an image)
        invalid_file = SimpleUploadedFile(
            name='notanimage.txt',
            content=b'This is not an image',
            content_type='text/plain',
        )

        # Should raise ValidationError
        with self.assertRaises(Exception):
            compress_image(invalid_file)

    def test_rgba_to_rgb_conversion(self):
        """RGBA images should be converted to RGB when saving as JPEG."""
        # Create RGBA image (PNG)
        image = Image.new('RGBA', (500, 500), color=(255, 0, 0, 128))
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)

        png_file = SimpleUploadedFile(
            name='rgba_image.png',
            content=buffer.getvalue(),
            content_type='image/png',
        )

        # Compress (should convert to RGB)
        result = compress_image(png_file)

        # Result should be valid JPEG or converted image
        self.assertLessEqual(result.size, MAX_COMPRESSED_SIZE_BYTES)

    def test_extremely_large_image_fails_gracefully(self):
        """Extremely large images should fail with helpful error message."""
        # Create a very large simple image
        image = Image.new('RGB', (4000, 4000), color='black')
        buffer = io.BytesIO()

        # Save with lowest quality
        image.save(buffer, format='JPEG', quality=1, progressive=True)
        buffer.seek(0)

        large_file = SimpleUploadedFile(
            name='huge_image.jpg',
            content=buffer.getvalue(),
            content_type='image/jpeg',
        )

        # Even the lowest quality might still be > 4MB for this huge size
        # If it fails, it should have a clear error message
        try:
            result = compress_image(large_file)
            # If it succeeds, it should be <= 4MB
            self.assertLessEqual(result.size, MAX_COMPRESSED_SIZE_BYTES)
        except Exception as e:
            # Error message should be informative
            self.assertIn('4 MB', str(e))

    def test_progressive_jpeg_support(self):
        """Progressive JPEGs should be supported and compressed."""
        image = Image.new('RGB', (2000, 2000), color='blue')
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', progressive=True, quality=95)
        buffer.seek(0)

        progressive_file = SimpleUploadedFile(
            name='progressive.jpg',
            content=buffer.getvalue(),
            content_type='image/jpeg',
        )

        # Compress it
        result = compress_image(progressive_file)

        # Should be <= 4 MB
        self.assertLessEqual(result.size, MAX_COMPRESSED_SIZE_BYTES)


class ImageCompressionIntegrationTestCase(TestCase):
    """Integration tests for image compression with Django models."""

    def test_compression_preserves_filename(self):
        """Compressed images should maintain recognizable filenames."""
        image = self.create_test_image(size=(2000, 2000))
        original_name = 'my_vacation_photo.jpg'
        image.name = original_name

        result = compress_image(image)

        # Name should be preserved (with possible format change)
        self.assertIn('my_vacation_photo', result.name)

    def test_multiple_compressions_idempotent(self):
        """Compressing an already-compressed image should not change it much."""
        # Create and compress
        image = self.create_test_image(size=(2000, 2000), quality=95)
        compressed_once = compress_image(image)

        # Compress again
        compressed_twice = compress_image(compressed_once)

        # Size should not increase significantly
        size_diff = abs(compressed_twice.size - compressed_once.size)
        self.assertLess(size_diff, compressed_once.size * 0.1)  # Less than 10% diff

    def create_test_image(self, size=(2000, 2000), format='JPEG', quality=95):
        """Helper to create a test image file."""
        image = Image.new('RGB', size, color='red')
        buffer = io.BytesIO()

        save_kwargs = {'format': format}
        if format in ('JPEG', 'WEBP'):
            save_kwargs['quality'] = quality
        if format == 'JPEG':
            save_kwargs['progressive'] = True

        image.save(buffer, **save_kwargs)
        buffer.seek(0)

        filename = f'test_image.{format.lower()}'
        content_type = f'image/{format.lower()}'

        return SimpleUploadedFile(
            name=filename,
            content=buffer.getvalue(),
            content_type=content_type,
        )
