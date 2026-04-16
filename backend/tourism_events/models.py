import logging
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from cloudinary.models import CloudinaryField

from .validators import (
    validate_media_file_type,
    validate_media_file_size,
    detect_media_type,
    compress_image_file,
)

logger = logging.getLogger(__name__)


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


class EventCategory(models.TextChoices):
    CORPORATE     = 'corporate',      'Corporate'
    FAMILY        = 'family_friends',  'Family & Friends'
    RETREAT       = 'retreat',         'Retreat'
    RECREATIONAL  = 'recreational',    'Recreational'
    CULTURAL      = 'cultural',        'Cultural'
    COUPLES       = 'couples',         'Couples'
    CUSTOM        = 'custom',          'Custom'


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

    # ── Phase-4 additions ────────────────────────────────────────────
    category    = models.CharField(
                      max_length=30,
                      choices=EventCategory.choices,
                      default=EventCategory.CULTURAL,
                      blank=True,
                      help_text='Category / type of event.')
    activities  = models.JSONField(
                      default=list, blank=True,
                      help_text='JSON list of included activities, e.g. ["Drumming", "Dance"].')
    suitable_for = models.CharField(
                      max_length=255, blank=True,
                      help_text='Target audience, e.g. "families", "corporate groups".')
    # ── End Phase-4 additions ────────────────────────────────────────

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
        import time
        raw = self.file
        start_time = time.time()
        
        # Detect media type before compression
        if hasattr(raw, 'content_type') or hasattr(raw, 'name'):
            self.media_type = detect_media_type(raw)
        
        # Compress image files before saving to Cloudinary
        # Only compress images that are likely too large (> 2MB)
        if self.file and (self.media_type == MediaType.IMAGE or not self.media_type):
            try:
                # Reset file pointer and compress
                if hasattr(self.file, 'seek'):
                    self.file.seek(0)
                original_size = getattr(self.file, 'size', 0)
                
                # Skip compression for small files (likely already optimized)
                if original_size > 2 * 1024 * 1024:  # > 2MB
                    compress_start = time.time()
                    self.file = compress_image_file(self.file)
                    compress_time = time.time() - compress_start
                    compressed_size = getattr(self.file, 'size', 0)
                    logger.info(
                        f"Image compressed in {compress_time:.2f}s: {original_size / (1024*1024):.2f}MB → "
                        f"{compressed_size / (1024*1024):.2f}MB "
                        f"({100 * (1 - compressed_size/original_size) if original_size > 0 else 0:.1f}% reduction)"
                    )
                else:
                    logger.debug(f"Skipped compression for {original_size / (1024*1024):.2f}MB image (< 2MB)")
            except Exception as e:
                # Log compression error but don't fail - let validators handle it
                logger.warning(f"Image compression failed: {str(e)}")
        
        upload_start = time.time()
        super().save(*args, **kwargs)
        upload_time = time.time() - upload_start
        total_time = time.time() - start_time
        
        logger.info(f"Media save completed in {total_time:.2f}s (upload: {upload_time:.2f}s)")

    @property
    def file_url(self) -> str | None:
        return self.file.url if self.file else None

    @property
    def is_image(self) -> bool:
        return self.media_type == MediaType.IMAGE

    @property
    def is_video(self) -> bool:
        return self.media_type == MediaType.VIDEO# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Event Request model  (Phase 4)
# ---------------------------------------------------------------------------

class EventRequestStatus(models.TextChoices):
    NEW       = 'new',       'New'
    CONTACTED = 'contacted', 'Contacted'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class EventRequestType(models.TextChoices):
    CORPORATE    = 'corporate',     'Corporate'
    FAMILY       = 'family',        'Family & Friends'
    RETREAT      = 'retreat',       'Retreat'
    RECREATIONAL = 'recreational',  'Recreational'
    COUPLES      = 'couples',       'Couples'
    CUSTOM       = 'custom',        'Custom'


