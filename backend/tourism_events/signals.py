"""
Automatic admin notification creation via Django signals.

When a public user submits a review, trip request, event booking, etc.
a Notification row is created so admins see it in the top-bar bell.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import (
    Notification, NotificationType,
    Review,
    TripRequest,
    CustomTourRequest,
    EventRequest,
    EventBooking,
    AccommodationRequest,
    CarRentalRequest,
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _create(ntype, title, message='', link=''):
    Notification.objects.create(
        notification_type=ntype,
        title=title,
        message=message,
        link=link,
    )


# ---------------------------------------------------------------------------
# Signal receivers (only fire on creation, not every save)
# ---------------------------------------------------------------------------

@receiver(post_save, sender=Review)
def notify_new_review(sender, instance, created, **kwargs):
    if not created:
        return
    _create(
        NotificationType.REVIEW,
        f'New review from {instance.reviewer_name}',
        f'{instance.rating}★ — {instance.title}',
        '/admin/reviews',
    )


@receiver(post_save, sender=TripRequest)
def notify_new_trip_request(sender, instance, created, **kwargs):
    if not created:
        return
    tour_name = instance.tour.title if instance.tour else 'a tour'
    _create(
        NotificationType.TRIP_REQUEST,
        f'New trip request from {instance.customer_name}',
        f'Requested {tour_name}',
        '/admin/tours',
    )


@receiver(post_save, sender=CustomTourRequest)
def notify_new_custom_tour_request(sender, instance, created, **kwargs):
    if not created:
        return
    _create(
        NotificationType.CUSTOM_TOUR_REQUEST,
        f'Custom tour request from {instance.customer_name}',
        f'{instance.total_travellers} travellers',
        '/admin/tours',
    )


@receiver(post_save, sender=EventRequest)
def notify_new_event_request(sender, instance, created, **kwargs):
    if not created:
        return
    _create(
        NotificationType.EVENT_REQUEST,
        f'Event request from {instance.customer_name}',
        f'{instance.get_event_type_display()} event',
        '/admin/events',
    )


@receiver(post_save, sender=EventBooking)
def notify_new_event_booking(sender, instance, created, **kwargs):
    if not created:
        return
    _create(
        NotificationType.EVENT_BOOKING,
        f'Event booking from {instance.customer_name}',
        f'{instance.event.title} — {instance.number_of_guests} guests',
        '/admin/events',
    )


@receiver(post_save, sender=AccommodationRequest)
def notify_new_accommodation_request(sender, instance, created, **kwargs):
    if not created:
        return
    apt_name = instance.apartment.title if instance.apartment else 'an accommodation'
    _create(
        NotificationType.ACCOMMODATION_REQ,
        f'Accommodation request from {instance.customer_name}',
        f'Requested {apt_name}',
        '/admin/apartments',
    )


@receiver(post_save, sender=CarRentalRequest)
def notify_new_car_rental_request(sender, instance, created, **kwargs):
    if not created:
        return
    veh_name = instance.vehicle.name if instance.vehicle else 'a vehicle'
    _create(
        NotificationType.CAR_RENTAL_REQ,
        f'Car rental request from {instance.customer_name}',
        f'Requested {veh_name}',
        '/admin/vehicles',
    )
