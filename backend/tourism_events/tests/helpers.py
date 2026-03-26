"""
Shared test helpers: factories, fixtures, and base classes.
"""
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from rest_framework.test import APIClient, APITestCase

from tourism_events.models import TouristSite, Event


# ---------------------------------------------------------------------------
# Factories  (simple functions, no third-party dependency needed)
# ---------------------------------------------------------------------------

def make_user(username='testuser', password='TestPass123!', is_staff=False, **kwargs):
    user = User.objects.create_user(
        username=username,
        password=password,
        email=f'{username}@example.com',
        is_staff=is_staff,
        **kwargs,
    )
    return user


def make_admin(username='admin', password='AdminPass123!'):
    return make_user(username=username, password=password, is_staff=True, is_superuser=True)


def make_site(name='Test Site', location='Test Location', is_featured=False, **kwargs):
    return TouristSite.objects.create(
        name=name,
        description='A test tourist site.',
        location=location,
        is_featured=is_featured,
        **kwargs,
    )


def make_event(title='Test Event', site=None, days_offset=10, price='25.00',
               is_featured=False, **kwargs):
    """days_offset > 0 → upcoming; < 0 → past."""
    return Event.objects.create(
        title=title,
        description='A test event.',
        location='Test Location',
        date=timezone.now() + timedelta(days=days_offset),
        price=price,
        is_featured=is_featured,
        tourist_site=site,
        **kwargs,
    )


# ---------------------------------------------------------------------------
# Base test case with convenience helpers
# ---------------------------------------------------------------------------

class TourismAPITestCase(APITestCase):
    """
    Base class for all Tourism API tests.

    Provides:
      - self.client  — unauthenticated APIClient (from APITestCase)
      - self.auth_client(user)  — returns client with Bearer token
      - self.get_tokens(user)   — returns {'access': ..., 'refresh': ...}
    """

    def get_tokens(self, user: User, password: str = 'TestPass123!') -> dict:
        """Obtain JWT tokens for *user* via the login endpoint."""
        response = self.client.post(
            '/api/auth/login/',
            {'username': user.username, 'password': password},
            format='json',
        )
        assert response.status_code == 200, (
            f'Login failed ({response.status_code}): {response.data}'
        )
        return response.data  # contains 'access', 'refresh', 'user'

    def auth_client(self, user: User, password: str = 'TestPass123!') -> APIClient:
        """Return an APIClient pre-configured with a valid Bearer token."""
        tokens  = self.get_tokens(user, password)
        client  = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        return client
