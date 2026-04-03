from rest_framework import serializers
from .models import (
    Event, TouristSite, EventMedia, TouristSiteMedia,
    Tour, TourMedia, TripRequest, CustomTourRequest, PackageChoice,
    EventRequest, EventRequestType,
    EventBooking,
    Apartment, ApartmentMedia, AccommodationRequest, AccommodationPurpose,
    Vehicle, VehicleMedia, CarRentalRequest,
    CommunityProject, CommunityProjectMedia,
    Review,
)


# ---------------------------------------------------------------------------
# Media serializers
# ---------------------------------------------------------------------------

class EventMediaSerializer(serializers.ModelSerializer):
    file_url   = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)   # auto-set by model

    class Meta:
        model  = EventMedia
        fields = (
            'id', 'event', 'file', 'file_url',
            'media_type', 'caption', 'created_at',
        )
        read_only_fields = ('id', 'media_type', 'file_url', 'created_at')

    def get_file_url(self, obj):
        return obj.file_url


class TouristSiteMediaSerializer(serializers.ModelSerializer):
    file_url   = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)

    class Meta:
        model  = TouristSiteMedia
        fields = (
            'id', 'tourist_site', 'file', 'file_url',
            'media_type', 'caption', 'created_at',
        )
        read_only_fields = ('id', 'media_type', 'file_url', 'created_at')

    def get_file_url(self, obj):
        return obj.file_url


# ---------------------------------------------------------------------------
# TouristSite serializers
# ---------------------------------------------------------------------------

class TouristSiteMinimalSerializer(serializers.ModelSerializer):
    """Lightweight — embedded inside EventSerializer."""

    class Meta:
        model  = TouristSite
        fields = ('id', 'name', 'slug', 'location')


class TouristSiteSerializer(serializers.ModelSerializer):
    media                 = TouristSiteMediaSerializer(many=True, read_only=True)
    media_count           = serializers.IntegerField(read_only=True)
    upcoming_events_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = TouristSite
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'location',
            'is_featured',
            'media_count',
            'upcoming_events_count',
            'media',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'media_count', 'upcoming_events_count',
                            'created_at', 'updated_at')


# ---------------------------------------------------------------------------
# Event serializers
# ---------------------------------------------------------------------------

class EventSerializer(serializers.ModelSerializer):
    media        = EventMediaSerializer(many=True, read_only=True)
    tourist_site = TouristSiteMinimalSerializer(read_only=True)
    tourist_site_id = serializers.PrimaryKeyRelatedField(
        queryset=TouristSite.objects.all(),
        source='tourist_site',
        write_only=True,
        required=False,
        allow_null=True,
    )
    date = serializers.DateTimeField(required=False, allow_null=True)
    # Computed / read-only fields from model properties
    is_past       = serializers.BooleanField(read_only=True)
    is_upcoming   = serializers.BooleanField(read_only=True)
    media_count   = serializers.IntegerField(read_only=True)
    season_label  = serializers.CharField(read_only=True)

    class Meta:
        model  = Event
        fields = (
            'id',
            'title',
            'slug',
            'description',
            'location',
            'latitude',
            'longitude',
            'date',
            'is_featured',
            'highlights',
            'category',
            'activities',
            'suitable_for',
            'is_past',
            'is_upcoming',
            'season_label',
            'tourist_site',
            'tourist_site_id',
            'media_count',
            'media',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'is_past', 'is_upcoming', 'season_label',
                            'media_count', 'created_at', 'updated_at')


class EventListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list endpoints — omits nested media
    to keep list responses fast. Clients fetch full media via detail URL.
    """
    tourist_site = TouristSiteMinimalSerializer(read_only=True)
    is_past      = serializers.BooleanField(read_only=True)
    is_upcoming  = serializers.BooleanField(read_only=True)
    media_count  = serializers.IntegerField(read_only=True)
    season_label = serializers.CharField(read_only=True)

    class Meta:
        model  = Event
        fields = (
            'id',
            'title',
            'slug',
            'location',
            'latitude',
            'longitude',
            'date',
            'is_featured',
            'highlights',
            'category',
            'activities',
            'suitable_for',
            'is_past',
            'is_upcoming',
            'season_label',
            'tourist_site',
            'media_count',
            'created_at',
        )
        read_only_fields = fields


class TouristSiteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for TouristSite list endpoints."""
    media_count           = serializers.IntegerField(read_only=True)
    upcoming_events_count = serializers.IntegerField(read_only=True)
    media                 = TouristSiteMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = TouristSite
        fields = (
            'id',
            'name',
            'slug',
            'location',
            'is_featured',
            'media_count',
            'upcoming_events_count',
            'media',
            'created_at',
        )
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Tour media serializer
# ---------------------------------------------------------------------------

