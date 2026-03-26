"""
Tests for Event and TouristSite endpoints:

  GET/POST   /api/events/
  GET/PUT/PATCH/DELETE  /api/events/{id}/
  GET  /api/events/upcoming/
  GET  /api/events/past/
  GET  /api/events/featured/
  GET  /api/events/by-slug/{slug}/
  GET/POST   /api/sites/
  GET  /api/sites/featured/
  GET  /api/sites/by-slug/{slug}/
  GET  /api/sites/{id}/events/

Coverage:
  - Public read access (no auth needed)
  - Write operations require authentication
  - Unauthenticated writes return 401
  - Slug auto-generation on create
  - is_past / is_upcoming computed correctly
  - Pagination structure
  - Detail serializer includes nested media array
  - List serializer omits media array (lightweight)
"""

from django.utils import timezone
from datetime import timedelta

from .helpers import TourismAPITestCase, make_user, make_admin, make_site, make_event


class EventPublicReadTests(TourismAPITestCase):
    """Unauthenticated users can read events."""

    def setUp(self):
        self.site    = make_site(name='Volta Lake')
        self.event1  = make_event(title='Upcoming Fest', site=self.site, days_offset=30,
                                  is_featured=True)
        self.event2  = make_event(title='Past Tour',     site=self.site, days_offset=-10)

    # ── List ──────────────────────────────────────────────────────────── #

    def test_list_returns_200(self):
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, 200)

    def test_list_is_paginated(self):
        response = self.client.get('/api/events/')
        self.assertIn('count',    response.data)
        self.assertIn('results',  response.data)
        self.assertIn('next',     response.data)
        self.assertIn('previous', response.data)

    def test_list_uses_lightweight_serializer(self):
        """List endpoint must NOT include the nested media array."""
        response = self.client.get('/api/events/')
        for item in response.data['results']:
            self.assertNotIn('media', item)
            self.assertIn('media_count', item)

    def test_list_includes_computed_fields(self):
        response = self.client.get('/api/events/')
        for item in response.data['results']:
            self.assertIn('is_past',     item)
            self.assertIn('is_upcoming', item)
            self.assertIn('slug',        item)

    # ── Detail ────────────────────────────────────────────────────────── #

    def test_detail_returns_200(self):
        response = self.client.get(f'/api/events/{self.event1.pk}/')
        self.assertEqual(response.status_code, 200)

    def test_detail_includes_media_array(self):
        response = self.client.get(f'/api/events/{self.event1.pk}/')
        self.assertIn('media', response.data)
        self.assertIsInstance(response.data['media'], list)

    def test_detail_includes_description(self):
        response = self.client.get(f'/api/events/{self.event1.pk}/')
        self.assertIn('description', response.data)

    def test_nonexistent_event_returns_404(self):
        response = self.client.get('/api/events/99999/')
        self.assertEqual(response.status_code, 404)

    # ── Custom list actions ───────────────────────────────────────────── #

    def test_upcoming_only_returns_future_events(self):
        response = self.client.get('/api/events/upcoming/')
        self.assertEqual(response.status_code, 200)
        for item in response.data['results']:
            self.assertTrue(item['is_upcoming'])
            self.assertFalse(item['is_past'])

    def test_past_only_returns_past_events(self):
        response = self.client.get('/api/events/past/')
        self.assertEqual(response.status_code, 200)
        for item in response.data['results']:
            self.assertTrue(item['is_past'])
            self.assertFalse(item['is_upcoming'])

    def test_featured_only_returns_featured_events(self):
        response = self.client.get('/api/events/featured/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Upcoming Fest')

    def test_by_slug_returns_correct_event(self):
        slug     = self.event1.slug
        response = self.client.get(f'/api/events/by-slug/{slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'],  slug)
        self.assertEqual(response.data['title'], 'Upcoming Fest')
        # by-slug returns full detail serializer
        self.assertIn('media', response.data)

    def test_by_slug_invalid_slug_returns_404(self):
        response = self.client.get('/api/events/by-slug/does-not-exist/')
        self.assertEqual(response.status_code, 404)


