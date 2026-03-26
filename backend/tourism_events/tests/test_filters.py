"""
Tests for filtering, search, and ordering on Event and TouristSite endpoints.

Coverage:
  EventFilter
    - ?is_featured=true/false
    - ?tourist_site=<id>
    - ?date_after=YYYY-MM-DD
    - ?date_before=YYYY-MM-DD
    - ?price_min=N
    - ?price_max=N
    - ?search= (title, description, location)
    - ?ordering=date / ?ordering=-date
    - ?ordering=price / ?ordering=-price
    - ?ordering=created_at
    - Pagination: ?page=2, ?page_size=2

  TouristSiteFilter
    - ?is_featured=true/false
    - ?location=<icontains>
    - ?search= (name, description, location)
    - ?ordering=name / ?ordering=-name

  EventMediaFilter
    - ?event=<id>
    - ?media_type=image|video

  TouristSiteMediaFilter
    - ?tourist_site=<id>
    - ?media_type=image|video
"""

from django.utils import timezone
from datetime import timedelta

from tourism_events.models import EventMedia, TouristSiteMedia

from .helpers import TourismAPITestCase, make_site, make_event


# ---------------------------------------------------------------------------
# Helper — create a deterministic dataset in setUp
# ---------------------------------------------------------------------------

class FilterTestBase(TourismAPITestCase):

    def setUp(self):
        self.site_a = make_site(name='Kakum Park',      location='Central Region',  is_featured=True)
        self.site_b = make_site(name='Larabanga Mosque', location='Northern Region', is_featured=False)

        now = timezone.now()

        self.ev1 = make_event(
            title='Beach Party',
            site=self.site_a,
            days_offset=5,
            price='20.00',
            is_featured=True,
        )
        self.ev2 = make_event(
            title='Mountain Trek',
            site=self.site_b,
            days_offset=20,
            price='75.00',
            is_featured=False,
        )
        self.ev3 = make_event(
            title='Historical Tour',
            site=self.site_a,
            days_offset=-15,          # past event
            price='30.00',
            is_featured=False,
        )
        self.ev4 = make_event(
            title='Safari Adventure',
            site=self.site_b,
            days_offset=60,
            price='120.00',
            is_featured=True,
        )


# ---------------------------------------------------------------------------
# Event filter tests
# ---------------------------------------------------------------------------

