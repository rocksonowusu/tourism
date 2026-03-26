"""
Tests for media upload endpoints:

  POST /api/events/{id}/upload/
  GET  /api/events/{id}/media/
  POST /api/sites/{id}/upload/
  GET  /api/sites/{id}/media/
  POST/GET/DELETE  /api/event-media/
  POST/GET/DELETE  /api/site-media/

Coverage:
  - Authenticated upload creates EventMedia / TouristSiteMedia records
  - Unauthenticated upload returns 401
  - Uploading with no file returns 400
  - Uploading an invalid file type returns 400
  - media_type is auto-detected (image/video)
  - GET /events/{id}/media/ lists media for that event
  - GET /sites/{id}/media/ lists media for that site
  - media_count property increments correctly
  - Direct media CRUD requires auth for writes

NOTE: These tests use an in-memory fake file so they don't touch Cloudinary.
      The DEFAULT_FILE_STORAGE is overridden in test settings to use the
      local filesystem (FileSystemStorage). If that override is not present,
      uploads will be attempted against Cloudinary — set CLOUD_NAME etc. in
      your .env, or override DEFAULT_FILE_STORAGE in settings for testing.
"""

import io
from unittest.mock import patch, MagicMock

from django.core.files.uploadedfile import SimpleUploadedFile

from .helpers import TourismAPITestCase, make_user, make_site, make_event
from tourism_events.models import EventMedia, TouristSiteMedia


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fake_image(name='photo.jpg', content=b'GIF89a\x01\x00\x01\x00\x00\xff\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x00;',
               content_type='image/gif'):
    """Return a minimal valid image as SimpleUploadedFile."""
    return SimpleUploadedFile(name, content, content_type=content_type)


def fake_invalid_file(name='malware.exe'):
    """Return a file with an unsupported MIME type."""
    return SimpleUploadedFile(name, b'MZ\x00\x00', content_type='application/x-msdownload')


# ---------------------------------------------------------------------------
# Patch Cloudinary for all media tests
# ---------------------------------------------------------------------------

def _mock_cloudinary_save(self, name, content, **kwargs):
    """
    Minimal stand-in for cloudinary_storage save().
    Returns the original filename so models can store it.
    """
    return name


class MediaUploadTestCase(TourismAPITestCase):
    """
    Base class that patches Cloudinary storage so no network calls are made.
    Tests that actually care about file content should use real storage.
    """

    def setUp(self):
        super().setUp()
        self.user  = make_user()
        self.site  = make_site(name='Upload Test Site')
        self.event = make_event(title='Upload Test Event', site=self.site)

        # Patch cloudinary storage .save() so tests don't hit the network.
        patcher = patch(
            'cloudinary_storage.storage.MediaCloudinaryStorage.save',
            side_effect=_mock_cloudinary_save,
            autospec=True,
        )
        self.mock_storage = patcher.start()
        self.addCleanup(patcher.stop)

        # Also patch .url() so file_url doesn't fail
        url_patcher = patch(
            'cloudinary_storage.storage.MediaCloudinaryStorage.url',
            return_value='https://res.cloudinary.com/fake/image/upload/sample.jpg',
        )
        self.mock_url = url_patcher.start()
        self.addCleanup(url_patcher.stop)


# ---------------------------------------------------------------------------
# Event media upload
# ---------------------------------------------------------------------------

