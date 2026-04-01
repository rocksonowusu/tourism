from rest_framework import serializers
from .models import (
    Event, TouristSite, EventMedia, TouristSiteMedia,
    Tour, TourMedia, TripRequest, CustomTourRequest, PackageChoice,
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
