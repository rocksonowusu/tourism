from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Event, TouristSite, EventMedia, TouristSiteMedia
from .serializers import (
    EventSerializer,
    EventListSerializer,
    TouristSiteSerializer,
    TouristSiteListSerializer,
    EventMediaSerializer,
    TouristSiteMediaSerializer,
)
from .filters import EventFilter, TouristSiteFilter, EventMediaFilter, TouristSiteMediaFilter


# ---------------------------------------------------------------------------
# Custom pagination (optional per-view override)
# ---------------------------------------------------------------------------

class StandardPagination:
    """Applied globally via settings.DEFAULT_PAGINATION_CLASS; referenced here for clarity."""
    page_size = 10


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
    ?price_min=    number
    ?price_max=    number
    ?tourist_site= id
    ?ordering=     date | price | created_at  (prefix - for desc)
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
    ordering_fields   = ['date', 'price', 'created_at']
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
        Upload one or more image/video files for an event.

        Form fields:
          file     – one or more files  (required)
          caption  – shared caption text (optional)
        """
        event = self.get_object()
        files = request.FILES.getlist('file')

        if not files:
            return Response(
                {'detail': 'No files provided. Send at least one file field.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        errors  = []
        for f in files:
            serializer = EventMediaSerializer(
                data={'event': event.pk, 'file': f, 'caption': request.data.get('caption', '')},
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
        Upload one or more image/video files for a tourist site.

        Form fields:
          file     – one or more files  (required)
          caption  – shared caption text (optional)
        """
        site  = self.get_object()
        files = request.FILES.getlist('file')

        if not files:
            return Response(
                {'detail': 'No files provided. Send at least one file field.'},
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
