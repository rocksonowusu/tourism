from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """
    Default pagination for all API endpoints.

    Clients can control page size with ?page_size=N (max 100).
    Example: GET /api/events/?page_size=5&page=2
    """
    page_size            = 10
    page_size_query_param = 'page_size'
    max_page_size        = 100
