"""
URL configuration for tourism_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import LoginView, LogoutView, MeView, RegisterView, UserListView

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Auth endpoints ──────────────────────────────────────────────────
    path('api/auth/login/',    LoginView.as_view(),    name='auth-login'),
    path('api/auth/refresh/',  TokenRefreshView.as_view(), name='auth-refresh'),
    path('api/auth/logout/',   LogoutView.as_view(),   name='auth-logout'),
    path('api/auth/me/',       MeView.as_view(),       name='auth-me'),
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/users/',    UserListView.as_view(), name='auth-users'),

    # Tourism events API
    path('api/', include('tourism_events.urls')),

    # Health check
    path('health/', include('app_health_check.urls')),
]

# Serve media files locally during development
# In production, Cloudinary handles all media delivery
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