class EventRequest(models.Model):
    """
    A customer's request to have a custom event organised for them.
    Created publicly (no auth) and managed by admin.
    """

    event_type              = models.CharField(
                                  max_length=30,
                                  choices=EventRequestType.choices,
                                  default=EventRequestType.CUSTOM,
                              )
    customer_name           = models.CharField(max_length=255)
    customer_email          = models.EmailField()
    customer_phone          = models.CharField(max_length=30)
    preferred_date          = models.DateField(null=True, blank=True)
    expected_attendees      = models.PositiveIntegerField(
                                  default=1,
                                  help_text='Estimated number of attendees.')
    location_preference     = models.CharField(max_length=255, blank=True)
    budget_range            = models.CharField(
                                  max_length=100, blank=True,
                                  help_text='E.g. "GH₵5,000 – 10,000"')
    activities_interested_in = models.JSONField(
                                  default=list, blank=True,
                                  help_text='JSON list of activities the customer is interested in.')
    special_requirements    = models.TextField(blank=True)
    status                  = models.CharField(
                                  max_length=20,
                                  choices=EventRequestStatus.choices,
                                  default=EventRequestStatus.NEW,
                              )
    created_at              = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Event Request'
        verbose_name_plural = 'Event Requests'

    def __str__(self):
        return f"{self.customer_name} — {self.get_event_type_display()} ({self.get_status_display()})"


# ---------------------------------------------------------------------------
# Event Booking — quick booking from the event detail page
# ---------------------------------------------------------------------------

class EventBookingStatus(models.TextChoices):
    NEW       = 'new',       'New'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class EventBooking(models.Model):
    """
    A simple booking / interest form submitted from the event detail page.
    Tied to a specific Event, unlike EventRequest which is a general enquiry.
    """

    event              = models.ForeignKey(
                             Event,
                             on_delete=models.CASCADE,
                             related_name='bookings',
                         )
    customer_name      = models.CharField(max_length=255)
    customer_email     = models.EmailField()
    customer_phone     = models.CharField(max_length=30)
    number_of_guests   = models.PositiveIntegerField(
                             default=1,
                             help_text='Total number of guests including the booker.')
    special_requests   = models.TextField(blank=True)
    status             = models.CharField(
                             max_length=20,
                             choices=EventBookingStatus.choices,
                             default=EventBookingStatus.NEW,
                         )
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Event Booking'
        verbose_name_plural = 'Event Bookings'

    def __str__(self):
        return f"{self.customer_name} — {self.event.title} ({self.get_status_display()})"


# ---------------------------------------------------------------------------
# Apartment / Accommodation models  (Phase 3)
# ---------------------------------------------------------------------------

class PropertyType(models.TextChoices):
    APARTMENT = 'apartment', 'Apartment'
    HOUSE     = 'house',     'House'
    VILLA     = 'villa',     'Villa'
    SUITE     = 'suite',     'Suite'


class Apartment(models.Model):
    """A rental property listed by the company."""

    title          = models.CharField(max_length=255)
    slug           = models.SlugField(
                         max_length=255, unique=True, blank=True,
                         help_text='SEO-friendly URL identifier. Auto-generated from title.')
    description    = models.TextField()
    location       = models.CharField(max_length=255)
    address        = models.CharField(max_length=500, blank=True)
    latitude       = models.DecimalField(
                         max_digits=9, decimal_places=6, null=True, blank=True)
    longitude      = models.DecimalField(
                         max_digits=9, decimal_places=6, null=True, blank=True)
    property_type  = models.CharField(
                         max_length=20,
                         choices=PropertyType.choices,
                         default=PropertyType.APARTMENT)
    bedrooms       = models.PositiveIntegerField(default=1)
    bathrooms      = models.PositiveIntegerField(default=1)
    max_guests     = models.PositiveIntegerField(default=2)
    price_per_night = models.DecimalField(
                          max_digits=10, decimal_places=2, null=True, blank=True,
                          help_text='Indicative price per night (GH₵).')
    amenities      = models.JSONField(
                         default=list, blank=True,
                         help_text='List of amenities, e.g. ["WiFi", "Pool", "Parking"].')
    rules          = models.JSONField(
                         default=list, blank=True,
                         help_text='House rules, e.g. ["No smoking", "No pets"].')
    is_available   = models.BooleanField(default=True)
    is_featured    = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Apartment'
        verbose_name_plural = 'Apartments'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)

    def _unique_slug(self) -> str:
        base = slugify(self.title)
        slug, n = base, 1
        while Apartment.objects.filter(slug=slug).exclude(pk=self.pk or 0).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    @property
    def media_count(self) -> int:
        return self.media.count()


