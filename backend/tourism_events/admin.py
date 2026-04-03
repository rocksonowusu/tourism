from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import (
    Event, TouristSite, EventMedia, TouristSiteMedia, MediaType,
    Tour, TourMedia, TripRequest, TripRequestStatus,
    CustomTourRequest, CustomTourRequestStatus,
    EventRequest, EventRequestStatus,
    EventBooking, EventBookingStatus,
    Apartment, ApartmentMedia,
    AccommodationRequest, AccommodationRequestStatus,
    Vehicle, VehicleMedia,
    CarRentalRequest, CarRentalRequestStatus,
    CommunityProject, CommunityProjectMedia,
    Review, ReviewServiceType,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _thumbnail(obj, width=80):
    """
    Return an <img> tag for images or a 🎬 badge for videos.
    Works for both EventMedia and TouristSiteMedia.
    """
    if not obj.file:
        return mark_safe('<span style="color:#aaa;">—</span>')

    try:
        url = obj.file.url
    except Exception:
        return mark_safe('<span style="color:#aaa;">—</span>')

    if obj.media_type == MediaType.VIDEO:
        return format_html(
            '<span style="font-size:24px;" title="{}">🎬</span>',
            obj.caption or 'Video',
        )

    return format_html(
        '<img src="{}" width="{}" style="border-radius:4px;object-fit:cover;" '
        'onerror="this.style.display=\'none\'" />',
        url,
        width,
    )


# ---------------------------------------------------------------------------
# Inline: EventMedia inside EventAdmin
# ---------------------------------------------------------------------------

class EventMediaInline(admin.TabularInline):
    model = EventMedia
    extra = 1
    fields = ('preview', 'file', 'media_type', 'caption', 'created_at')
    readonly_fields = ('preview', 'media_type', 'created_at')
    show_change_link = True

    def preview(self, obj):
        return _thumbnail(obj)
    preview.short_description = 'Preview'


# ---------------------------------------------------------------------------
# Inline: TouristSiteMedia inside TouristSiteAdmin
# ---------------------------------------------------------------------------

class TouristSiteMediaInline(admin.TabularInline):
    model = TouristSiteMedia
    extra = 1
    fields = ('preview', 'file', 'media_type', 'caption', 'created_at')
    readonly_fields = ('preview', 'media_type', 'created_at')
    show_change_link = True

    def preview(self, obj):
        return _thumbnail(obj)
    preview.short_description = 'Preview'


# ---------------------------------------------------------------------------
# EventAdmin
# ---------------------------------------------------------------------------

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    # ---- List view ----
    list_display = (
        'title',
        'location',
        'category',
        'date',
        'is_featured',
        'tourist_site',
        'media_count',
        'created_at',
    )
    list_display_links = ('title',)
    list_editable = ('is_featured',)
    list_filter = ('is_featured', 'category', 'tourist_site', 'date')
    list_per_page = 25

    # ---- Search ----
    search_fields = ('title', 'description', 'location', 'tourist_site__name')

    # ---- Ordering & hierarchy ----
    ordering = ('-created_at',)
    date_hierarchy = 'date'

    # ---- Detail view ----
    readonly_fields = ('created_at', 'updated_at')
    inlines = [EventMediaInline]
    fieldsets = (
        ('Event Details', {
            'fields': ('title', 'description', 'tourist_site'),
        }),
        ('Category & Activities', {
            'fields': ('category', 'activities', 'suitable_for'),
        }),
        ('Logistics', {
            'fields': ('location', 'date'),
        }),
        ('Visibility', {
            'fields': ('is_featured',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    # ---- Custom columns ----
    def media_count(self, obj):
        count = obj.media.count()
        colour = '#2e7d32' if count > 0 else '#aaa'
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            colour,
            count,
        )
    media_count.short_description = 'Media'
    media_count.admin_order_field = None   # can't order by annotation directly


# ---------------------------------------------------------------------------
# TouristSiteAdmin
# ---------------------------------------------------------------------------

@admin.register(TouristSite)
class TouristSiteAdmin(admin.ModelAdmin):
    # ---- List view ----
    list_display = (
        'name',
        'location',
        'is_featured',
        'event_count',
        'media_count',
        'created_at',
    )
    list_display_links = ('name',)
    list_editable = ('is_featured',)
    list_filter = ('is_featured',)
    list_per_page = 25

    # ---- Search ----
    search_fields = ('name', 'description', 'location')

    # ---- Ordering ----
    ordering = ('-created_at',)

    # ---- Detail view ----
    readonly_fields = ('created_at', 'updated_at')
    inlines = [TouristSiteMediaInline]
    fieldsets = (
        ('Site Details', {
            'fields': ('name', 'description', 'location'),
        }),
        ('Visibility', {
            'fields': ('is_featured',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    # ---- Custom columns ----
    def event_count(self, obj):
        count = obj.events.count()
        colour = '#1565c0' if count > 0 else '#aaa'
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            colour,
            count,
        )
    event_count.short_description = 'Events'

    def media_count(self, obj):
        count = obj.media.count()
        colour = '#2e7d32' if count > 0 else '#aaa'
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            colour,
            count,
        )
    media_count.short_description = 'Media'


# ---------------------------------------------------------------------------
# EventMediaAdmin (standalone)
# ---------------------------------------------------------------------------

@admin.register(EventMedia)
class EventMediaAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'event', 'media_type', 'caption', 'created_at')
    list_display_links = ('thumbnail', 'event')
    list_filter = ('media_type', 'event__is_featured')
    search_fields = ('event__title', 'caption')
    ordering = ('-created_at',)
    readonly_fields = ('thumbnail_large', 'media_type', 'created_at')
    fieldsets = (
        ('File', {
            'fields': ('file', 'thumbnail_large', 'media_type', 'caption'),
        }),
        ('Relation', {
            'fields': ('event',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )

    def thumbnail(self, obj):
        return _thumbnail(obj, width=60)
    thumbnail.short_description = 'Preview'

    def thumbnail_large(self, obj):
        return _thumbnail(obj, width=300)
    thumbnail_large.short_description = 'Preview'


# ---------------------------------------------------------------------------
# TouristSiteMediaAdmin (standalone)
# ---------------------------------------------------------------------------

@admin.register(TouristSiteMedia)
class TouristSiteMediaAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'tourist_site', 'media_type', 'caption', 'created_at')
    list_display_links = ('thumbnail', 'tourist_site')
    list_filter = ('media_type', 'tourist_site__is_featured')
    search_fields = ('tourist_site__name', 'caption')
    ordering = ('-created_at',)
    readonly_fields = ('thumbnail_large', 'media_type', 'created_at')
    fieldsets = (
        ('File', {
            'fields': ('file', 'thumbnail_large', 'media_type', 'caption'),
        }),
        ('Relation', {
            'fields': ('tourist_site',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )

    def thumbnail(self, obj):
        return _thumbnail(obj, width=60)
    thumbnail.short_description = 'Preview'

    def thumbnail_large(self, obj):
        return _thumbnail(obj, width=300)
    thumbnail_large.short_description = 'Preview'


# ---------------------------------------------------------------------------
# Inline: TourMedia inside TourAdmin
# ---------------------------------------------------------------------------

class TourMediaInline(admin.TabularInline):
    model = TourMedia
    extra = 1
    fields = ('preview', 'file', 'media_type', 'caption', 'created_at')
    readonly_fields = ('preview', 'media_type', 'created_at')
    show_change_link = True

    def preview(self, obj):
        return _thumbnail(obj)
    preview.short_description = 'Preview'


# ---------------------------------------------------------------------------
# TourAdmin
# ---------------------------------------------------------------------------

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'location',
        'duration',
        'is_active',
        'is_featured',
        'media_count',
        'created_at',
    )
    list_display_links = ('title',)
    list_editable = ('is_active', 'is_featured',)
    list_filter = ('is_active', 'is_featured',)
    list_per_page = 25
    search_fields = ('title', 'description', 'location')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [TourMediaInline]
    fieldsets = (
        ('Tour Details', {
            'fields': ('title', 'description', 'location', 'duration'),
        }),
        ('Settings', {
            'fields': ('max_group_size',),
        }),
        ('Content (JSON)', {
            'classes': ('collapse',),
            'fields': ('highlights', 'inclusions', 'exclusions', 'itinerary'),
        }),
        ('Visibility', {
            'fields': ('is_active', 'is_featured'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def media_count(self, obj):
        count = obj.media.count()
        colour = '#2e7d32' if count > 0 else '#aaa'
        return format_html(
            '<span style="color:{};font-weight:bold;">{}</span>',
            colour,
            count,
        )
    media_count.short_description = 'Media'


# ---------------------------------------------------------------------------
# TourMediaAdmin (standalone)
# ---------------------------------------------------------------------------

@admin.register(TourMedia)
class TourMediaAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'tour', 'media_type', 'caption', 'created_at')
    list_display_links = ('thumbnail', 'tour')
    list_filter = ('media_type', 'tour__is_featured')
    search_fields = ('tour__title', 'caption')
    ordering = ('-created_at',)
    readonly_fields = ('thumbnail_large', 'media_type', 'created_at')
    fieldsets = (
        ('File', {
            'fields': ('file', 'thumbnail_large', 'media_type', 'caption'),
        }),
        ('Relation', {
            'fields': ('tour',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )

    def thumbnail(self, obj):
        return _thumbnail(obj, width=60)
    thumbnail.short_description = 'Preview'

    def thumbnail_large(self, obj):
        return _thumbnail(obj, width=300)
    thumbnail_large.short_description = 'Preview'


# ---------------------------------------------------------------------------
# TripRequestAdmin
# ---------------------------------------------------------------------------

@admin.register(TripRequest)
class TripRequestAdmin(admin.ModelAdmin):
    list_display = (
        'customer_name',
        'tour',
        'preferred_date',
        'total_travellers_display',
        'status',
        'created_at',
    )
    list_display_links = ('customer_name',)
    list_editable = ('status',)
    list_filter = ('status', 'tour', 'preferred_date')
    list_per_page = 25
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'tour__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'total_travellers_display')
    fieldsets = (
        ('Customer', {
            'fields': ('customer_name', 'customer_email', 'customer_phone'),
        }),
        ('Trip Details', {
            'fields': ('tour', 'preferred_date', 'number_of_adults',
                       'number_of_children', 'number_of_infants',
                       'total_travellers_display'),
        }),
        ('Notes', {
            'fields': ('special_requests',),
        }),
        ('Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )

    def total_travellers_display(self, obj):
        return obj.total_travellers
    total_travellers_display.short_description = 'Total Travellers'


# ---------------------------------------------------------------------------
# CustomTourRequestAdmin
# ---------------------------------------------------------------------------

@admin.register(CustomTourRequest)
class CustomTourRequestAdmin(admin.ModelAdmin):
    list_display = (
        'customer_name',
        'site_list_display',
        'preferred_start_date',
        'total_travellers_display',
        'status',
        'created_at',
    )
    list_display_links = ('customer_name',)
    list_editable = ('status',)
    list_filter = ('status', 'preferred_start_date')
    list_per_page = 25
    search_fields = ('customer_name', 'customer_email', 'customer_phone')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'total_travellers_display', 'site_list_display', 'package_list_display')
    filter_horizontal = ('sites',)
    fieldsets = (
        ('Customer', {
            'fields': ('customer_name', 'customer_email', 'customer_phone', 'country'),
        }),
        ('Selected Sites', {
            'fields': ('sites', 'site_list_display'),
        }),
        ('Packages', {
            'fields': ('packages', 'package_list_display'),
        }),
        ('Trip Details', {
            'fields': ('preferred_start_date', 'preferred_end_date', 'flexibility',
                       'number_of_adults', 'number_of_children', 'number_of_infants',
                       'total_travellers_display'),
        }),
        ('Notes', {
            'fields': ('special_requests',),
        }),
        ('Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )

    def total_travellers_display(self, obj):
        return obj.total_travellers
    total_travellers_display.short_description = 'Total Travellers'

    def site_list_display(self, obj):
        names = obj.site_names
        if not names:
            return mark_safe('<span style="color:#aaa;">—</span>')
        return ', '.join(names)
    site_list_display.short_description = 'Selected Sites'

    def package_list_display(self, obj):
        labels = obj.package_labels
        if not labels:
            return mark_safe('<span style="color:#aaa;">—</span>')
        return ', '.join(labels)
    package_list_display.short_description = 'Selected Packages'


# ---------------------------------------------------------------------------
# EventRequestAdmin  (Phase 4)
# ---------------------------------------------------------------------------

@admin.register(EventRequest)
class EventRequestAdmin(admin.ModelAdmin):
    list_display = (
        'customer_name',
        'event_type',
        'preferred_date',
        'expected_attendees',
        'status',
        'created_at',
    )
    list_display_links = ('customer_name',)
    list_editable = ('status',)
    list_filter = ('status', 'event_type', 'preferred_date')
    list_per_page = 25
    search_fields = ('customer_name', 'customer_email', 'customer_phone')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Customer', {
            'fields': ('customer_name', 'customer_email', 'customer_phone'),
        }),
        ('Event Details', {
            'fields': ('event_type', 'preferred_date', 'expected_attendees',
                       'location_preference', 'budget_range'),
        }),
        ('Activities & Requirements', {
            'fields': ('activities_interested_in', 'special_requirements'),
        }),
        ('Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )


# ---------------------------------------------------------------------------
# EventBooking admin
# ---------------------------------------------------------------------------

@admin.register(EventBooking)
class EventBookingAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'event', 'number_of_guests', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'event__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    raw_id_fields = ('event',)
    fieldsets = (
        ('Customer', {
            'fields': ('customer_name', 'customer_email', 'customer_phone'),
        }),
        ('Booking Details', {
            'fields': ('event', 'number_of_guests', 'special_requests'),
        }),
        ('Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )


# ===========================================================================
# APARTMENTS / ACCOMMODATIONS
# ===========================================================================

class ApartmentMediaInline(admin.TabularInline):
    model = ApartmentMedia
    extra = 1
    fields = ('preview', 'file', 'media_type', 'caption', 'created_at')
    readonly_fields = ('preview', 'created_at')
    show_change_link = True

    @admin.display(description='Preview')
    def preview(self, obj):
        if obj.file:
            url = obj.file.url if hasattr(obj.file, 'url') else obj.file
            if obj.media_type == MediaType.VIDEO:
                return format_html('<video src="{}" width="120" controls></video>', url)
            return format_html('<img src="{}" width="120" style="border-radius:4px" />', url)
        return '-'


@admin.register(Apartment)
class ApartmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'location', 'bedrooms', 'price_per_night', 'is_available', 'is_featured', 'media_count')
    list_filter = ('property_type', 'is_available', 'is_featured', 'location')
    search_fields = ('title', 'location', 'address', 'description')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ApartmentMediaInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'description'),
        }),
        ('Location', {
            'fields': ('location', 'address', 'latitude', 'longitude'),
        }),
        ('Property Details', {
            'fields': ('property_type', 'bedrooms', 'bathrooms', 'max_guests'),
        }),
        ('Pricing', {
            'fields': ('price_per_night',),
        }),
        ('Amenities & Rules', {
            'fields': ('amenities', 'rules'),
        }),
        ('Visibility', {
            'fields': ('is_available', 'is_featured'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    @admin.display(description='Media')
    def media_count(self, obj):
        return obj.media_count


@admin.register(ApartmentMedia)
class ApartmentMediaAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'apartment', 'media_type', 'caption', 'created_at')
    list_filter = ('media_type', 'created_at')
    search_fields = ('caption', 'apartment__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    raw_id_fields = ('apartment',)

    @admin.display(description='Preview')
    def thumbnail(self, obj):
        if obj.file:
            url = obj.file.url if hasattr(obj.file, 'url') else obj.file
            if obj.media_type == MediaType.VIDEO:
                return format_html('<video src="{}" width="80" controls></video>', url)
            return format_html('<img src="{}" width="80" style="border-radius:4px" />', url)
        return '-'


# ---------------------------------------------------------------------------

@admin.register(AccommodationRequest)
class AccommodationRequestAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'apartment', 'check_in_date', 'check_out_date', 'number_of_guests', 'status', 'created_at')
    list_filter = ('status', 'purpose', 'created_at')
    list_editable = ('status',)
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'apartment__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    raw_id_fields = ('apartment',)
    fieldsets = (
        ('Customer', {
            'fields': ('customer_name', 'customer_email', 'customer_phone'),
        }),
        ('Accommodation Details', {
            'fields': ('apartment', 'check_in_date', 'check_out_date', 'number_of_guests', 'purpose', 'message'),
        }),
        ('Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )


# ===========================================================================
# VEHICLES / CAR RENTALS
# ===========================================================================

class VehicleMediaInline(admin.TabularInline):
    model = VehicleMedia
    extra = 1
    fields = ('preview', 'file', 'media_type', 'caption', 'created_at')
    readonly_fields = ('preview', 'created_at')
    show_change_link = True

    @admin.display(description='Preview')
    def preview(self, obj):
        if obj.file:
            url = obj.file.url if hasattr(obj.file, 'url') else obj.file
            if obj.media_type == MediaType.VIDEO:
                return format_html('<video src="{}" width="120" controls></video>', url)
            return format_html('<img src="{}" width="120" style="border-radius:4px" />', url)
        return '-'


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('name', 'vehicle_type', 'brand', 'model_year', 'seats', 'price_per_day', 'is_available', 'is_featured', 'media_count')
    list_filter = ('vehicle_type', 'transmission', 'fuel_type', 'is_available', 'is_featured')
    search_fields = ('name', 'brand', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [VehicleMediaInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description'),
        }),
        ('Vehicle Details', {
            'fields': ('vehicle_type', 'brand', 'model_year', 'seats', 'transmission', 'fuel_type'),
        }),
        ('Pricing', {
            'fields': ('price_per_day',),
        }),
        ('Features', {
            'fields': ('features',),
        }),
        ('Visibility', {
            'fields': ('is_available', 'is_featured'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    @admin.display(description='Media')
    def media_count(self, obj):
        return obj.media_count


@admin.register(VehicleMedia)
class VehicleMediaAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'vehicle', 'media_type', 'caption', 'created_at')
    list_filter = ('media_type', 'created_at')
    search_fields = ('caption', 'vehicle__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    raw_id_fields = ('vehicle',)

    @admin.display(description='Preview')
    def thumbnail(self, obj):
        if obj.file:
            url = obj.file.url if hasattr(obj.file, 'url') else obj.file
            if obj.media_type == MediaType.VIDEO:
                return format_html('<video src="{}" width="80" controls></video>', url)
            return format_html('<img src="{}" width="80" style="border-radius:4px" />', url)
        return '-'


# ---------------------------------------------------------------------------

@admin.register(CarRentalRequest)
class CarRentalRequestAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'vehicle', 'pickup_date', 'return_date', 'with_driver', 'status', 'created_at')
    list_filter = ('status', 'with_driver', 'created_at')
    list_editable = ('status',)
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'vehicle__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    raw_id_fields = ('vehicle',)
    fieldsets = (
        ('Customer', {
            'fields': ('customer_name', 'customer_email', 'customer_phone'),
        }),
        ('Rental Details', {
            'fields': ('vehicle', 'pickup_date', 'return_date', 'pickup_location', 'return_location', 'with_driver', 'purpose', 'message'),
        }),
        ('Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )


# ============================================================================
#  PHASE 5 — Community Project Admin
# ============================================================================

class CommunityProjectMediaInline(admin.TabularInline):
    model = CommunityProjectMedia
    extra = 0
    readonly_fields = ('thumbnail', 'media_type', 'created_at')
    fields = ('thumbnail', 'file', 'media_type', 'caption', 'created_at')

    @admin.display(description='Preview')
    def thumbnail(self, obj):
        return _thumbnail(obj)


@admin.register(CommunityProject)
class CommunityProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'date', 'beneficiaries_count', 'is_featured', 'media_count', 'created_at')
    list_filter = ('is_featured', 'date', 'created_at')
    list_editable = ('is_featured',)
    search_fields = ('title', 'description', 'location')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-date', '-created_at')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CommunityProjectMediaInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'description'),
        }),
        ('Details', {
            'fields': ('location', 'date', 'impact_summary', 'beneficiaries_count'),
        }),
        ('Visibility', {
            'fields': ('is_featured',),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    @admin.display(description='Media')
    def media_count(self, obj):
        return obj.media_count


@admin.register(CommunityProjectMedia)
class CommunityProjectMediaAdmin(admin.ModelAdmin):
    list_display = ('thumbnail', 'community_project', 'media_type', 'caption', 'created_at')
    list_filter = ('media_type', 'created_at')
    search_fields = ('caption', 'community_project__title')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    raw_id_fields = ('community_project',)

    @admin.display(description='Preview')
    def thumbnail(self, obj):
        if obj.file:
            url = obj.file.url if hasattr(obj.file, 'url') else obj.file
            if obj.media_type == MediaType.VIDEO:
                return format_html('<video src="{}" width="80" controls></video>', url)
            return format_html('<img src="{}" width="80" style="border-radius:4px" />', url)
        return '-'


# ============================================================================
#  PHASE 7 — Review Admin
# ============================================================================

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer_name', 'title', 'rating', 'service_type', 'is_approved', 'is_featured', 'created_at')
    list_filter = ('is_approved', 'is_featured', 'service_type', 'rating', 'created_at')
    list_editable = ('is_approved', 'is_featured')
    search_fields = ('reviewer_name', 'reviewer_email', 'title', 'comment')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Reviewer', {
            'fields': ('reviewer_name', 'reviewer_email', 'reviewer_photo'),
        }),
        ('Review', {
            'fields': ('rating', 'title', 'comment', 'service_type'),
        }),
        ('Moderation', {
            'fields': ('is_approved', 'is_featured'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at',),
        }),
    )