class TourMediaSerializer(serializers.ModelSerializer):
    file_url   = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)

    class Meta:
        model  = TourMedia
        fields = (
            'id', 'tour', 'file', 'file_url',
            'media_type', 'caption', 'created_at',
        )
        read_only_fields = ('id', 'media_type', 'file_url', 'created_at')

    def get_file_url(self, obj):
        return obj.file_url


# ---------------------------------------------------------------------------
# Tour serializers
# ---------------------------------------------------------------------------

class TourSerializer(serializers.ModelSerializer):
    """Full serializer for detail / create / update."""
    media       = TourMediaSerializer(many=True, read_only=True)
    media_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Tour
        fields = (
            'id',
            'title',
            'slug',
            'description',
            'location',
            'duration',
            'highlights',
            'inclusions',
            'exclusions',
            'itinerary',
            'max_group_size',
            'is_active',
            'is_featured',
            'media_count',
            'media',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'media_count', 'created_at', 'updated_at')


class TourListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints — omits nested media."""
    media_count = serializers.IntegerField(read_only=True)
    media       = TourMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = Tour
        fields = (
            'id',
            'title',
            'slug',
            'location',
            'duration',
            'is_active',
            'is_featured',
            'media_count',
            'media',
            'created_at',
        )
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Trip Request serializer
# ---------------------------------------------------------------------------

class TripRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for trip requests.
    - Public users POST with tour id + customer details.
    - Admin users can PATCH status.
    """
    tour_title       = serializers.CharField(source='tour.title', read_only=True)
    tour_location    = serializers.CharField(source='tour.location', read_only=True)
    total_travellers = serializers.IntegerField(read_only=True)

    class Meta:
        model  = TripRequest
        fields = (
            'id',
            'tour',
            'tour_title',
            'tour_location',
            'customer_name',
            'customer_email',
            'customer_phone',
            'number_of_adults',
            'number_of_children',
            'number_of_infants',
            'preferred_date',
            'special_requests',
            'status',
            'total_travellers',
            'created_at',
        )
        read_only_fields = (
            'id', 'tour_title', 'tour_location',
            'total_travellers', 'created_at',
        )

    def validate_number_of_adults(self, value):
        if value < 1:
            raise serializers.ValidationError('At least 1 adult is required.')
        return value

    def validate(self, attrs):
        # On create, ensure tour is active
        tour = attrs.get('tour')
        if tour and self.instance is None and not tour.is_active:
            raise serializers.ValidationError(
                {'tour': 'This tour is not currently available for booking.'}
            )
        return attrs


# ---------------------------------------------------------------------------
# Custom Tour Request serializer
# ---------------------------------------------------------------------------

class CustomTourRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for customer-planned custom tour requests.
    - Public users POST with site ids, packages, traveller details, contact info.
    - Admin users can PATCH status.
    """
    site_ids         = serializers.PrimaryKeyRelatedField(
        queryset=TouristSite.objects.all(),
        many=True,
        write_only=True,
        source='sites',
    )
    sites            = TouristSiteMinimalSerializer(many=True, read_only=True)
    site_names       = serializers.ListField(read_only=True)
    package_labels   = serializers.ListField(read_only=True)
    total_travellers = serializers.IntegerField(read_only=True)

    class Meta:
        model  = CustomTourRequest
        fields = (
            'id',
            'site_ids',
            'sites',
            'site_names',
            'packages',
            'package_labels',
            'number_of_adults',
            'number_of_children',
            'number_of_infants',
            'total_travellers',
            'preferred_start_date',
            'preferred_end_date',
            'flexibility',
            'customer_name',
            'customer_email',
            'customer_phone',
            'country',
            'special_requests',
            'status',
            'created_at',
        )
        read_only_fields = (
            'id', 'sites', 'site_names', 'package_labels',
            'total_travellers', 'created_at',
        )

    def validate_number_of_adults(self, value):
        if value < 1:
            raise serializers.ValidationError('At least 1 adult is required.')
        return value

    def validate_packages(self, value):
        valid_keys = {c[0] for c in PackageChoice.choices}
        for pkg in value:
            if pkg not in valid_keys:
                raise serializers.ValidationError(
                    f'Invalid package key: {pkg}. '
                    f'Valid options: {", ".join(sorted(valid_keys))}'
                )
        return value

    def validate(self, attrs):
        sites = attrs.get('sites', [])
        if self.instance is None and not sites:
            raise serializers.ValidationError(
                {'site_ids': 'Please select at least one site to visit.'}
            )
        return attrs


# ---------------------------------------------------------------------------
# Event Request serializer  (Phase 4)
# ---------------------------------------------------------------------------

class EventRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for custom event requests.
    - Public users POST with event type + customer details.
    - Admin users can PATCH status.
    """
    event_type_display = serializers.CharField(
        source='get_event_type_display', read_only=True)

    class Meta:
        model  = EventRequest
        fields = (
            'id',
            'event_type',
            'event_type_display',
            'customer_name',
            'customer_email',
            'customer_phone',
            'preferred_date',
            'expected_attendees',
            'location_preference',
            'budget_range',
            'activities_interested_in',
            'special_requirements',
            'status',
            'created_at',
        )
        read_only_fields = (
            'id', 'event_type_display', 'created_at',
        )

    def validate_expected_attendees(self, value):
        if value < 1:
            raise serializers.ValidationError('At least 1 attendee is required.')
        return value

    def validate_event_type(self, value):
        valid_keys = {c[0] for c in EventRequestType.choices}
        if value not in valid_keys:
            raise serializers.ValidationError(
                f'Invalid event type: {value}. '
                f'Valid options: {", ".join(sorted(valid_keys))}'
            )
        return value


