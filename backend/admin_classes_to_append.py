# Admin classes for Public Site Images (Hero, Mosaic, Events Section)
# These are appended to admin.py

@admin.register(HeroBackground)
class HeroBackgroundAdmin(admin.ModelAdmin):
    """Admin for hero section background slideshow images."""
    
    list_display = ('title_or_order', 'image_thumbnail', 'is_active', 'order', 'created_at')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title',)
    readonly_fields = ('image_preview', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Image', {
            'fields': ('image', 'image_preview'),
        }),
        ('Details', {
            'fields': ('title', 'order', 'is_active'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def title_or_order(self, obj):
        return obj.title or f"Background #{obj.order + 1}"
    title_or_order.short_description = 'Title'
    
    def image_thumbnail(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" width="60" style="border-radius:4px;object-fit:cover;" />',
            obj.image.url
        )
    image_thumbnail.short_description = 'Preview'
    
    def image_preview(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:300px;border-radius:8px;" />',
            obj.image.url
        )
    image_preview.short_description = 'Full Preview'


@admin.register(HeroMosaic)
class HeroMosaicAdmin(admin.ModelAdmin):
    """Admin for hero mosaic panel images."""
    
    list_display = ('get_position_label', 'image_thumbnail', 'is_active', 'created_at')
    list_editable = ('is_active',)
    list_filter = ('is_active', 'position', 'created_at')
    search_fields = ('alt_text',)
    readonly_fields = ('image_preview', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Image', {
            'fields': ('image', 'image_preview'),
        }),
        ('Details', {
            'fields': ('position', 'alt_text', 'is_active'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def get_position_label(self, obj):
        return dict(obj._meta.get_field('position').choices).get(obj.position, obj.position)
    get_position_label.short_description = 'Position'
    
    def image_thumbnail(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" width="60" style="border-radius:4px;object-fit:cover;" />',
            obj.image.url
        )
    image_thumbnail.short_description = 'Preview'
    
    def image_preview(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:300px;border-radius:8px;" />',
            obj.image.url
        )
    image_preview.short_description = 'Full Preview'


@admin.register(EventsSectionBackground)
class EventsSectionBackgroundAdmin(admin.ModelAdmin):
    """Admin for events section background cycling images."""
    
    list_display = ('title_or_order', 'image_thumbnail', 'is_active', 'order', 'created_at')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title',)
    readonly_fields = ('image_preview', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Image', {
            'fields': ('image', 'image_preview'),
        }),
        ('Details', {
            'fields': ('title', 'order', 'is_active'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def title_or_order(self, obj):
        return obj.title or f"Background #{obj.order + 1}"
    title_or_order.short_description = 'Title'
    
    def image_thumbnail(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" width="60" style="border-radius:4px;object-fit:cover;" />',
            obj.image.url
        )
    image_thumbnail.short_description = 'Preview'
    
    def image_preview(self, obj):
        if not obj.image:
            return '—'
        return format_html(
            '<img src="{}" style="max-width:300px;border-radius:8px;" />',
            obj.image.url
        )
    image_preview.short_description = 'Full Preview'
