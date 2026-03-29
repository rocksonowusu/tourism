from rest_framework import serializers
from .models import Event, TouristSite, EventMedia, TouristSiteMedia


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
            'price',
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
            'price',
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
