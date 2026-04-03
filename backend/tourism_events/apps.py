from django.apps import AppConfig


class TourismEventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tourism_events'
    verbose_name = 'Tourism Events'

    def ready(self):
        import tourism_events.signals  # noqa: F401 — register signal handlers