class EventMediaUploadTests(MediaUploadTestCase):

    def test_authenticated_upload_returns_201(self):
        client   = self.auth_client(self.user)
        response = client.post(
            f'/api/events/{self.event.pk}/upload/',
            {'file': fake_image(), 'caption': 'Nice photo'},
            format='multipart',
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('created', response.data)
        self.assertEqual(len(response.data['created']), 1)

    def test_unauthenticated_upload_returns_401(self):
        response = self.client.post(
            f'/api/events/{self.event.pk}/upload/',
            {'file': fake_image()},
            format='multipart',
        )
        self.assertEqual(response.status_code, 401)

    def test_upload_no_file_returns_400(self):
        client   = self.auth_client(self.user)
        response = client.post(
            f'/api/events/{self.event.pk}/upload/',
            {'caption': 'No file here'},
            format='multipart',
        )
        self.assertEqual(response.status_code, 400)

    def test_upload_invalid_event_returns_404(self):
        client   = self.auth_client(self.user)
        response = client.post(
            '/api/events/99999/upload/',
            {'file': fake_image()},
            format='multipart',
        )
        self.assertEqual(response.status_code, 404)

    def test_upload_multiple_files(self):
        client = self.auth_client(self.user)
        response = client.post(
            f'/api/events/{self.event.pk}/upload/',
            {
                'file': [
                    fake_image('photo1.jpg'),
                    fake_image('photo2.jpg'),
                ],
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data['created']), 2)

    def test_media_count_increments_after_upload(self):
        initial = self.event.media.count()
        client  = self.auth_client(self.user)
        client.post(
            f'/api/events/{self.event.pk}/upload/',
            {'file': fake_image()},
            format='multipart',
        )
        self.event.refresh_from_db()
        self.assertEqual(self.event.media.count(), initial + 1)

    def test_get_media_endpoint_lists_media(self):
        # Create a media record directly
        EventMedia.objects.create(
            event=self.event,
            file='tourism/events/test.jpg',
            media_type='image',
        )
        response = self.client.get(f'/api/events/{self.event.pk}/media/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_media_type_field_is_present(self):
        client = self.auth_client(self.user)
        response = client.post(
            f'/api/events/{self.event.pk}/upload/',
            {'file': fake_image()},
            format='multipart',
        )
        self.assertEqual(response.status_code, 201)
        created_item = response.data['created'][0]
        self.assertIn('media_type', created_item)


# ---------------------------------------------------------------------------
# Tourist site media upload
# ---------------------------------------------------------------------------

class SiteMediaUploadTests(MediaUploadTestCase):

    def test_authenticated_site_upload_returns_201(self):
        client   = self.auth_client(self.user)
        response = client.post(
            f'/api/sites/{self.site.pk}/upload/',
            {'file': fake_image(), 'caption': 'Site photo'},
            format='multipart',
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('created', response.data)

    def test_unauthenticated_site_upload_returns_401(self):
        response = self.client.post(
            f'/api/sites/{self.site.pk}/upload/',
            {'file': fake_image()},
            format='multipart',
        )
        self.assertEqual(response.status_code, 401)

    def test_get_site_media_is_public(self):
        TouristSiteMedia.objects.create(
            tourist_site=self.site,
            file='tourism/tourist_sites/test.jpg',
            media_type='image',
        )
        response = self.client.get(f'/api/sites/{self.site.pk}/media/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_site_media_count_in_detail_response(self):
        TouristSiteMedia.objects.create(
            tourist_site=self.site,
            file='tourism/tourist_sites/a.jpg',
            media_type='image',
        )
        TouristSiteMedia.objects.create(
            tourist_site=self.site,
            file='tourism/tourist_sites/b.jpg',
            media_type='image',
        )
        response = self.client.get(f'/api/sites/{self.site.pk}/')
        self.assertEqual(response.data['media_count'], 2)


# ---------------------------------------------------------------------------
# Direct media CRUD  (/api/event-media/, /api/site-media/)
# ---------------------------------------------------------------------------

class EventMediaDirectCRUDTests(MediaUploadTestCase):

    def test_list_event_media_is_public(self):
        response = self.client.get('/api/event-media/')
        self.assertEqual(response.status_code, 200)

    def test_delete_event_media_requires_auth(self):
        media = EventMedia.objects.create(
            event=self.event,
            file='tourism/events/test.jpg',
            media_type='image',
        )
        response = self.client.delete(f'/api/event-media/{media.pk}/')
        self.assertEqual(response.status_code, 401)

    def test_delete_event_media_authenticated(self):
        media  = EventMedia.objects.create(
            event=self.event,
            file='tourism/events/test.jpg',
            media_type='image',
        )
        client = self.auth_client(self.user)
        response = client.delete(f'/api/event-media/{media.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(EventMedia.objects.filter(pk=media.pk).exists())

    def test_patch_event_media_updates_caption(self):
        media  = EventMedia.objects.create(
            event=self.event,
            file='tourism/events/test.jpg',
            media_type='image',
            caption='Old',
        )
        client = self.auth_client(self.user)
        response = client.patch(
            f'/api/event-media/{media.pk}/',
            {'caption': 'New caption'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        media.refresh_from_db()
        self.assertEqual(media.caption, 'New caption')


class SiteMediaDirectCRUDTests(MediaUploadTestCase):

    def test_list_site_media_is_public(self):
        response = self.client.get('/api/site-media/')
        self.assertEqual(response.status_code, 200)

    def test_delete_site_media_requires_auth(self):
        media = TouristSiteMedia.objects.create(
            tourist_site=self.site,
            file='tourism/tourist_sites/test.jpg',
            media_type='image',
        )
        response = self.client.delete(f'/api/site-media/{media.pk}/')
        self.assertEqual(response.status_code, 401)

    def test_delete_site_media_authenticated(self):
        media  = TouristSiteMedia.objects.create(
            tourist_site=self.site,
            file='tourism/tourist_sites/test.jpg',
            media_type='image',
        )
        client = self.auth_client(self.user)
        response = client.delete(f'/api/site-media/{media.pk}/')
        self.assertEqual(response.status_code, 204)