# ---------------------------------------------------------------------------
# Event Booking serializer  (quick booking from event detail page)
# ---------------------------------------------------------------------------

class EventBookingSerializer(serializers.ModelSerializer):
    """
    Serializer for event bookings submitted from the event detail page.
    - Public users POST with event id + customer details.
    - Admin users can PATCH status.
    """
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model  = EventBooking
        fields = (
            'id',
            'event',
            'event_title',
            'customer_name',
            'customer_email',
            'customer_phone',
            'number_of_guests',
            'special_requests',
            'status',
            'created_at',
        )
        read_only_fields = ('id', 'event_title', 'created_at')

    def validate_number_of_guests(self, value):
        if value < 1:
            raise serializers.ValidationError('At least 1 guest is required.')
        return value


# ---------------------------------------------------------------------------
# Apartment media serializer  (Phase 3)
# ---------------------------------------------------------------------------

class ApartmentMediaSerializer(serializers.ModelSerializer):
    file_url   = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)

    class Meta:
        model  = ApartmentMedia
        fields = (
            'id', 'apartment', 'file', 'file_url',
            'media_type', 'caption', 'created_at',
        )
        read_only_fields = ('id', 'media_type', 'file_url', 'created_at')

    def get_file_url(self, obj):
        return obj.file_url


# ---------------------------------------------------------------------------
# Apartment serializers  (Phase 3)
# ---------------------------------------------------------------------------

class ApartmentSerializer(serializers.ModelSerializer):
    """Full serializer for detail / create / update."""
    media       = ApartmentMediaSerializer(many=True, read_only=True)
    media_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Apartment
        fields = (
            'id',
            'title',
            'slug',
            'description',
            'location',
            'address',
            'latitude',
            'longitude',
            'property_type',
            'bedrooms',
            'bathrooms',
            'max_guests',
            'price_per_night',
            'amenities',
            'rules',
            'is_available',
            'is_featured',
            'media_count',
            'media',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'media_count', 'created_at', 'updated_at')


class ApartmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""
    media_count = serializers.IntegerField(read_only=True)
    media       = ApartmentMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = Apartment
        fields = (
            'id',
            'title',
            'slug',
            'location',
            'property_type',
            'bedrooms',
            'bathrooms',
            'max_guests',
            'price_per_night',
            'is_available',
            'is_featured',
            'media_count',
            'media',
            'created_at',
        )
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Accommodation Request serializer  (Phase 3)
# ---------------------------------------------------------------------------

class AccommodationRequestSerializer(serializers.ModelSerializer):
    apartment_title = serializers.CharField(
        source='apartment.title', read_only=True, default=None)
    purpose_display = serializers.CharField(
        source='get_purpose_display', read_only=True)

    class Meta:
        model  = AccommodationRequest
        fields = (
            'id',
            'apartment',
            'apartment_title',
            'customer_name',
            'customer_email',
            'customer_phone',
            'check_in_date',
            'check_out_date',
            'number_of_guests',
            'purpose',
            'purpose_display',
            'message',
            'status',
            'created_at',
        )
        read_only_fields = ('id', 'apartment_title', 'purpose_display', 'created_at')

    def validate_number_of_guests(self, value):
        if value < 1:
            raise serializers.ValidationError('At least 1 guest is required.')
        return value