class EventFilterTests(FilterTestBase):

    # ── Boolean filters ───────────────────────────────────────────────── #

    def test_filter_featured_true(self):
        response = self.client.get('/api/events/?is_featured=true')
        self.assertEqual(response.status_code, 200)
        titles = [r['title'] for r in response.data['results']]
        self.assertIn('Beach Party',     titles)
        self.assertIn('Safari Adventure', titles)
        self.assertNotIn('Mountain Trek', titles)

    def test_filter_featured_false(self):
        response = self.client.get('/api/events/?is_featured=false')
        titles = [r['title'] for r in response.data['results']]
        self.assertIn('Mountain Trek', titles)
        self.assertNotIn('Beach Party', titles)

    # ── Tourist site filter ───────────────────────────────────────────── #

    def test_filter_by_tourist_site(self):
        response = self.client.get(f'/api/events/?tourist_site={self.site_a.pk}')
        self.assertEqual(response.status_code, 200)
        titles = [r['title'] for r in response.data['results']]
        self.assertIn('Beach Party',    titles)
        self.assertIn('Historical Tour', titles)
        self.assertNotIn('Mountain Trek', titles)

    # ── Date range filters ────────────────────────────────────────────── #

    def test_filter_date_after(self):
        future_date = (timezone.now() + timedelta(days=10)).strftime('%Y-%m-%d')
        response    = self.client.get(f'/api/events/?date_after={future_date}')
        self.assertEqual(response.status_code, 200)
        # Only ev2 (20 days) and ev4 (60 days) are after +10 days
        titles = [r['title'] for r in response.data['results']]
        self.assertIn('Mountain Trek',   titles)
        self.assertIn('Safari Adventure', titles)
        self.assertNotIn('Beach Party',  titles)  # +5 days, before threshold

    def test_filter_date_before(self):
        # Events strictly before today + 10 days: ev1 (5), ev3 (past)
        cutoff = (timezone.now() + timedelta(days=10)).strftime('%Y-%m-%d')
        response = self.client.get(f'/api/events/?date_before={cutoff}')
        titles = [r['title'] for r in response.data['results']]
        self.assertIn('Beach Party',     titles)
        self.assertNotIn('Safari Adventure', titles)  # 60 days out

    def test_combined_date_range(self):
        after  = (timezone.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        before = (timezone.now() + timedelta(days=25)).strftime('%Y-%m-%d')
        response = self.client.get(f'/api/events/?date_after={after}&date_before={before}')
        titles = [r['title'] for r in response.data['results']]
        self.assertIn('Beach Party',   titles)   # +5
        self.assertIn('Mountain Trek', titles)   # +20
        self.assertNotIn('Safari Adventure', titles)  # +60

    # ── Price filters ─────────────────────────────────────────────────── #

    def test_filter_price_max(self):
        response = self.client.get('/api/events/?price_max=30')
        titles   = [r['title'] for r in response.data['results']]
        self.assertIn('Beach Party',    titles)   # 20.00
        self.assertIn('Historical Tour', titles)  # 30.00
        self.assertNotIn('Mountain Trek',    titles)  # 75.00
        self.assertNotIn('Safari Adventure', titles)  # 120.00

    def test_filter_price_min(self):
        response = self.client.get('/api/events/?price_min=75')
        titles   = [r['title'] for r in response.data['results']]
        self.assertIn('Mountain Trek',    titles)   # 75.00
        self.assertIn('Safari Adventure', titles)   # 120.00
        self.assertNotIn('Beach Party',   titles)   # 20.00

    def test_combined_price_range(self):
        response = self.client.get('/api/events/?price_min=25&price_max=80')
        titles   = [r['title'] for r in response.data['results']]
        self.assertIn('Mountain Trek',   titles)    # 75.00
        self.assertIn('Historical Tour', titles)    # 30.00
        self.assertNotIn('Beach Party',  titles)    # 20.00
        self.assertNotIn('Safari Adventure', titles) # 120.00


# ---------------------------------------------------------------------------
# Event search tests
# ---------------------------------------------------------------------------

class EventSearchTests(FilterTestBase):

    def test_search_by_title(self):
        response = self.client.get('/api/events/?search=safari')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Safari Adventure')

    def test_search_case_insensitive(self):
        response = self.client.get('/api/events/?search=BEACH')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Beach Party')

    def test_search_by_location(self):
        # All events share 'Test Location' from make_event helper
        response = self.client.get('/api/events/?search=Test Location')
        self.assertEqual(response.data['count'], 4)

    def test_search_no_match_returns_empty(self):
        response = self.client.get('/api/events/?search=zyxnonexistent')
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(len(response.data['results']), 0)

    def test_search_partial_match(self):
        response = self.client.get('/api/events/?search=hist')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Historical Tour')


# ---------------------------------------------------------------------------
# Event ordering tests
# ---------------------------------------------------------------------------

class EventOrderingTests(FilterTestBase):

    def test_order_by_price_ascending(self):
        response = self.client.get('/api/events/?ordering=price')
        prices   = [float(r['price']) for r in response.data['results']]
        self.assertEqual(prices, sorted(prices))

    def test_order_by_price_descending(self):
        response = self.client.get('/api/events/?ordering=-price')
        prices   = [float(r['price']) for r in response.data['results']]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_order_by_date_ascending(self):
        response = self.client.get('/api/events/?ordering=date')
        dates    = [r['date'] for r in response.data['results']]
        self.assertEqual(dates, sorted(dates))

    def test_order_by_date_descending(self):
        response = self.client.get('/api/events/?ordering=-date')
        dates    = [r['date'] for r in response.data['results']]
        self.assertEqual(dates, sorted(dates, reverse=True))

    def test_order_by_created_at(self):
        response = self.client.get('/api/events/?ordering=created_at')
        self.assertEqual(response.status_code, 200)


# ---------------------------------------------------------------------------
# Pagination tests
# ---------------------------------------------------------------------------

class PaginationTests(FilterTestBase):

    def test_default_pagination_structure(self):
        response = self.client.get('/api/events/')
        self.assertIn('count',    response.data)
        self.assertIn('next',     response.data)
        self.assertIn('previous', response.data)
        self.assertIn('results',  response.data)

    def test_page_size_param(self):
        response = self.client.get('/api/events/?page_size=2')
        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(response.data['results']), 2)
        # 4 events total → page_size=2 must produce a next link
        self.assertIsNotNone(response.data['next'])

    def test_page_param(self):
        # Use page_size=2 so that page 2 exists (4 events → 2 pages)
        response = self.client.get('/api/events/?page_size=2&page=2')
        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(response.data['results']), 2)

    def test_invalid_page_returns_404(self):
        response = self.client.get('/api/events/?page=999')
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# TouristSite filter tests
# ---------------------------------------------------------------------------

