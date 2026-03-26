from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from cloudinary.models import CloudinaryField

from .validators import (
    validate_media_file_type,
    validate_media_file_size,
    detect_media_type,
)


# ---------------------------------------------------------------------------
# Custom Managers
# ---------------------------------------------------------------------------

class UpcomingEventManager(models.Manager):
    """Returns only events whose date is in the future."""

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(date__gte=timezone.now())
            .order_by('date')
        )


class PastEventManager(models.Manager):
    """Returns only events whose date has already passed."""

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(date__lt=timezone.now())
            .order_by('-date')
        )


# ---------------------------------------------------------------------------
# Core models
# ---------------------------------------------------------------------------

class TouristSite(models.Model):
    """A physical tourist attraction or landmark."""

    name        = models.CharField(max_length=255)
    slug        = models.SlugField(
                      max_length=255, unique=True, blank=True,
                      help_text='SEO-friendly URL identifier. Auto-generated from name.')
    description = models.TextField()
    location    = models.CharField(max_length=255)
    is_featured = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Tourist Site'
        verbose_name_plural = 'Tourist Sites'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)

    def _unique_slug(self) -> str:
        base = slugify(self.name)
        slug, n = base, 1
        while TouristSite.objects.filter(slug=slug).exclude(pk=self.pk or 0).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    @property
    def media_count(self) -> int:
        """Total number of media files attached to this site."""
        return self.media.count()

    @property
    def upcoming_events_count(self) -> int:
        """How many future events are linked to this site."""
        return self.events.filter(date__gte=timezone.now()).count()


class Event(models.Model):
    """A tourism event that may be linked to a tourist site."""

    title       = models.CharField(max_length=255)
    slug        = models.SlugField(
                      max_length=255, unique=True, blank=True,
                      help_text='SEO-friendly URL identifier. Auto-generated from title.')
    description = models.TextField()
    location    = models.CharField(max_length=255)
    date        = models.DateTimeField(null=True, blank=True)
    price       = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_featured = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    tourist_site = models.ForeignKey(
        TouristSite,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='events',
    )

    # Managers
    objects  = models.Manager()       # default — returns ALL events
    upcoming = UpcomingEventManager() # Event.upcoming.all()
    past     = PastEventManager()     # Event.past.all()

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)

    def _unique_slug(self) -> str:
        base = slugify(self.title)
        slug, n = base, 1
        while Event.objects.filter(slug=slug).exclude(pk=self.pk or 0).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    @property
    def is_past(self) -> bool:
        """True when the event date has already passed."""
        if self.date is None:
            return False
        return self.date < timezone.now()

    @property
    def is_upcoming(self) -> bool:
        """True when the event date is in the future."""
        if self.date is None:
            return False
        return self.date >= timezone.now()

    @property
    def media_count(self) -> int:
        """Total number of media files attached to this event."""
        return self.media.count()


# ---------------------------------------------------------------------------
# Media choices
# ---------------------------------------------------------------------------

class MediaType(models.TextChoices):
    IMAGE = 'image', 'Image'
    VIDEO = 'video', 'Video'


# ---------------------------------------------------------------------------
# Abstract base media
# ---------------------------------------------------------------------------

class BaseMedia(models.Model):
    """
    Abstract base for EventMedia and TouristSiteMedia.
    - Validated CloudinaryField (type + size)
    - media_type auto-detected on save()
    - caption + timestamp
    """

    file = CloudinaryField(
        resource_type='auto',
        validators=[validate_media_file_type, validate_media_file_size],
    )
    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
        default=MediaType.IMAGE,
        editable=False,
    )
    caption    = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        raw = self.file
        if hasattr(raw, 'content_type') or hasattr(raw, 'name'):
            self.media_type = detect_media_type(raw)
        super().save(*args, **kwargs)

    @property
    def file_url(self) -> str | None:
        return self.file.url if self.file else None

    @property
    def is_image(self) -> bool:
        return self.media_type == MediaType.IMAGE

    @property
    def is_video(self) -> bool:
        return self.media_type == MediaType.VIDEO


# ---------------------------------------------------------------------------
# Concrete media models
# ---------------------------------------------------------------------------

class EventMedia(BaseMedia):
    """Images or videos attached to a tourism Event (Cloudinary: tourism/events/)."""

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='media')
    file  = CloudinaryField(
        resource_type='auto',
        folder='tourism/events',
        validators=[validate_media_file_type, validate_media_file_size],
    )

    class Meta(BaseMedia.Meta):
        verbose_name        = 'Event Media'
        verbose_name_plural = 'Event Media'

    def __str__(self):
        return f"{self.get_media_type_display()} – {self.event.title}"


class TouristSiteMedia(BaseMedia):
    """Images or videos attached to a TouristSite (Cloudinary: tourism/tourist_sites/)."""

    tourist_site = models.ForeignKey(TouristSite, on_delete=models.CASCADE, related_name='media')
    file         = CloudinaryField(
        resource_type='auto',
        folder='tourism/tourist_sites',
        validators=[validate_media_file_type, validate_media_file_size],
    )

    class Meta(BaseMedia.Meta):
        verbose_name        = 'Tourist Site Media'
        verbose_name_plural = 'Tourist Site Media'

    def __str__(self):
        return f"{self.get_media_type_display()} – {self.tourist_site.name}"
