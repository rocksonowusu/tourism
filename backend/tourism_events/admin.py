from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from .models import Event, TouristSite, EventMedia, TouristSiteMedia, MediaType


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
        'date',
        'price',
        'is_featured',
        'tourist_site',
        'media_count',
        'created_at',
    )
    list_display_links = ('title',)
    list_editable = ('is_featured',)
    list_filter = ('is_featured', 'tourist_site', 'date')
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
        ('Logistics', {
            'fields': ('location', 'date', 'price'),
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