class EventWritePermissionTests(TourismAPITestCase):
    """Write operations require a valid Bearer token."""

    def setUp(self):
        self.user  = make_user()
        self.admin = make_admin()
        self.site  = make_site()
        self.event = make_event(site=self.site)

    def _create_payload(self, title='New Event'):
        return {
            'title':       title,
            'description': 'Test description.',
            'location':    'Accra, Ghana',
            'date':        (timezone.now() + timezone.timedelta(days=5)).isoformat(),
            'price':       '45.00',
        }

    # ── Unauthenticated should get 401 ───────────────────────────────── #

    def test_create_unauthenticated_returns_401(self):
        response = self.client.post('/api/events/', self._create_payload(), format='json')
        self.assertEqual(response.status_code, 401)

    def test_update_unauthenticated_returns_401(self):
        response = self.client.put(
            f'/api/events/{self.event.pk}/', self._create_payload(), format='json'
        )
        self.assertEqual(response.status_code, 401)

    def test_patch_unauthenticated_returns_401(self):
        response = self.client.patch(
            f'/api/events/{self.event.pk}/', {'title': 'Hacked'}, format='json'
        )
        self.assertEqual(response.status_code, 401)

    def test_delete_unauthenticated_returns_401(self):
        response = self.client.delete(f'/api/events/{self.event.pk}/')
        self.assertEqual(response.status_code, 401)

    # ── Authenticated user can write ──────────────────────────────────── #

    def test_create_authenticated_returns_201(self):
        client   = self.auth_client(self.user)
        response = client.post('/api/events/', self._create_payload(), format='json')
        self.assertEqual(response.status_code, 201)

    def test_create_returns_slug(self):
        client   = self.auth_client(self.user)
        response = client.post('/api/events/', self._create_payload('Slug Test Event'),
                               format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('slug', response.data)
        self.assertIn('slug-test-event', response.data['slug'])

    def test_create_with_tourist_site(self):
        client   = self.auth_client(self.user)
        payload  = self._create_payload('Linked Event')
        payload['tourist_site_id'] = self.site.pk
        response = client.post('/api/events/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['tourist_site']['id'], self.site.pk)

    def test_patch_authenticated_updates_field(self):
        client   = self.auth_client(self.user)
        response = client.patch(
            f'/api/events/{self.event.pk}/', {'title': 'Updated Title'}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.event.refresh_from_db()
        self.assertEqual(self.event.title, 'Updated Title')

    def test_delete_authenticated_returns_204(self):
        client   = self.auth_client(self.user)
        response = client.delete(f'/api/events/{self.event.pk}/')
        self.assertEqual(response.status_code, 204)
        from tourism_events.models import Event
        self.assertFalse(Event.objects.filter(pk=self.event.pk).exists())


class TouristSiteTests(TourismAPITestCase):
    """Tests for /api/sites/."""

    def setUp(self):
        self.user  = make_user()
        self.site1 = make_site(name='Labadi Beach',  is_featured=True)
        self.site2 = make_site(name='Mole Park', location='Northern Region')
        make_event(title='Park Event', site=self.site2, days_offset=20)

    # ── Public reads ──────────────────────────────────────────────────── #

    def test_site_list_public(self):
        response = self.client.get('/api/sites/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 2)

    def test_site_detail_public(self):
        response = self.client.get(f'/api/sites/{self.site1.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('media', response.data)

    def test_site_featured_action(self):
        response = self.client.get('/api/sites/featured/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Labadi Beach')

    def test_site_by_slug(self):
        slug     = self.site1.slug
        response = self.client.get(f'/api/sites/by-slug/{slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], slug)

    def test_site_events_sub_endpoint(self):
        response = self.client.get(f'/api/sites/{self.site2.pk}/events/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Park Event')

    def test_site_upcoming_events_count(self):
        response = self.client.get(f'/api/sites/{self.site2.pk}/')
        self.assertEqual(response.data['upcoming_events_count'], 1)

    # ── Write permissions ─────────────────────────────────────────────── #

    def test_create_site_unauthenticated_returns_401(self):
        response = self.client.post('/api/sites/', {'name': 'New Site',
                                                    'location': 'South'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_create_site_authenticated(self):
        client   = self.auth_client(self.user)
        response = client.post(
            '/api/sites/',
            {'name': 'Wli Waterfalls', 'location': 'Volta Region',
             'description': 'Beautiful waterfall.'},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('slug', response.data)

    def test_delete_site_authenticated(self):
        client   = self.auth_client(self.user)
        response = client.delete(f'/api/sites/{self.site2.pk}/')
        self.assertEqual(response.status_code, 204)
