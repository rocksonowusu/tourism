from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    TouristSiteViewSet,
    EventMediaViewSet,
    TouristSiteMediaViewSet,
    TourViewSet,
    TourMediaViewSet,
    TripRequestViewSet,
    CustomTourRequestViewSet,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'sites', TouristSiteViewSet, basename='touristsite')
router.register(r'event-media', EventMediaViewSet, basename='eventmedia')
router.register(r'site-media', TouristSiteMediaViewSet, basename='touristsitemedia')
router.register(r'tours', TourViewSet, basename='tour')
router.register(r'tour-media', TourMediaViewSet, basename='tourmedia')
router.register(r'trip-requests', TripRequestViewSet, basename='triprequest')
router.register(r'custom-tour-requests', CustomTourRequestViewSet, basename='customtourrequest')

urlpatterns = [
    path('', include(router.urls)),
]