class ApartmentMedia(BaseMedia):
    """Images or videos attached to an Apartment (Cloudinary: tourism/apartments/)."""

    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='media')
    file      = CloudinaryField(
        resource_type='auto',
        folder='tourism/apartments',
        validators=[validate_media_file_type, validate_media_file_size],
    )

    class Meta(BaseMedia.Meta):
        verbose_name        = 'Apartment Media'
        verbose_name_plural = 'Apartment Media'

    def __str__(self):
        return f"{self.get_media_type_display()} – {self.apartment.title}"


class AccommodationRequestStatus(models.TextChoices):
    NEW       = 'new',       'New'
    CONTACTED = 'contacted', 'Contacted'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class AccommodationPurpose(models.TextChoices):
    VACATION = 'vacation', 'Vacation'
    BUSINESS = 'business', 'Business'
    EVENT    = 'event',    'Event'
    OTHER    = 'other',    'Other'


class AccommodationRequest(models.Model):
    """
    A customer's inquiry about renting an apartment.
    Created publicly (no auth) and managed by admin.
    """

    apartment        = models.ForeignKey(
                           Apartment, on_delete=models.SET_NULL,
                           null=True, blank=True,
                           related_name='accommodation_requests',
                           help_text='Specific apartment, or null for general inquiry.')
    customer_name    = models.CharField(max_length=255)
    customer_email   = models.EmailField()
    customer_phone   = models.CharField(max_length=30)
    check_in_date    = models.DateField(null=True, blank=True)
    check_out_date   = models.DateField(null=True, blank=True)
    number_of_guests = models.PositiveIntegerField(default=1)
    purpose          = models.CharField(
                           max_length=20,
                           choices=AccommodationPurpose.choices,
                           default=AccommodationPurpose.VACATION)
    message          = models.TextField(blank=True)
    status           = models.CharField(
                           max_length=20,
                           choices=AccommodationRequestStatus.choices,
                           default=AccommodationRequestStatus.NEW)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Accommodation Request'
        verbose_name_plural = 'Accommodation Requests'

    def __str__(self):
        apt = self.apartment.title if self.apartment else 'General Inquiry'
        return f"{self.customer_name} — {apt} ({self.get_status_display()})"


# ---------------------------------------------------------------------------
# Vehicle / Car Rental models  (Phase 6)
# ---------------------------------------------------------------------------

class VehicleType(models.TextChoices):
    SEDAN = 'sedan', 'Sedan'
    SUV   = 'suv',   'SUV'
    VAN   = 'van',   'Van'
    BUS   = 'bus',   'Bus'
    LUXURY = 'luxury', 'Luxury'


class TransmissionType(models.TextChoices):
    AUTOMATIC = 'automatic', 'Automatic'
    MANUAL    = 'manual',    'Manual'


class FuelType(models.TextChoices):
    PETROL   = 'petrol',   'Petrol'
    DIESEL   = 'diesel',   'Diesel'
    ELECTRIC = 'electric', 'Electric'
    HYBRID   = 'hybrid',   'Hybrid'


class Vehicle(models.Model):
    """A vehicle available for rental."""

    name           = models.CharField(max_length=255)
    slug           = models.SlugField(
                         max_length=255, unique=True, blank=True,
                         help_text='SEO-friendly URL identifier. Auto-generated from name.')
    description    = models.TextField()
    vehicle_type   = models.CharField(
                         max_length=20,
                         choices=VehicleType.choices,
                         default=VehicleType.SEDAN)
    brand          = models.CharField(max_length=100, blank=True)
    model_year     = models.PositiveIntegerField(null=True, blank=True)
    seats          = models.PositiveIntegerField(default=4)
    transmission   = models.CharField(
                         max_length=20,
                         choices=TransmissionType.choices,
                         default=TransmissionType.AUTOMATIC)
    fuel_type      = models.CharField(
                         max_length=20,
                         choices=FuelType.choices,
                         default=FuelType.PETROL)
    price_per_day  = models.DecimalField(
                         max_digits=10, decimal_places=2, null=True, blank=True,
                         help_text='Indicative price per day (GH₵).')
    features       = models.JSONField(
                         default=list, blank=True,
                         help_text='List of features, e.g. ["AC", "Bluetooth", "GPS"].')
    is_available   = models.BooleanField(default=True)
    is_featured    = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)

    def _unique_slug(self) -> str:
        base = slugify(self.name)
        slug, n = base, 1
        while Vehicle.objects.filter(slug=slug).exclude(pk=self.pk or 0).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    @property
    def media_count(self) -> int:
        return self.media.count()


