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
    EventRequestViewSet,
    EventBookingViewSet,
    ApartmentViewSet,
    ApartmentMediaViewSet,
    AccommodationRequestViewSet,
    VehicleViewSet,
    VehicleMediaViewSet,
    CarRentalRequestViewSet,
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
router.register(r'event-requests', EventRequestViewSet, basename='eventrequest')
router.register(r'event-bookings', EventBookingViewSet, basename='eventbooking')
router.register(r'apartments', ApartmentViewSet, basename='apartment')
router.register(r'apartment-media', ApartmentMediaViewSet, basename='apartmentmedia')
router.register(r'accommodation-requests', AccommodationRequestViewSet, basename='accommodationrequest')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'vehicle-media', VehicleMediaViewSet, basename='vehiclemedia')
router.register(r'car-rental-requests', CarRentalRequestViewSet, basename='carrentalrequest')

urlpatterns = [
    path('', include(router.urls)),
]