# ---------------------------------------------------------------------------
# Vehicle media serializer  (Phase 6)
# ---------------------------------------------------------------------------

class VehicleMediaSerializer(serializers.ModelSerializer):
    file_url   = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)

    class Meta:
        model  = VehicleMedia
        fields = (
            'id', 'vehicle', 'file', 'file_url',
            'media_type', 'caption', 'created_at',
        )
        read_only_fields = ('id', 'media_type', 'file_url', 'created_at')

    def get_file_url(self, obj):
        return obj.file_url


# ---------------------------------------------------------------------------
# Vehicle serializers  (Phase 6)
# ---------------------------------------------------------------------------

class VehicleSerializer(serializers.ModelSerializer):
    """Full serializer for detail / create / update."""
    media       = VehicleMediaSerializer(many=True, read_only=True)
    media_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Vehicle
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'vehicle_type',
            'brand',
            'model_year',
            'seats',
            'transmission',
            'fuel_type',
            'price_per_day',
            'features',
            'is_available',
            'is_featured',
            'media_count',
            'media',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'slug', 'media_count', 'created_at', 'updated_at')


class VehicleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""
    media_count = serializers.IntegerField(read_only=True)
    media       = VehicleMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = Vehicle
        fields = (
            'id',
            'name',
            'slug',
            'vehicle_type',
            'brand',
            'seats',
            'transmission',
            'price_per_day',
            'is_available',
            'is_featured',
            'media_count',
            'media',
            'created_at',
        )
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Car Rental Request serializer  (Phase 6)
# ---------------------------------------------------------------------------

class CarRentalRequestSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.CharField(
        source='vehicle.name', read_only=True, default=None)

    class Meta:
        model  = CarRentalRequest
        fields = (
            'id',
            'vehicle',
            'vehicle_name',
            'customer_name',
            'customer_email',
            'customer_phone',
            'pickup_date',
            'return_date',
            'pickup_location',
            'return_location',
            'with_driver',
            'purpose',
            'message',
            'status',
            'created_at',
        )
        read_only_fields = ('id', 'vehicle_name', 'created_at')


# ============================================================================
#  PHASE 5 — Community Project serializers
# ============================================================================

class CommunityProjectMediaSerializer(serializers.ModelSerializer):
    file_url   = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)

    class Meta:
        model  = CommunityProjectMedia
        fields = (
            'id', 'community_project', 'file', 'file_url',
            'media_type', 'caption', 'created_at',
        )
        read_only_fields = ('id', 'media_type', 'file_url', 'created_at')

    def get_file_url(self, obj):
        return obj.file_url


class CommunityProjectSerializer(serializers.ModelSerializer):
    """Full detail serializer with nested media."""
    media       = CommunityProjectMediaSerializer(many=True, read_only=True)
    media_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = CommunityProject
        fields = (
            'id', 'title', 'slug', 'description', 'location',
            'date', 'impact_summary', 'beneficiaries_count',
            'is_featured', 'media_count', 'media',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'slug', 'media_count', 'created_at', 'updated_at')


class CommunityProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""
    media_count = serializers.IntegerField(read_only=True)
    media       = CommunityProjectMediaSerializer(many=True, read_only=True)

    class Meta:
        model  = CommunityProject
        fields = (
            'id', 'title', 'slug', 'location', 'date',
            'impact_summary', 'beneficiaries_count',
            'is_featured', 'media_count', 'media',
            'created_at',
        )
        read_only_fields = fields


# ============================================================================
#  PHASE 7 — Review serializer
# ============================================================================

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_photo_url = serializers.SerializerMethodField()

    class Meta:
        model  = Review
        fields = (
            'id', 'reviewer_name', 'reviewer_email',
            'reviewer_photo', 'reviewer_photo_url',
            'rating', 'title', 'comment',
            'service_type', 'is_approved', 'is_featured',
            'created_at',
        )
        read_only_fields = ('id', 'reviewer_photo_url', 'created_at')

    def get_reviewer_photo_url(self, obj):
        if obj.reviewer_photo:
            url = obj.reviewer_photo.url if hasattr(obj.reviewer_photo, 'url') else str(obj.reviewer_photo)
            if url.startswith('http'):
                return url
            return f'https://res.cloudinary.com/{url}'
        return None