class VehicleMedia(BaseMedia):
    """Images or videos attached to a Vehicle (Cloudinary: tourism/vehicles/)."""

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='media')
    file    = CloudinaryField(
        resource_type='auto',
        folder='tourism/vehicles',
        validators=[validate_media_file_type, validate_media_file_size],
    )

    class Meta(BaseMedia.Meta):
        verbose_name        = 'Vehicle Media'
        verbose_name_plural = 'Vehicle Media'

    def __str__(self):
        return f"{self.get_media_type_display()} – {self.vehicle.name}"


class CarRentalRequestStatus(models.TextChoices):
    NEW       = 'new',       'New'
    CONTACTED = 'contacted', 'Contacted'
    CONFIRMED = 'confirmed', 'Confirmed'
    CANCELLED = 'cancelled', 'Cancelled'


class CarRentalRequest(models.Model):
    """
    A customer's inquiry about renting a vehicle.
    Created publicly (no auth) and managed by admin.
    """

    vehicle          = models.ForeignKey(
                           Vehicle, on_delete=models.SET_NULL,
                           null=True, blank=True,
                           related_name='rental_requests',
                           help_text='Specific vehicle, or null for general inquiry.')
    customer_name    = models.CharField(max_length=255)
    customer_email   = models.EmailField()
    customer_phone   = models.CharField(max_length=30)
    pickup_date      = models.DateField(null=True, blank=True)
    return_date      = models.DateField(null=True, blank=True)
    pickup_location  = models.CharField(max_length=255, blank=True)
    return_location  = models.CharField(max_length=255, blank=True)
    with_driver      = models.BooleanField(default=False)
    purpose          = models.CharField(max_length=255, blank=True)
    message          = models.TextField(blank=True)
    status           = models.CharField(
                           max_length=20,
                           choices=CarRentalRequestStatus.choices,
                           default=CarRentalRequestStatus.NEW)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Car Rental Request'
        verbose_name_plural = 'Car Rental Requests'

    def __str__(self):
        veh = self.vehicle.name if self.vehicle else 'General Inquiry'
        return f"{self.customer_name} – {veh}"


# ============================================================================
#  PHASE 5 — COMMUNITY & CHARITY SHOWCASE
# ============================================================================

class CommunityProject(models.Model):
    """A community or charity project / initiative."""

    title            = models.CharField(max_length=255)
    slug             = models.SlugField(
                           max_length=255, unique=True, blank=True,
                           help_text='SEO-friendly URL. Auto-generated from title.')
    description      = models.TextField()
    location         = models.CharField(max_length=255)
    date             = models.DateField(
                           null=True, blank=True,
                           help_text='Date of the project / event.')
    impact_summary   = models.TextField(
                           blank=True,
                           help_text='Short summary of the project community impact.')
    beneficiaries_count = models.PositiveIntegerField(
                           default=0,
                           help_text='Number of people positively impacted.')
    is_featured      = models.BooleanField(default=False)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Community Project'
        verbose_name_plural = 'Community Projects'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)

    def _unique_slug(self) -> str:
        base = slugify(self.title)
        slug, n = base, 1
        while CommunityProject.objects.filter(slug=slug).exclude(pk=self.pk or 0).exists():
            slug = f'{base}-{n}'
            n += 1
        return slug

    @property
    def media_count(self) -> int:
        return self.media.count()


class CommunityProjectMedia(BaseMedia):
    """Images / videos attached to a community project."""

    community_project = models.ForeignKey(
        CommunityProject, on_delete=models.CASCADE, related_name='media')
    file = CloudinaryField(
        'file',
        folder='tourism/community_projects',
        resource_type='auto',
        validators=[validate_media_file_type, validate_media_file_size],
    )

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Community Project Media'
        verbose_name_plural = 'Community Project Media'

    def __str__(self):
        return f"{self.get_media_type_display()} – {self.community_project.title}"


# ============================================================================
#  PHASE 7 — REVIEWS & RATINGS
# ============================================================================

