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
    latitude    = models.DecimalField(
                      max_digits=9, decimal_places=6, null=True, blank=True,
                      help_text='GPS latitude of the event venue.')
    longitude   = models.DecimalField(
                      max_digits=9, decimal_places=6, null=True, blank=True,
                      help_text='GPS longitude of the event venue.')
    date        = models.DateTimeField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    highlights  = models.JSONField(
                      default=list, blank=True,
                      help_text='List of package highlights / inclusions shown on the detail page.')
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
    def season_label(self) -> str:
        """
        Fun, human-friendly status label based on how far the event is
        from today.  Returns a dict with `text`, `emoji`, and `tone`
        (for frontend colour coding).
        """
        if self.date is None:
            return 'date-tba'

        now  = timezone.now()
        diff = self.date - now
        days = diff.total_seconds() / 86400      # fractional days

        # ── Future events ────────────────────────────────────────
        if days > 0:
            hours = diff.total_seconds() / 3600
            if hours <= 6:
                return 'happening-now'       # within 6 hours
            if days <= 3:
                return 'almost-here'         # 1-3 days
            if days <= 14:
                return 'coming-soon'         # within 2 weeks
            if days <= 60:
                return 'mark-calendar'       # 2 weeks – 2 months
            return 'on-the-horizon'          # 2+ months away

        # ── Past events ──────────────────────────────────────────
        past_days = abs(days)
        if past_days <= 3:
            return 'just-missed'             # ended 1-3 days ago
        if past_days <= 30:
            return 'recently-ended'          # last month
        return 'throwback'                   # older than a month

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


# ---------------------------------------------------------------------------
# Tour / Package model
# ---------------------------------------------------------------------------

class Tour(models.Model):
    """A bookable tour package offered by the company."""

    title           = models.CharField(max_length=255)
    slug            = models.SlugField(
                          max_length=255, unique=True, blank=True,
                          help_text='SEO-friendly URL identifier. Auto-generated from title.')
    description     = models.TextField()
    location        = models.CharField(max_length=255)
    duration        = models.CharField(
                          max_length=100, blank=True,
                          help_text='E.g. "3 days / 2 nights", "Full day", "4 hours"')
    highlights      = models.JSONField(
                          default=list, blank=True,
                          help_text='List of tour highlights shown on detail page.')
    inclusions      = models.JSONField(
                          default=list, blank=True,
                          help_text='What is included (e.g. meals, transport, guide).')
    exclusions      = models.JSONField(
                          default=list, blank=True,
                          help_text='What is NOT included.')
    itinerary       = models.JSONField(
                          default=list, blank=True,
                          help_text='Day-by-day itinerary. Each item: {day, title, description}.')
    max_group_size  = models.PositiveIntegerField(
                          default=20,
                          help_text='Maximum number of travellers per group.')
    is_active       = models.BooleanField(default=True)
    is_featured     = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Tour'
        verbose_name_plural = 'Tours'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)

    def _unique_slug(self) -> str:
        base = slugify(self.title)
        slug, n = base, 1
        while Tour.objects.filter(slug=slug).exclude(pk=self.pk or 0).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    @property
    def media_count(self) -> int:
        """Total number of media files attached to this tour."""
        return self.media.count()


class TourMedia(BaseMedia):
    """Images or videos attached to a Tour (Cloudinary: tourism/tours/)."""

    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='media')
    file = CloudinaryField(
        resource_type='auto',
        folder='tourism/tours',
        validators=[validate_media_file_type, validate_media_file_size],
    )

    class Meta(BaseMedia.Meta):
        verbose_name        = 'Tour Media'
        verbose_name_plural = 'Tour Media'

    def __str__(self):
        return f"{self.get_media_type_display()} – {self.tour.title}"


# ---------------------------------------------------------------------------
# Trip Request model
# ---------------------------------------------------------------------------