class TouristSiteFilterTests(FilterTestBase):

    def test_filter_site_featured_true(self):
        response = self.client.get('/api/sites/?is_featured=true')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Kakum Park')

    def test_filter_site_featured_false(self):
        response = self.client.get('/api/sites/?is_featured=false')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Larabanga Mosque')

    def test_filter_site_by_location(self):
        response = self.client.get('/api/sites/?location=Northern')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Larabanga Mosque')

    def test_filter_site_location_case_insensitive(self):
        response = self.client.get('/api/sites/?location=central')
        self.assertEqual(response.data['count'], 1)

    def test_search_site_by_name(self):
        response = self.client.get('/api/sites/?search=kakum')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Kakum Park')

    def test_order_site_by_name_ascending(self):
        response = self.client.get('/api/sites/?ordering=name')
        names    = [r['name'] for r in response.data['results']]
        self.assertEqual(names, sorted(names))

    def test_order_site_by_name_descending(self):
        response = self.client.get('/api/sites/?ordering=-name')
        names    = [r['name'] for r in response.data['results']]
        self.assertEqual(names, sorted(names, reverse=True))


# ---------------------------------------------------------------------------
# EventMedia & SiteMedia filter tests
# ---------------------------------------------------------------------------

class MediaFilterTests(FilterTestBase):

    def setUp(self):
        super().setUp()
        # Create some media records directly (bypassing Cloudinary)
        self.em_image = EventMedia.objects.create(
            event=self.ev1, file='t/e/img.jpg',  media_type='image', caption='Image caption'
        )
        self.em_video = EventMedia.objects.create(
            event=self.ev2, file='t/e/vid.mp4',  media_type='video', caption='Video caption'
        )
        self.sm_image = TouristSiteMedia.objects.create(
            tourist_site=self.site_a, file='t/s/img.jpg', media_type='image'
        )
        self.sm_video = TouristSiteMedia.objects.create(
            tourist_site=self.site_b, file='t/s/vid.mp4', media_type='video'
        )

    def test_filter_event_media_by_event(self):
        response = self.client.get(f'/api/event-media/?event={self.ev1.pk}')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.em_image.pk)

    def test_filter_event_media_by_type_image(self):
        response = self.client.get('/api/event-media/?media_type=image')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['media_type'], 'image')

    def test_filter_event_media_by_type_video(self):
        response = self.client.get('/api/event-media/?media_type=video')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['media_type'], 'video')

    def test_search_event_media_by_caption(self):
        response = self.client.get('/api/event-media/?search=Image caption')
        self.assertEqual(response.data['count'], 1)

    def test_filter_site_media_by_site(self):
        response = self.client.get(f'/api/site-media/?tourist_site={self.site_a.pk}')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.sm_image.pk)

    def test_filter_site_media_by_type_video(self):
        response = self.client.get('/api/site-media/?media_type=video')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['media_type'], 'video')

    def test_event_media_ordering_by_created_at(self):
        response = self.client.get('/api/event-media/?ordering=created_at')
        self.assertEqual(response.status_code, 200)
