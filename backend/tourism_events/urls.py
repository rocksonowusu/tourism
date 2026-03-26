from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    TouristSiteViewSet,
    EventMediaViewSet,
    TouristSiteMediaViewSet,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'sites', TouristSiteViewSet, basename='touristsite')
router.register(r'event-media', EventMediaViewSet, basename='eventmedia')
router.register(r'site-media', TouristSiteMediaViewSet, basename='touristsitemedia')

urlpatterns = [
    path('', include(router.urls)),
]