class ReviewServiceType(models.TextChoices):
    TOUR          = 'tour',          'Tour'
    ACCOMMODATION = 'accommodation', 'Accommodation'
    EVENT         = 'event',         'Event'
    CAR_RENTAL    = 'car_rental',    'Car Rental'
    GENERAL       = 'general',       'General'


class Review(models.Model):
    """
    A review / testimonial submitted by a visitor.
    Must be approved by an admin before it appears publicly.
    """

    reviewer_name    = models.CharField(max_length=255)
    reviewer_email   = models.EmailField()
    reviewer_photo   = CloudinaryField(
                           'reviewer_photo',
                           folder='tourism/reviewer_photos',
                           resource_type='image',
                           blank=True, null=True,
                           help_text='Optional photo of the reviewer.')
    rating           = models.PositiveSmallIntegerField(
                           help_text='Rating from 1 to 5.',
                           default=5)
    title            = models.CharField(max_length=255)
    comment          = models.TextField()
    service_type     = models.CharField(
                           max_length=20,
                           choices=ReviewServiceType.choices,
                           default=ReviewServiceType.GENERAL)
    is_approved      = models.BooleanField(default=False)
    is_featured      = models.BooleanField(default=False)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"{self.reviewer_name} – {self.rating}★ – {self.title}"
        return f"{self.customer_name} — {veh} ({self.get_status_display()})"


# ============================================================================
#  PHASE 8 — SITE SETTINGS (Singleton) & SOCIAL LINKS
# ============================================================================

class SiteSettings(models.Model):
    """
    Singleton model holding company contact info, social-media URLs,
    and WhatsApp details.  Only one row should ever exist.
    """

    # Company info
    company_name     = models.CharField(max_length=255, default='1957 The Ghana Experience LBG')
    phone            = models.CharField(max_length=30, blank=True)
    email            = models.EmailField(blank=True)
    address          = models.TextField(blank=True)
    about_text       = models.TextField(blank=True)

    # WhatsApp
    whatsapp_number  = models.CharField(
                           max_length=30, blank=True,
                           help_text='International format, e.g. 233XXXXXXXXX')

    # Social media URLs
    facebook_url     = models.URLField(blank=True)
    instagram_url    = models.URLField(blank=True)
    twitter_url      = models.URLField(blank=True)
    tiktok_url       = models.URLField(blank=True)
    youtube_url      = models.URLField(blank=True)
    linkedin_url     = models.URLField(blank=True)

    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.company_name

    def save(self, *args, **kwargs):
        # Enforce singleton: always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """Return the singleton row, creating one with defaults if needed."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


# ============================================================================
# HERO SECTION IMAGES — Public Site Hero Background Slideshow
# ============================================================================

class HeroBackground(models.Model):
    """
    Stores images for the hero section background slideshow (full-bleed).
    Admin can upload multiple images that cycle automatically.
    """

    title       = models.CharField(max_length=255, blank=True, help_text='Image description/title')
    image       = CloudinaryField(
                      resource_type='auto',
                      folder='tourism/hero-backgrounds',
                      validators=[validate_media_file_type, validate_media_file_size],
                      help_text='Image for hero background slideshow'
                  )
    order       = models.PositiveIntegerField(
                      default=0,
                      help_text='Display order (0-indexed). Lower numbers appear first.'
                  )
    is_active   = models.BooleanField(default=True, help_text='Disable to hide from rotation')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Hero Background Image'
        verbose_name_plural = 'Hero Background Images'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Hero BG #{self.order + 1}" if not self.title else self.title

    def save(self, *args, **kwargs):
        # Compress image before saving
        if self.image and not isinstance(self.image, str):
            try:
                if hasattr(self.image, 'seek'):
                    self.image.seek(0)
                self.image = compress_image_file(self.image)
            except Exception as e:
                logger.warning(f"Image compression failed in HeroBackground: {str(e)}")
        super().save(*args, **kwargs)

    @property
    def image_url(self) -> str | None:
        return self.image.url if self.image else None


# ============================================================================
# HERO MOSAIC IMAGES — Right panel in hero section
# ============================================================================