class TripRequestStatus(models.TextChoices):
    NEW       = 'new',       'New'
    CONTACTED = 'contacted', 'Contacted'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class TripRequest(models.Model):
    """
    A customer's request to book a specific tour package.
    Created publicly (no auth) and managed by admin.
    """

    tour              = models.ForeignKey(
                            Tour, on_delete=models.CASCADE, related_name='trip_requests')
    customer_name     = models.CharField(max_length=255)
    customer_email    = models.EmailField()
    customer_phone    = models.CharField(max_length=30)
    number_of_adults  = models.PositiveIntegerField(default=1)
    number_of_children = models.PositiveIntegerField(
                             default=0, help_text='Ages 3–12')
    number_of_infants = models.PositiveIntegerField(
                            default=0, help_text='Under 3')
    preferred_date    = models.DateField()
    special_requests  = models.TextField(blank=True)
    status            = models.CharField(
                            max_length=20,
                            choices=TripRequestStatus.choices,
                            default=TripRequestStatus.NEW,
                        )
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Trip Request'
        verbose_name_plural = 'Trip Requests'

    def __str__(self):
        return f"{self.customer_name} – {self.tour.title} ({self.get_status_display()})"

    @property
    def total_travellers(self) -> int:
        return self.number_of_adults + self.number_of_children + self.number_of_infants


# ---------------------------------------------------------------------------
# Package choices for custom tours
# ---------------------------------------------------------------------------

class PackageChoice(models.TextChoices):
    TRANSPORT       = 'transport',       'Transport / Transfers'
    ACCOMMODATION   = 'accommodation',   'Accommodation'
    MEALS           = 'meals',           'Meals & Dining'
    GUIDED_TOUR     = 'guided_tour',     'Professional Guide'
    PHOTOGRAPHY     = 'photography',     'Photography / Videography'
    CULTURAL        = 'cultural',        'Cultural Experience'
    ADVENTURE       = 'adventure',       'Adventure Activities'
    AIRPORT_PICKUP  = 'airport_pickup',  'Airport Pickup & Drop-off'
    TRAVEL_INSURANCE = 'travel_insurance', 'Travel Insurance'


class CustomTourRequestStatus(models.TextChoices):
    NEW       = 'new',       'New'
    CONTACTED = 'contacted', 'Contacted'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class CustomTourRequest(models.Model):
    """
    A customer-planned tour request where they pick their own sites
    and desired packages. Created publicly (no auth) and managed by admin.
    """

    # Sites the customer wants to visit
    sites = models.ManyToManyField(
        TouristSite,
        related_name='custom_tour_requests',
        help_text='Tourist sites the customer wants to visit.',
    )

    # Packages / add-ons
    packages = models.JSONField(
        default=list,
        help_text='List of package keys chosen by the customer.',
    )

    # Traveller info
    number_of_adults   = models.PositiveIntegerField(default=1)
    number_of_children = models.PositiveIntegerField(
                             default=0, help_text='Ages 3-12')
    number_of_infants  = models.PositiveIntegerField(
                             default=0, help_text='Under 3')

    # Schedule
    preferred_start_date = models.DateField(
        help_text='When the customer wants to start the tour.')
    preferred_end_date   = models.DateField(
        null=True, blank=True,
        help_text='Optional end date for multi-day tours.')
    flexibility          = models.CharField(
        max_length=20, blank=True, default='exact',
        help_text='Date flexibility: exact, flexible_1_2_days, flexible_week, anytime')

    # Contact
    customer_name  = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30)
    country        = models.CharField(max_length=100, blank=True)

    # Notes
    special_requests = models.TextField(blank=True)

    # Status
    status = models.CharField(
        max_length=20,
        choices=CustomTourRequestStatus.choices,
        default=CustomTourRequestStatus.NEW,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Custom Tour Request'
        verbose_name_plural = 'Custom Tour Requests'

    def __str__(self):
        return f"{self.customer_name} — Custom Tour ({self.get_status_display()})"

    @property
    def total_travellers(self) -> int:
        return self.number_of_adults + self.number_of_children + self.number_of_infants

    @property
    def site_names(self) -> list:
        return list(self.sites.values_list('name', flat=True))

    @property
    def package_labels(self) -> list:
        label_map = dict(PackageChoice.choices)
        return [label_map.get(p, p) for p in (self.packages or [])]
