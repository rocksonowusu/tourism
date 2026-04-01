import django_filters
from .models import (
    Event, TouristSite, EventMedia, TouristSiteMedia,
    Tour, TourMedia, TripRequest, CustomTourRequest,
)


class EventFilter(django_filters.FilterSet):
    """
    Filter parameters available on GET /api/events/:

    ?is_featured=true
    ?date_after=2026-01-01
    ?date_before=2026-12-31
    ?date=2026-06-15          (exact date — matches any time on that day)
    ?tourist_site=3           (FK id)
    ?status=upcoming|past|all (custom status filter)
    """

    # Date range
    date_after  = django_filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    date        = django_filters.DateFilter(field_name='date', lookup_expr='date')

    # Featured flag
    is_featured = django_filters.BooleanFilter(field_name='is_featured')

    # Related site
    tourist_site = django_filters.NumberFilter(field_name='tourist_site__id')

    class Meta:
        model  = Event
        fields = ['is_featured', 'tourist_site', 'date', 'date_after',
                  'date_before']


class TouristSiteFilter(django_filters.FilterSet):
    """
    Filter parameters available on GET /api/sites/:

    ?is_featured=true
    ?location=Paris          (case-insensitive contains)
    """

    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    location    = django_filters.CharFilter(field_name='location', lookup_expr='icontains')

    class Meta:
        model  = TouristSite
        fields = ['is_featured', 'location']


class EventMediaFilter(django_filters.FilterSet):
    """
    ?event=3
    ?media_type=image|video
    """

    media_type = django_filters.ChoiceFilter(
        field_name='media_type',
        choices=[('image', 'Image'), ('video', 'Video')],
    )

    class Meta:
        model  = EventMedia
        fields = ['event', 'media_type']


class TouristSiteMediaFilter(django_filters.FilterSet):
    """
    ?tourist_site=3
    ?media_type=image|video
    """

    media_type = django_filters.ChoiceFilter(
        field_name='media_type',
        choices=[('image', 'Image'), ('video', 'Video')],
    )

    class Meta:
        model  = TouristSiteMedia
        fields = ['tourist_site', 'media_type']


class TourFilter(django_filters.FilterSet):
    """
    Filter parameters available on GET /api/tours/:

    ?is_featured=true
    ?is_active=true
    ?location=Accra           (case-insensitive contains)
    """

    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    is_active   = django_filters.BooleanFilter(field_name='is_active')
    location    = django_filters.CharFilter(field_name='location', lookup_expr='icontains')

    class Meta:
        model  = Tour
        fields = ['is_featured', 'is_active', 'location']


class TourMediaFilter(django_filters.FilterSet):
    """
    ?tour=3
    ?media_type=image|video
    """

    media_type = django_filters.ChoiceFilter(
        field_name='media_type',
        choices=[('image', 'Image'), ('video', 'Video')],
    )

    class Meta:
        model  = TourMedia
        fields = ['tour', 'media_type']


class TripRequestFilter(django_filters.FilterSet):
    """
    Filter parameters available on GET /api/trip-requests/:

    ?status=new|contacted|confirmed|cancelled
    ?tour=3
    ?date_after=2026-01-01
    ?date_before=2026-12-31
    ?search=customer name/email
    """

    status      = django_filters.CharFilter(field_name='status')
    tour        = django_filters.NumberFilter(field_name='tour__id')
    date_after  = django_filters.DateFilter(field_name='preferred_date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='preferred_date', lookup_expr='lte')

    class Meta:
        model  = TripRequest
        fields = ['status', 'tour', 'date_after', 'date_before']


class CustomTourRequestFilter(django_filters.FilterSet):
    """
    Filter parameters available on GET /api/custom-tour-requests/:

    ?status=new|contacted|confirmed|cancelled
    ?date_after=2026-01-01
    ?date_before=2026-12-31
    ?search=customer name/email
    """

    status      = django_filters.CharFilter(field_name='status')
    date_after  = django_filters.DateFilter(field_name='preferred_start_date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='preferred_start_date', lookup_expr='lte')

    class Meta:
        model  = CustomTourRequest
        fields = ['status', 'date_after', 'date_before']
