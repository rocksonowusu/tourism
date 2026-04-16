from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
import logging

logger = logging.getLogger('tourism_events.uploads')

from .models import Event, TouristSite, EventMedia, TouristSiteMedia, Tour, TourMedia, TripRequest, CustomTourRequest, EventRequest, EventBooking, Apartment, ApartmentMedia, AccommodationRequest, Vehicle, VehicleMedia, CarRentalRequest, CommunityProject, CommunityProjectMedia, Review, SiteSettings, Notification, HeroBackground, HeroMosaic, EventsSectionBackground
from .serializers import (
    EventSerializer,
    EventListSerializer,
    TouristSiteSerializer,
    TouristSiteListSerializer,
    EventMediaSerializer,
    TouristSiteMediaSerializer,
    TourSerializer,
    TourListSerializer,
    TourMediaSerializer,
    TripRequestSerializer,
    CustomTourRequestSerializer,
    EventRequestSerializer,
    EventBookingSerializer,
    ApartmentSerializer,
    ApartmentListSerializer,
    ApartmentMediaSerializer,
    AccommodationRequestSerializer,
    VehicleSerializer,
    VehicleListSerializer,
    VehicleMediaSerializer,
    CarRentalRequestSerializer,
    CommunityProjectSerializer,
    CommunityProjectListSerializer,
    CommunityProjectMediaSerializer,
    ReviewSerializer,
    SiteSettingsSerializer,
    NotificationSerializer,
    HeroBackgroundSerializer,
    HeroMosaicSerializer,
    EventsSectionBackgroundSerializer,
)
from .filters import (
    EventFilter, TouristSiteFilter, EventMediaFilter, TouristSiteMediaFilter,
    TourFilter, TourMediaFilter, TripRequestFilter, CustomTourRequestFilter,
    EventRequestFilter,
    ApartmentFilter, ApartmentMediaFilter, AccommodationRequestFilter,
    VehicleFilter, VehicleMediaFilter, CarRentalRequestFilter,
    CommunityProjectFilter, CommunityProjectMediaFilter,
    ReviewFilter,
)
from .emails import send_trip_request_emails, send_custom_tour_request_emails, send_event_request_emails, send_event_booking_emails
from tourism_backend.pagination import StandardPagination


# ---------------------------------------------------------------------------
# EventViewSet
# ---------------------------------------------------------------------------

class EventViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for tourism Events with search, filtering, ordering, pagination.

    List / Detail
    ─────────────
    GET    /api/events/                   – paginated list (lightweight)
    GET    /api/events/{id}/              – full detail with nested media
    POST   /api/events/                   – create
    PUT    /api/events/{id}/              – full update
    PATCH  /api/events/{id}/             – partial update
    DELETE /api/events/{id}/             – delete

    Custom actions
    ──────────────
    GET  /api/events/featured/            – featured events only
    GET  /api/events/upcoming/            – events in the future (ordered soonest first)
    GET  /api/events/past/                – events already passed (most recent first)
    GET  /api/events/{id}/media/          – all media for one event
    POST /api/events/{id}/upload/         – upload image/video file(s)
    GET  /api/events/by-slug/{slug}/      – retrieve event by SEO slug

    Query params
    ────────────
    ?search=       title, description, location
    ?is_featured=  true|false
    ?date_after=   YYYY-MM-DD
    ?date_before=  YYYY-MM-DD
    ?date=         YYYY-MM-DD  (exact day)
    ?tourist_site= id
    ?ordering=     date | created_at  (prefix - for desc)
    ?page=         page number
    ?page_size=    results per page
    """

    queryset = (
        Event.objects
        .select_related('tourist_site')
        .prefetch_related('media')
        .all()
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes    = (MultiPartParser, FormParser, JSONParser)
    filter_backends   = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class   = EventFilter
    search_fields     = ['title', 'description', 'location']
    ordering_fields   = ['date', 'created_at']
    ordering          = ['-created_at']

    # Use a lightweight serializer for lists, full one for detail/write
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer

    # ------------------------------------------------------------------ #
    # Custom list actions                                                  #
    # ------------------------------------------------------------------ #

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Events marked as featured."""
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        return self._paginated_response(qs, EventListSerializer)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Future events, ordered soonest first."""
        qs = self.filter_queryset(
            self.get_queryset().filter(date__gte=timezone.now()).order_by('date')
        )
        return self._paginated_response(qs, EventListSerializer)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Past events, most recent first."""
        qs = self.filter_queryset(
            self.get_queryset().filter(date__lt=timezone.now()).order_by('-date')
        )
        return self._paginated_response(qs, EventListSerializer)

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\\w]+)')
    def by_slug(self, request, slug=None):
        """Retrieve a single event by its SEO-friendly slug."""
        event = self.get_queryset().filter(slug=slug).first()
        if not event:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(EventSerializer(event, context={'request': request}).data)

    # ------------------------------------------------------------------ #
    # Custom detail actions                                                #
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        """All media files attached to a specific event."""
        event = self.get_object()
        qs    = event.media.all()
        serializer = EventMediaSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        """
        Upload one or more image/video files for an event (max 5 total per event).

        Form fields:
          file     – one or more files  (required, max 5 at a time)
          caption  – shared caption text (optional)
        """
        import time
        upload_start = time.time()
        logger.info(f"Event upload started for event {pk}")
        
        MAX_MEDIA = 5
        event = self.get_object()
        files = request.FILES.getlist('file')

        if not files:
            return Response(
                {'detail': 'No files provided. Send at least one file field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(files) > MAX_MEDIA:
            return Response(
                {'detail': f'You can upload at most {MAX_MEDIA} files at a time.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_count = event.media.count()
        if existing_count >= MAX_MEDIA:
            return Response(
                {'detail': f'This event already has {existing_count} media files (max {MAX_MEDIA}). '
                           'Delete some before uploading more.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_slots = MAX_MEDIA - existing_count
        if len(files) > available_slots:
            return Response(
                {'detail': f'This event has {existing_count} media file(s). '
                           f'You can only upload {available_slots} more (max {MAX_MEDIA} total).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        errors  = []
        for idx, f in enumerate(files, 1):
            file_start = time.time()
            logger.info(f"Processing file {idx}/{len(files)}: {f.name} ({f.size} bytes)")
            
            serializer = EventMediaSerializer(
                data={'event': event.pk, 'file': f, 'caption': request.data.get('caption', '')},
                context={'request': request},
            )
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
                file_time = time.time() - file_start
                logger.info(f"File {idx} saved in {file_time:.2f}s")
            else:
                errors.append({'file': f.name, 'errors': serializer.errors})
                logger.warning(f"File {idx} validation failed: {serializer.errors}")

        if errors and not created:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        response_data = {'created': created}
        if errors:
            response_data['errors'] = errors
        
        total_time = time.time() - upload_start
        logger.info(f"Event upload completed in {total_time:.2f}s ({len(created)} files)")
        return Response(response_data, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------ #
    # Internal helper                                                      #
    # ------------------------------------------------------------------ #

    def _paginated_response(self, qs, serializer_class):
        page = self.paginate_queryset(qs)
        if page is not None:
            s = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(s.data)
        s = serializer_class(qs, many=True, context={'request': self.request})
        return Response(s.data)


# ---------------------------------------------------------------------------
# TouristSiteViewSet
# ---------------------------------------------------------------------------

class TouristSiteViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for TouristSites with search, filtering, ordering, pagination.

    List / Detail
    ─────────────
    GET    /api/sites/                    – paginated list
    GET    /api/sites/{id}/               – full detail with nested media
    POST   /api/sites/                    – create
    PUT    /api/sites/{id}/               – full update
    PATCH  /api/sites/{id}/              – partial update
    DELETE /api/sites/{id}/              – delete

    Custom actions
    ──────────────
    GET  /api/sites/featured/             – featured sites only
    GET  /api/sites/{id}/media/           – all media for one site
    GET  /api/sites/{id}/events/          – all events for one site
    POST /api/sites/{id}/upload/          – upload image/video file(s)
    GET  /api/sites/by-slug/{slug}/       – retrieve site by SEO slug

    Query params
    ────────────
    ?search=       name, description, location
    ?is_featured=  true|false
    ?location=     icontains match
    ?ordering=     name | created_at  (prefix - for desc)
    ?page=         page number
    """

    queryset = (
        TouristSite.objects
        .prefetch_related('media', 'events')
        .all()
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes  = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TouristSiteFilter
    search_fields   = ['name', 'description', 'location']
    ordering_fields = ['name', 'created_at']
    ordering        = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TouristSiteListSerializer
        return TouristSiteSerializer

    # ------------------------------------------------------------------ #
    # Custom list actions                                                  #
    # ------------------------------------------------------------------ #

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Sites marked as featured."""
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        return self._paginated_response(qs, TouristSiteListSerializer)

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\\w]+)')
    def by_slug(self, request, slug=None):
        """Retrieve a tourist site by its SEO-friendly slug."""
        site = self.get_queryset().filter(slug=slug).first()
        if not site:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TouristSiteSerializer(site, context={'request': request}).data)

    # ------------------------------------------------------------------ #
    # Custom detail actions                                                #
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        """All media files for a specific tourist site."""
        site = self.get_object()
        qs   = site.media.all()
        serializer = TouristSiteMediaSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """All events linked to this tourist site."""
        site = self.get_object()
        qs   = site.events.select_related('tourist_site').prefetch_related('media').all()
        return self._paginated_response(qs, EventListSerializer)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        """
        Upload one or more image/video files for a tourist site (max 5 total per site).

        Form fields:
          file     – one or more files  (required, max 5 at a time)
          caption  – shared caption text (optional)
        """
        MAX_MEDIA = 5
        site  = self.get_object()
        files = request.FILES.getlist('file')

        if not files:
            return Response(
                {'detail': 'No files provided. Send at least one file field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(files) > MAX_MEDIA:
            return Response(
                {'detail': f'You can upload at most {MAX_MEDIA} files at a time.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_count = site.media.count()
        if existing_count >= MAX_MEDIA:
            return Response(
                {'detail': f'This site already has {existing_count} media files (max {MAX_MEDIA}). '
                           'Delete some before uploading more.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_slots = MAX_MEDIA - existing_count
        if len(files) > available_slots:
            return Response(
                {'detail': f'This site has {existing_count} media file(s). '
                           f'You can only upload {available_slots} more (max {MAX_MEDIA} total).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        errors  = []
        for f in files:
            serializer = TouristSiteMediaSerializer(
                data={
                    'tourist_site': site.pk,
                    'file': f,
                    'caption': request.data.get('caption', ''),
                },
                context={'request': request},
            )
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
            else:
                errors.append({'file': f.name, 'errors': serializer.errors})

        if errors and not created:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        response_data = {'created': created}
        if errors:
            response_data['errors'] = errors
        return Response(response_data, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------ #
    # Internal helper                                                      #
    # ------------------------------------------------------------------ #

    def _paginated_response(self, qs, serializer_class):
        page = self.paginate_queryset(qs)
        if page is not None:
            s = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(s.data)
        s = serializer_class(qs, many=True, context={'request': self.request})
        return Response(s.data)


# ---------------------------------------------------------------------------
# EventMediaViewSet  (direct CRUD on media records)
# ---------------------------------------------------------------------------

class EventMediaViewSet(viewsets.ModelViewSet):
    """
    CRUD for EventMedia objects.

    GET    /api/event-media/              – list (filterable)
    POST   /api/event-media/              – create (upload)
    GET    /api/event-media/{id}/         – retrieve
    PUT    /api/event-media/{id}/         – full update
    PATCH  /api/event-media/{id}/        – partial update
    DELETE /api/event-media/{id}/        – delete

    ?event=3
    ?media_type=image|video
    ?search=caption text
    """

    queryset         = EventMedia.objects.select_related('event').all()
    serializer_class = EventMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes   = (MultiPartParser, FormParser, JSONParser)
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = EventMediaFilter
    search_fields    = ['caption', 'event__title']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']


# ---------------------------------------------------------------------------
# TouristSiteMediaViewSet  (direct CRUD on media records)
# ---------------------------------------------------------------------------

class TouristSiteMediaViewSet(viewsets.ModelViewSet):
    """
    CRUD for TouristSiteMedia objects.

    GET    /api/site-media/               – list (filterable)
    POST   /api/site-media/               – create (upload)
    GET    /api/site-media/{id}/          – retrieve
    PUT    /api/site-media/{id}/          – full update
    PATCH  /api/site-media/{id}/         – partial update
    DELETE /api/site-media/{id}/         – delete

    ?tourist_site=3
    ?media_type=image|video
    ?search=caption text
    """

    queryset         = TouristSiteMedia.objects.select_related('tourist_site').all()
    serializer_class = TouristSiteMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes   = (MultiPartParser, FormParser, JSONParser)
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = TouristSiteMediaFilter
    search_fields    = ['caption', 'tourist_site__name']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']


# ---------------------------------------------------------------------------
# TourViewSet
# ---------------------------------------------------------------------------

class TourViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Tours with search, filtering, ordering, pagination.

    List / Detail
    ─────────────
    GET    /api/tours/                    – paginated list (active tours)
    GET    /api/tours/{id}/               – full detail with nested media
    POST   /api/tours/                    – create  (admin)
    PUT    /api/tours/{id}/               – full update (admin)
    PATCH  /api/tours/{id}/              – partial update (admin)
    DELETE /api/tours/{id}/              – delete (admin)

    Custom actions
    ──────────────
    GET  /api/tours/featured/             – featured tours only
    GET  /api/tours/{id}/media/           – all media for one tour
    POST /api/tours/{id}/upload/          – upload image/video file(s)
    GET  /api/tours/by-slug/{slug}/       – retrieve tour by SEO slug

    Query params
    ────────────
    ?search=       title, description, location
    ?is_featured=  true|false
    ?is_active=    true|false
    ?location=     icontains match
    ?ordering=     created_at | title  (prefix - for desc)
    ?page=         page number
    """

    queryset = (
        Tour.objects
        .prefetch_related('media')
        .all()
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes    = (MultiPartParser, FormParser, JSONParser)
    filter_backends   = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class   = TourFilter
    search_fields     = ['title', 'description', 'location']
    ordering_fields   = ['created_at', 'title']
    ordering          = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TourListSerializer
        return TourSerializer

    # ---- Public list: only show active tours for anonymous users ----
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs

    # ------------------------------------------------------------------ #
    # Custom list actions                                                  #
    # ------------------------------------------------------------------ #

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Tours marked as featured."""
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        return self._paginated_response(qs, TourListSerializer)

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\\w]+)')
    def by_slug(self, request, slug=None):
        """Retrieve a tour by its SEO-friendly slug."""
        tour = self.get_queryset().filter(slug=slug).first()
        if not tour:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TourSerializer(tour, context={'request': request}).data)

    # ------------------------------------------------------------------ #
    # Custom detail actions                                                #
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        """All media files attached to a specific tour."""
        tour = self.get_object()
        qs   = tour.media.all()
        serializer = TourMediaSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        """
        Upload one or more image/video files for a tour (max 10 total per tour).
        """
        import time
        upload_start = time.time()
        logger.info(f"Tour upload started for tour {pk}")
        
        MAX_MEDIA = 10
        tour  = self.get_object()
        files = request.FILES.getlist('file')

        if not files:
            return Response(
                {'detail': 'No files provided. Send at least one file field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(files) > MAX_MEDIA:
            return Response(
                {'detail': f'You can upload at most {MAX_MEDIA} files at a time.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_count = tour.media.count()
        if existing_count >= MAX_MEDIA:
            return Response(
                {'detail': f'This tour already has {existing_count} media files (max {MAX_MEDIA}). '
                           'Delete some before uploading more.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        available_slots = MAX_MEDIA - existing_count
        if len(files) > available_slots:
            return Response(
                {'detail': f'This tour has {existing_count} media file(s). '
                           f'You can only upload {available_slots} more (max {MAX_MEDIA} total).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        errors  = []
        for idx, f in enumerate(files, 1):
            file_start = time.time()
            logger.info(f"Processing file {idx}/{len(files)}: {f.name} ({f.size} bytes)")
            
            serializer = TourMediaSerializer(
                data={'tour': tour.pk, 'file': f, 'caption': request.data.get('caption', '')},
                context={'request': request},
            )
            if serializer.is_valid():
                serializer.save()
                created.append(serializer.data)
                file_time = time.time() - file_start
                logger.info(f"File {idx} saved in {file_time:.2f}s")
            else:
                errors.append({'file': f.name, 'errors': serializer.errors})
                logger.warning(f"File {idx} validation failed: {serializer.errors}")

        if errors and not created:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        response_data = {'created': created}
        if errors:
            response_data['errors'] = errors
        
        total_time = time.time() - upload_start
        logger.info(f"Tour upload completed in {total_time:.2f}s ({len(created)} files)")
        return Response(response_data, status=status.HTTP_201_CREATED)

    # ------------------------------------------------------------------ #
    # Internal helper                                                      #
    # ------------------------------------------------------------------ #

    def _paginated_response(self, qs, serializer_class):
        page = self.paginate_queryset(qs)
        if page is not None:
            s = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(s.data)
        s = serializer_class(qs, many=True, context={'request': self.request})
        return Response(s.data)


# ---------------------------------------------------------------------------
# TourMediaViewSet  (direct CRUD on tour media records)
# ---------------------------------------------------------------------------

class TourMediaViewSet(viewsets.ModelViewSet):
    """
    CRUD for TourMedia objects.

    GET    /api/tour-media/               – list (filterable)
    POST   /api/tour-media/               – create (upload)
    GET    /api/tour-media/{id}/          – retrieve
    PUT    /api/tour-media/{id}/          – full update
    PATCH  /api/tour-media/{id}/         – partial update
    DELETE /api/tour-media/{id}/         – delete

    ?tour=3
    ?media_type=image|video
    ?search=caption text
    """

    queryset         = TourMedia.objects.select_related('tour').all()
    serializer_class = TourMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes   = (MultiPartParser, FormParser, JSONParser)
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = TourMediaFilter
    search_fields    = ['caption', 'tour__title']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']


# ---------------------------------------------------------------------------
# TripRequestViewSet
# ---------------------------------------------------------------------------

class TripRequestViewSet(viewsets.ModelViewSet):
    """
    Trip Request endpoints:

    POST   /api/trip-requests/            – PUBLIC (no auth) — submit a new request
    GET    /api/trip-requests/            – ADMIN only — list all requests
    GET    /api/trip-requests/{id}/       – ADMIN only — retrieve single request
    PATCH  /api/trip-requests/{id}/       – ADMIN only — update status
    DELETE /api/trip-requests/{id}/       – ADMIN only — delete

    Custom actions
    ──────────────
    GET  /api/trip-requests/new-count/    – ADMIN only — count of new requests (for badge)

    Query params (GET list)
    ───────────────────────
    ?status=       new|contacted|confirmed|cancelled
    ?tour=         tour id
    ?date_after=   YYYY-MM-DD
    ?date_before=  YYYY-MM-DD
    ?search=       customer_name, customer_email
    ?ordering=     created_at | preferred_date | status
    """

    queryset = TripRequest.objects.select_related('tour').all()
    serializer_class = TripRequestSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = TripRequestFilter
    search_fields    = ['customer_name', 'customer_email', 'customer_phone', 'tour__title']
    ordering_fields  = ['created_at', 'preferred_date', 'status']
    ordering         = ['-created_at']

    def get_permissions(self):
        """POST is public (anyone can submit a request); everything else needs admin."""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        """Save the trip request and fire off notification emails."""
        trip_request = serializer.save()
        send_trip_request_emails(trip_request)

    @action(detail=False, methods=['get'], url_path='new-count')
    def new_count(self, request):
        """Return count of requests with status='new' — used for admin badge."""
        count = self.get_queryset().filter(status='new').count()
        return Response({'count': count})


# ---------------------------------------------------------------------------
# CustomTourRequestViewSet
# ---------------------------------------------------------------------------

class CustomTourRequestViewSet(viewsets.ModelViewSet):
    """
    Custom Tour Request endpoints (customer-planned tours):

    POST   /api/custom-tour-requests/            – PUBLIC (no auth) — submit request
    GET    /api/custom-tour-requests/            – ADMIN only — list all
    GET    /api/custom-tour-requests/{id}/       – ADMIN only — retrieve single
    PATCH  /api/custom-tour-requests/{id}/       – ADMIN only — update status
    DELETE /api/custom-tour-requests/{id}/       – ADMIN only — delete

    Custom actions
    ──────────────
    GET  /api/custom-tour-requests/new-count/    – ADMIN only — count of new requests
    GET  /api/custom-tour-requests/package-options/ – PUBLIC — available package choices

    Query params (GET list)
    ───────────────────────
    ?status=       new|contacted|confirmed|cancelled
    ?date_after=   YYYY-MM-DD
    ?date_before=  YYYY-MM-DD
    ?search=       customer_name, customer_email
    ?ordering=     created_at | preferred_start_date | status
    """

    queryset = CustomTourRequest.objects.prefetch_related('sites').all()
    serializer_class = CustomTourRequestSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = CustomTourRequestFilter
    search_fields    = ['customer_name', 'customer_email', 'customer_phone']
    ordering_fields  = ['created_at', 'preferred_start_date', 'status']
    ordering         = ['-created_at']

    def get_permissions(self):
        """POST and package-options are public; everything else needs admin."""
        if self.action in ('create', 'package_options'):
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        """Save the custom tour request and fire off notification emails."""
        custom_request = serializer.save()
        send_custom_tour_request_emails(custom_request)

    @action(detail=False, methods=['get'], url_path='new-count')
    def new_count(self, request):
        """Return count of requests with status='new' — used for admin badge."""
        count = self.get_queryset().filter(status='new').count()
        return Response({'count': count})

    @action(detail=False, methods=['get'], url_path='package-options')
    def package_options(self, request):
        """Return available package choices for the form."""
        from .models import PackageChoice
        options = [{'key': k, 'label': v} for k, v in PackageChoice.choices]
        return Response(options)


# ---------------------------------------------------------------------------
# EventRequestViewSet  (Phase 4)
# ---------------------------------------------------------------------------

class EventRequestViewSet(viewsets.ModelViewSet):
    """
    Event Request endpoints (custom event organisation requests):

    POST   /api/event-requests/            – PUBLIC (no auth) — submit request
    GET    /api/event-requests/            – ADMIN only — list all
    GET    /api/event-requests/{id}/       – ADMIN only — retrieve single
    PATCH  /api/event-requests/{id}/       – ADMIN only — update status
    DELETE /api/event-requests/{id}/       – ADMIN only — delete

    Custom actions
    ──────────────
    GET  /api/event-requests/new-count/    – ADMIN only — count of new requests
    GET  /api/event-requests/event-type-options/ – PUBLIC — available event types

    Query params (GET list)
    ───────────────────────
    ?status=       new|contacted|confirmed|cancelled
    ?event_type=   corporate|family|retreat|recreational|custom
    ?date_after=   YYYY-MM-DD
    ?date_before=  YYYY-MM-DD
    ?search=       customer_name, customer_email
    ?ordering=     created_at | preferred_date | status
    """

    queryset = EventRequest.objects.all()
    serializer_class = EventRequestSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = EventRequestFilter
    search_fields    = ['customer_name', 'customer_email', 'customer_phone']
    ordering_fields  = ['created_at', 'preferred_date', 'status']
    ordering         = ['-created_at']

    def get_permissions(self):
        """POST and event-type-options are public; everything else needs admin."""
        if self.action in ('create', 'event_type_options'):
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        """Save the event request and fire off notification emails."""
        event_request = serializer.save()
        send_event_request_emails(event_request)

    @action(detail=False, methods=['get'], url_path='new-count')
    def new_count(self, request):
        """Return count of requests with status='new' — used for admin badge."""
        count = self.get_queryset().filter(status='new').count()
        return Response({'count': count})

    @action(detail=False, methods=['get'], url_path='event-type-options')
    def event_type_options(self, request):
        """Return available event type choices for the form."""
        from .models import EventRequestType
        options = [{'key': k, 'label': v} for k, v in EventRequestType.choices]
        return Response(options)


# ---------------------------------------------------------------------------
# EventBookingViewSet  (quick booking from event detail page)
# ---------------------------------------------------------------------------

class EventBookingViewSet(viewsets.ModelViewSet):
    """
    Event Booking endpoints (simple booking from event detail page):

    POST   /api/event-bookings/            – PUBLIC (no auth) — submit booking
    GET    /api/event-bookings/            – ADMIN only — list all
    GET    /api/event-bookings/{id}/       – ADMIN only — retrieve single
    PATCH  /api/event-bookings/{id}/       – ADMIN only — update status
    DELETE /api/event-bookings/{id}/       – ADMIN only — delete

    Custom actions
    ──────────────
    GET  /api/event-bookings/new-count/    – ADMIN only — count of new bookings
    """

    queryset = EventBooking.objects.select_related('event').all()
    serializer_class = EventBookingSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['customer_name', 'customer_email', 'customer_phone', 'event__title']
    ordering_fields  = ['created_at', 'status']
    ordering         = ['-created_at']

    def get_permissions(self):
        """POST is public; everything else needs admin."""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        """Save the booking and fire off notification emails."""
        booking = serializer.save()
        send_event_booking_emails(booking)

    @action(detail=False, methods=['get'], url_path='new-count')
    def new_count(self, request):
        """Return count of bookings with status='new' — used for admin badge."""
        count = self.get_queryset().filter(status='new').count()
        return Response({'count': count})


# ---------------------------------------------------------------------------
# ApartmentViewSet  (Phase 3)
# ---------------------------------------------------------------------------

class ApartmentViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Apartments with search, filtering, ordering, pagination.

    GET    /api/apartments/                – paginated list
    GET    /api/apartments/{id}/           – full detail with nested media
    POST   /api/apartments/               – create (admin)
    PATCH  /api/apartments/{id}/           – update (admin)
    DELETE /api/apartments/{id}/           – delete (admin)

    Custom actions:
    GET  /api/apartments/featured/         – featured only
    GET  /api/apartments/by-slug/{slug}/   – retrieve by slug
    GET  /api/apartments/{id}/media/       – all media
    POST /api/apartments/{id}/upload/      – upload media files
    """

    queryset = Apartment.objects.prefetch_related('media').all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = (MultiPartParser, FormParser, JSONParser)
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = ApartmentFilter
    search_fields      = ['title', 'description', 'location']
    ordering_fields    = ['created_at', 'title', 'price_per_night']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ApartmentListSerializer
        return ApartmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_available=True)
        return qs

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        return self._paginated_response(qs, ApartmentListSerializer)

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\\w]+)')
    def by_slug(self, request, slug=None):
        apt = self.get_queryset().filter(slug=slug).first()
        if not apt:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ApartmentSerializer(apt, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        apt = self.get_object()
        serializer = ApartmentMediaSerializer(apt.media.all(), many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        MAX_MEDIA = 10
        apt   = self.get_object()
        files = request.FILES.getlist('file')
        if not files:
            return Response({'detail': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = apt.media.count()
        if existing >= MAX_MEDIA:
            return Response({'detail': f'Max {MAX_MEDIA} media files reached.'}, status=status.HTTP_400_BAD_REQUEST)
        slots = MAX_MEDIA - existing
        if len(files) > slots:
            return Response({'detail': f'Can only upload {slots} more file(s).'}, status=status.HTTP_400_BAD_REQUEST)
        created, errors = [], []
        for f in files:
            ser = ApartmentMediaSerializer(
                data={'apartment': apt.pk, 'file': f, 'caption': request.data.get('caption', '')},
                context={'request': request})
            if ser.is_valid():
                ser.save(); created.append(ser.data)
            else:
                errors.append({'file': f.name, 'errors': ser.errors})
        if errors and not created:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        resp = {'created': created}
        if errors: resp['errors'] = errors
        return Response(resp, status=status.HTTP_201_CREATED)

    def _paginated_response(self, qs, serializer_class):
        page = self.paginate_queryset(qs)
        if page is not None:
            s = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(s.data)
        return Response(serializer_class(qs, many=True, context={'request': self.request}).data)


# ---------------------------------------------------------------------------
# ApartmentMediaViewSet
# ---------------------------------------------------------------------------

class ApartmentMediaViewSet(viewsets.ModelViewSet):
    queryset         = ApartmentMedia.objects.select_related('apartment').all()
    serializer_class = ApartmentMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes   = (MultiPartParser, FormParser, JSONParser)
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = ApartmentMediaFilter
    search_fields    = ['caption', 'apartment__title']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']


# ---------------------------------------------------------------------------
# AccommodationRequestViewSet  (Phase 3)
# ---------------------------------------------------------------------------

class AccommodationRequestViewSet(viewsets.ModelViewSet):
    """
    POST   /api/accommodation-requests/         – PUBLIC
    GET    /api/accommodation-requests/         – ADMIN
    PATCH  /api/accommodation-requests/{id}/    – ADMIN
    DELETE /api/accommodation-requests/{id}/    – ADMIN
    GET    /api/accommodation-requests/new-count/ – ADMIN
    """

    queryset = AccommodationRequest.objects.select_related('apartment').all()
    serializer_class = AccommodationRequestSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = AccommodationRequestFilter
    search_fields    = ['customer_name', 'customer_email', 'customer_phone']
    ordering_fields  = ['created_at', 'check_in_date', 'status']
    ordering         = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='new-count')
    def new_count(self, request):
        count = self.get_queryset().filter(status='new').count()
        return Response({'count': count})


# ---------------------------------------------------------------------------
# VehicleViewSet  (Phase 6)
# ---------------------------------------------------------------------------

class VehicleViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for Vehicles with search, filtering, ordering, pagination.

    GET    /api/vehicles/                  – paginated list
    GET    /api/vehicles/{id}/             – full detail
    POST   /api/vehicles/                  – create (admin)
    PATCH  /api/vehicles/{id}/             – update (admin)
    DELETE /api/vehicles/{id}/             – delete (admin)

    Custom actions:
    GET  /api/vehicles/featured/           – featured only
    GET  /api/vehicles/by-slug/{slug}/     – retrieve by slug
    GET  /api/vehicles/{id}/media/         – all media
    POST /api/vehicles/{id}/upload/        – upload media files
    """

    queryset = Vehicle.objects.prefetch_related('media').all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = (MultiPartParser, FormParser, JSONParser)
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = VehicleFilter
    search_fields      = ['name', 'description', 'brand']
    ordering_fields    = ['created_at', 'name', 'price_per_day']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return VehicleListSerializer
        return VehicleSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_available=True)
        return qs

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        return self._paginated_response(qs, VehicleListSerializer)

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\\w]+)')
    def by_slug(self, request, slug=None):
        veh = self.get_queryset().filter(slug=slug).first()
        if not veh:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(VehicleSerializer(veh, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        veh = self.get_object()
        serializer = VehicleMediaSerializer(veh.media.all(), many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        MAX_MEDIA = 10
        veh   = self.get_object()
        files = request.FILES.getlist('file')
        if not files:
            return Response({'detail': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = veh.media.count()
        if existing >= MAX_MEDIA:
            return Response({'detail': f'Max {MAX_MEDIA} media files reached.'}, status=status.HTTP_400_BAD_REQUEST)
        slots = MAX_MEDIA - existing
        if len(files) > slots:
            return Response({'detail': f'Can only upload {slots} more file(s).'}, status=status.HTTP_400_BAD_REQUEST)
        created, errors = [], []
        for f in files:
            ser = VehicleMediaSerializer(
                data={'vehicle': veh.pk, 'file': f, 'caption': request.data.get('caption', '')},
                context={'request': request})
            if ser.is_valid():
                ser.save(); created.append(ser.data)
            else:
                errors.append({'file': f.name, 'errors': ser.errors})
        if errors and not created:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        resp = {'created': created}
        if errors: resp['errors'] = errors
        return Response(resp, status=status.HTTP_201_CREATED)

    def _paginated_response(self, qs, serializer_class):
        page = self.paginate_queryset(qs)
        if page is not None:
            s = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(s.data)
        return Response(serializer_class(qs, many=True, context={'request': self.request}).data)


# ---------------------------------------------------------------------------
# VehicleMediaViewSet
# ---------------------------------------------------------------------------

class VehicleMediaViewSet(viewsets.ModelViewSet):
    queryset         = VehicleMedia.objects.select_related('vehicle').all()
    serializer_class = VehicleMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes   = (MultiPartParser, FormParser, JSONParser)
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = VehicleMediaFilter
    search_fields    = ['caption', 'vehicle__name']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']


# ---------------------------------------------------------------------------
# CarRentalRequestViewSet  (Phase 6)
# ---------------------------------------------------------------------------

class CarRentalRequestViewSet(viewsets.ModelViewSet):
    """
    POST   /api/car-rental-requests/          – PUBLIC
    GET    /api/car-rental-requests/          – ADMIN
    PATCH  /api/car-rental-requests/{id}/     – ADMIN
    DELETE /api/car-rental-requests/{id}/     – ADMIN
    GET    /api/car-rental-requests/new-count/ – ADMIN
    """

    queryset = CarRentalRequest.objects.select_related('vehicle').all()
    serializer_class = CarRentalRequestSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = CarRentalRequestFilter
    search_fields    = ['customer_name', 'customer_email', 'customer_phone']
    ordering_fields  = ['created_at', 'pickup_date', 'status']
    ordering         = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'], url_path='new-count')
    def new_count(self, request):
        count = self.get_queryset().filter(status='new').count()
        return Response({'count': count})


# ============================================================================
#  PHASE 5 — CommunityProject ViewSets
# ============================================================================

class CommunityProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD for community / charity projects.

    GET    /api/community-projects/                      – list (public, paginated)
    GET    /api/community-projects/{id}/                 – detail
    GET    /api/community-projects/featured/             – featured only
    GET    /api/community-projects/by-slug/{slug}/       – by slug
    GET    /api/community-projects/{id}/media/           – media list
    POST   /api/community-projects/{id}/upload/          – media upload (admin)
    """

    queryset = (
        CommunityProject.objects
        .prefetch_related('media')
        .all()
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes     = (MultiPartParser, FormParser, JSONParser)
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = CommunityProjectFilter
    search_fields      = ['title', 'description', 'location']
    ordering_fields    = ['date', 'created_at', 'beneficiaries_count']
    ordering           = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CommunityProjectListSerializer
        return CommunityProjectSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        return self._paginated_response(qs, CommunityProjectListSerializer)

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[-\\w]+)')
    def by_slug(self, request, slug=None):
        obj = self.get_queryset().filter(slug=slug).first()
        if not obj:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CommunityProjectSerializer(obj, context={'request': request}).data)

    @action(detail=True, methods=['get'])
    def media(self, request, pk=None):
        obj = self.get_object()
        serializer = CommunityProjectMediaSerializer(obj.media.all(), many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request, pk=None):
        MAX_MEDIA = 10
        obj   = self.get_object()
        files = request.FILES.getlist('file')
        if not files:
            return Response({'detail': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)
        existing = obj.media.count()
        if existing >= MAX_MEDIA:
            return Response({'detail': f'Max {MAX_MEDIA} media files reached.'}, status=status.HTTP_400_BAD_REQUEST)
        slots = MAX_MEDIA - existing
        if len(files) > slots:
            return Response({'detail': f'Can only upload {slots} more file(s).'}, status=status.HTTP_400_BAD_REQUEST)
        created, errors = [], []
        for f in files:
            ser = CommunityProjectMediaSerializer(
                data={'community_project': obj.pk, 'file': f, 'caption': request.data.get('caption', '')},
                context={'request': request})
            if ser.is_valid():
                ser.save(); created.append(ser.data)
            else:
                errors.append({'file': f.name, 'errors': ser.errors})
        if errors and not created:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        resp = {'created': created}
        if errors: resp['errors'] = errors
        return Response(resp, status=status.HTTP_201_CREATED)

    def _paginated_response(self, qs, serializer_class):
        page = self.paginate_queryset(qs)
        if page is not None:
            s = serializer_class(page, many=True, context={'request': self.request})
            return self.get_paginated_response(s.data)
        return Response(serializer_class(qs, many=True, context={'request': self.request}).data)


class CommunityProjectMediaViewSet(viewsets.ModelViewSet):
    queryset         = CommunityProjectMedia.objects.select_related('community_project').all()
    serializer_class = CommunityProjectMediaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes   = (MultiPartParser, FormParser, JSONParser)
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = CommunityProjectMediaFilter
    search_fields    = ['caption', 'community_project__title']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']


# ============================================================================
#  PHASE 7 — Review ViewSet
# ============================================================================

class ReviewViewSet(viewsets.ModelViewSet):
    """
    POST   /api/reviews/                – PUBLIC (submit a review)
    GET    /api/reviews/                – PUBLIC (approved only) / ADMIN (all)
    GET    /api/reviews/featured/       – PUBLIC (featured + approved)
    GET    /api/reviews/pending/        – ADMIN (is_approved=False)
    PATCH  /api/reviews/{id}/           – ADMIN (approve / feature)
    DELETE /api/reviews/{id}/           – ADMIN
    GET    /api/reviews/stats/          – ADMIN
    """

    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = ReviewFilter
    search_fields    = ['reviewer_name', 'title', 'comment']
    ordering_fields  = ['created_at', 'rating']
    ordering         = ['-created_at']
    parser_classes   = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.action in ('create', 'list', 'retrieve', 'featured'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if not (self.request.user and self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(is_approved=True)
        return qs

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = Review.objects.filter(is_featured=True, is_approved=True)
        page = self.paginate_queryset(qs)
        if page is not None:
            s = ReviewSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(s.data)
        return Response(ReviewSerializer(qs, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        qs = Review.objects.filter(is_approved=False)
        page = self.paginate_queryset(qs)
        if page is not None:
            s = ReviewSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(s.data)
        return Response(ReviewSerializer(qs, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        from django.db.models import Avg, Count
        all_reviews = Review.objects.all()
        return Response({
            'total': all_reviews.count(),
            'approved': all_reviews.filter(is_approved=True).count(),
            'pending': all_reviews.filter(is_approved=False).count(),
            'featured': all_reviews.filter(is_featured=True).count(),
            'average_rating': all_reviews.filter(is_approved=True).aggregate(avg=Avg('rating'))['avg'] or 0,
            'by_service_type': list(
                all_reviews.filter(is_approved=True)
                .values('service_type')
                .annotate(count=Count('id'), avg_rating=Avg('rating'))
                .order_by('-count')
            ),
        })


# ---------------------------------------------------------------------------
# SiteSettingsViewSet  (Phase 8 — singleton)
# ---------------------------------------------------------------------------

class SiteSettingsViewSet(viewsets.ViewSet):
    """
    GET  /api/site-settings/          – PUBLIC (read company info)
    PUT  /api/site-settings/          – ADMIN  (update company info)
    PATCH /api/site-settings/         – ADMIN  (partial update)
    """

    def get_permissions(self):
        if self.action in ('retrieve',):
            return [AllowAny()]
        return [IsAdminUser()]

    def retrieve(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# NotificationViewSet  (Phase 9)
# ---------------------------------------------------------------------------

class NotificationViewSet(viewsets.ModelViewSet):
    """
    Admin-only notification management.

    GET    /api/notifications/               – list (most recent first, paginated)
    GET    /api/notifications/{id}/          – detail
    PATCH  /api/notifications/{id}/          – mark read (is_read: true)
    DELETE /api/notifications/{id}/          – delete

    Custom actions
    ──────────────
    GET    /api/notifications/unread-count/  – { count: N }
    POST   /api/notifications/mark-all-read/ – mark every notification as read
    """

    queryset         = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminUser]
    filter_backends  = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields  = ['created_at']
    ordering         = ['-created_at']

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(is_read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        updated = Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'updated': updated})


class HeroBackgroundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for hero section background images.
    - Public (unauthenticated): Read-only access to active images
    - Authenticated admins: Full CRUD access, see all images
    """
    serializer_class = HeroBackgroundSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """For public (unauthenticated GET), filter to active only. For admin (authenticated), show all."""
        if self.request.user and self.request.user.is_authenticated:
            # Authenticated users (admins) see all images
            return HeroBackground.objects.all().order_by('order')
        # Public (unauthenticated) only sees active images
        return HeroBackground.objects.filter(is_active=True).order_by('order')


class HeroMosaicViewSet(viewsets.ModelViewSet):
    """
    ViewSet for hero section mosaic panel images.
    - Public (unauthenticated): Read-only access to active images
    - Authenticated admins: Full CRUD access, see all images
    """
    serializer_class = HeroMosaicSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """For public (unauthenticated GET), filter to active only. For admin (authenticated), show all."""
        if self.request.user and self.request.user.is_authenticated:
            # Authenticated users (admins) see all images
            return HeroMosaic.objects.all().order_by('position')
        # Public (unauthenticated) only sees active images
        return HeroMosaic.objects.filter(is_active=True).order_by('position')


class EventsSectionBackgroundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for events section background cycling images.
    - Public (unauthenticated): Read-only access to active images
    - Authenticated admins: Full CRUD access, see all images
    """
    serializer_class = EventsSectionBackgroundSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """For public (unauthenticated GET), filter to active only. For admin (authenticated), show all."""
        if self.request.user and self.request.user.is_authenticated:
            # Authenticated users (admins) see all images
            return EventsSectionBackground.objects.all().order_by('order')
        # Public (unauthenticated) only sees active images
        return EventsSectionBackground.objects.filter(is_active=True).order_by('order')