class HeroMosaic(models.Model):
    """
    Stores images for the hero mosaic panel (right side).
    Supports up to 3 images that are arranged in a grid pattern.
    """

    POSITION_CHOICES = [
        ('cell1', 'Cell 1 - Left column, full height (tall)'),
        ('cell2', 'Cell 2 - Top right'),
        ('cell3', 'Cell 3 - Bottom right (tall)'),
    ]

    position    = models.CharField(
                      max_length=10,
                      choices=POSITION_CHOICES,
                      help_text='Grid position for this image'
                  )
    image       = CloudinaryField(
                      resource_type='auto',
                      folder='tourism/hero-mosaic',
                      validators=[validate_media_file_type, validate_media_file_size],
                      help_text='Image for hero mosaic panel'
                  )
    alt_text    = models.CharField(max_length=255, blank=True, help_text='Alt text for accessibility')
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Hero Mosaic Image'
        verbose_name_plural = 'Hero Mosaic Images'
        unique_together = ['position']  # Only one image per cell
        ordering = ['position']

    def __str__(self):
        return f"Mosaic - {self.get_position_display()}"

    def save(self, *args, **kwargs):
        # Compress image before saving
        if self.image and not isinstance(self.image, str):
            try:
                if hasattr(self.image, 'seek'):
                    self.image.seek(0)
                self.image = compress_image_file(self.image)
            except Exception as e:
                logger.warning(f"Image compression failed in HeroMosaic: {str(e)}")
        super().save(*args, **kwargs)

    @property
    def image_url(self) -> str | None:
        return self.image.url if self.image else None


# ============================================================================
# EVENTS SECTION BACKGROUND — Cycling backgrounds for events section
# ============================================================================

class EventsSectionBackground(models.Model):
    """
    Stores images that cycle in the Events section background.
    Admin can upload multiple images that rotate automatically.
    """

    title       = models.CharField(max_length=255, blank=True, help_text='Image description/title')
    image       = CloudinaryField(
                      resource_type='auto',
                      folder='tourism/events-section-bg',
                      validators=[validate_media_file_type, validate_media_file_size],
                      help_text='Image for events section background cycling'
                  )
    order       = models.PositiveIntegerField(
                      default=0,
                      help_text='Display order (0-indexed). Lower numbers appear first.'
                  )
    is_active   = models.BooleanField(default=True, help_text='Disable to hide from rotation')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Events Section Background Image'
        verbose_name_plural = 'Events Section Background Images'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Events BG #{self.order + 1}" if not self.title else self.title

    def save(self, *args, **kwargs):
        # Compress image before saving
        if self.image and not isinstance(self.image, str):
            try:
                if hasattr(self.image, 'seek'):
                    self.image.seek(0)
                self.image = compress_image_file(self.image)
            except Exception as e:
                logger.warning(f"Image compression failed in EventsSectionBackground: {str(e)}")
        super().save(*args, **kwargs)

    @property
    def image_url(self) -> str | None:
        return self.image.url if self.image else None


# ============================================================================
#  PHASE 9 — ADMIN NOTIFICATIONS
# ============================================================================

class NotificationType(models.TextChoices):
    REVIEW              = 'review',              'New Review'
    TRIP_REQUEST        = 'trip_request',         'Trip Request'
    CUSTOM_TOUR_REQUEST = 'custom_tour_request',  'Custom Tour Request'
    EVENT_REQUEST       = 'event_request',        'Event Request'
    EVENT_BOOKING       = 'event_booking',        'Event Booking'
    ACCOMMODATION_REQ   = 'accommodation_req',    'Accommodation Request'
    CAR_RENTAL_REQ      = 'car_rental_req',       'Car Rental Request'
    SYSTEM              = 'system',               'System'


class Notification(models.Model):
    """
    Admin notification created automatically when users submit requests,
    reviews, bookings, etc.  Displayed in the admin top-bar bell dropdown
    and used to trigger browser push notifications.
    """

    notification_type = models.CharField(
                            max_length=30,
                            choices=NotificationType.choices,
                            default=NotificationType.SYSTEM)
    title             = models.CharField(max_length=255)
    message           = models.TextField(blank=True)
    link              = models.CharField(
                            max_length=500, blank=True,
                            help_text='Frontend admin route to navigate to, e.g. /admin/reviews')
    is_read           = models.BooleanField(default=False)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"{'✓' if self.is_read else '●'} {self.title}"
