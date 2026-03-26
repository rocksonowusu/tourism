"""
Tests for authentication endpoints:

  POST /api/auth/login/
  POST /api/auth/refresh/
  POST /api/auth/logout/
  GET  /api/auth/me/
  PUT  /api/auth/me/
  POST /api/auth/register/  (admin-only)
  GET  /api/auth/users/     (admin-only)

Coverage:
  - Successful login returns access + refresh tokens and user profile
  - Wrong credentials return 401
  - Token refresh returns a new access token
  - Logout blacklists the refresh token
  - /me returns the authenticated user
  - /me PUT updates profile fields
  - Unauthenticated access to protected endpoints returns 401
  - Admin can create users; non-admin cannot
"""

from django.contrib.auth.models import User

from .helpers import TourismAPITestCase, make_user, make_admin


class LoginTests(TourismAPITestCase):

    def setUp(self):
        self.user = make_user()

    # ------------------------------------------------------------------ #
    # Success cases                                                        #
    # ------------------------------------------------------------------ #

    def test_login_returns_tokens_and_user(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'TestPass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access',  response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user',    response.data)

    def test_login_user_payload_fields(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'TestPass123!'},
            format='json',
        )
        user_data = response.data['user']
        self.assertEqual(user_data['username'], 'testuser')
        self.assertIn('email',      user_data)
        self.assertIn('is_staff',   user_data)
        self.assertIn('first_name', user_data)
        self.assertIn('last_name',  user_data)

    # ------------------------------------------------------------------ #
    # Failure cases                                                        #
    # ------------------------------------------------------------------ #

    def test_login_wrong_password_returns_401(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'testuser', 'password': 'WrongPassword!'},
            format='json',
        )
        self.assertEqual(response.status_code, 401)

    def test_login_unknown_user_returns_401(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'nobody', 'password': 'TestPass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, 401)

    def test_login_missing_fields_returns_400(self):
        response = self.client.post('/api/auth/login/', {}, format='json')
        self.assertEqual(response.status_code, 400)


class TokenRefreshTests(TourismAPITestCase):

    def setUp(self):
        self.user   = make_user()
        self.tokens = self.get_tokens(self.user)

    def test_refresh_returns_new_access_token(self):
        response = self.client.post(
            '/api/auth/refresh/',
            {'refresh': self.tokens['refresh']},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        # New access token should differ from the original
        self.assertNotEqual(response.data['access'], self.tokens['access'])

    def test_refresh_with_invalid_token_returns_401(self):
        response = self.client.post(
            '/api/auth/refresh/',
            {'refresh': 'not.a.valid.token'},
            format='json',
        )
        self.assertEqual(response.status_code, 401)

    def test_refresh_token_is_rotated(self):
        """After refresh, the old refresh token must be blacklisted."""
        r1 = self.client.post('/api/auth/refresh/',
                              {'refresh': self.tokens['refresh']}, format='json')
        self.assertEqual(r1.status_code, 200)
        old_refresh = self.tokens['refresh']

        # Using the old refresh token again must fail
        r2 = self.client.post('/api/auth/refresh/',
                              {'refresh': old_refresh}, format='json')
        self.assertEqual(r2.status_code, 401)


class LogoutTests(TourismAPITestCase):

    def setUp(self):
        self.user   = make_user()
        self.tokens = self.get_tokens(self.user)

    def test_logout_blacklists_refresh_token(self):
        client = self.auth_client(self.user)
        response = client.post(
            '/api/auth/logout/',
            {'refresh': self.tokens['refresh']},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('detail', response.data)

        # Using the blacklisted refresh token must now fail
        r2 = self.client.post(
            '/api/auth/refresh/',
            {'refresh': self.tokens['refresh']},
            format='json',
        )
        self.assertEqual(r2.status_code, 401)

    def test_logout_requires_authentication(self):
        response = self.client.post(
            '/api/auth/logout/',
            {'refresh': self.tokens['refresh']},
            format='json',
        )
        self.assertEqual(response.status_code, 401)

    def test_logout_without_refresh_returns_400(self):
        client = self.auth_client(self.user)
        response = client.post('/api/auth/logout/', {}, format='json')
        self.assertEqual(response.status_code, 400)


class MeViewTests(TourismAPITestCase):

    def setUp(self):
        self.user = make_user(first_name='Alice', last_name='Smith')

    def test_me_returns_current_user(self):
        client = self.auth_client(self.user)
        response = client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'],   'testuser')
        self.assertEqual(response.data['first_name'], 'Alice')
        self.assertEqual(response.data['last_name'],  'Smith')

    def test_me_unauthenticated_returns_401(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 401)

    def test_me_put_updates_profile(self):
        client = self.auth_client(self.user)
        response = client.put(
            '/api/auth/me/',
            {'first_name': 'Bob', 'last_name': 'Jones', 'email': 'bob@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['first_name'], 'Bob')
        self.assertEqual(response.data['email'],      'bob@example.com')

    def test_me_put_cannot_change_username(self):
        """username is read-only; sending it must not change it."""
        client = self.auth_client(self.user)
        client.put('/api/auth/me/', {'username': 'hacker'}, format='json')
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'testuser')


class RegisterViewTests(TourismAPITestCase):

    def setUp(self):
        self.admin = make_admin()
        self.user  = make_user(username='regularuser')

    def _register_payload(self, username='newuser'):
        return {
            'username':   username,
            'email':      f'{username}@example.com',
            'password':   'NewUserPass123!',
            'password2':  'NewUserPass123!',
            'first_name': 'New',
            'last_name':  'User',
            'is_staff':   False,
        }

    def test_admin_can_create_user(self):
        client = self.auth_client(self.admin, password='AdminPass123!')
        response = client.post('/api/auth/register/',
                               self._register_payload(), format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_non_admin_cannot_register(self):
        client = self.auth_client(self.user)
        response = client.post('/api/auth/register/',
                               self._register_payload('anotheruser'), format='json')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_cannot_register(self):
        response = self.client.post('/api/auth/register/',
                                    self._register_payload('noauth'), format='json')
        self.assertEqual(response.status_code, 401)

    def test_mismatched_passwords_returns_400(self):
        client  = self.auth_client(self.admin, password='AdminPass123!')
        payload = self._register_payload()
        payload['password2'] = 'DifferentPassword!'
        response = client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_duplicate_username_returns_400(self):
        client = self.auth_client(self.admin, password='AdminPass123!')
        # First creation
        client.post('/api/auth/register/', self._register_payload('dupuser'), format='json')
        # Second creation with same username
        response = client.post('/api/auth/register/',
                               self._register_payload('dupuser'), format='json')
        self.assertEqual(response.status_code, 400)


class UserListViewTests(TourismAPITestCase):

    def setUp(self):
        self.admin = make_admin()
        self.user  = make_user(username='regularuser')

    def test_admin_can_list_users(self):
        client = self.auth_client(self.admin, password='AdminPass123!')
        response = client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

    def test_regular_user_cannot_list_users(self):
        client = self.auth_client(self.user)
        response = client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_cannot_list_users(self):
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, 401)
