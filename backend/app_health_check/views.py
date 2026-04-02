from django.http import JsonResponse
from django.conf import settings
from django.core.mail import send_mail


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({'status': 'ok', 'message': 'Tourism backend is running.'})


def email_test(request):
    """
    GET /health/email-test/
    Sends a quick test email to COMPANY_EMAIL so you can verify SMTP config.
    Only works when DEBUG=True or when ?key=<DJANGO_SECRET_KEY first 8 chars> is passed.
    """
    secret_prefix = settings.SECRET_KEY[:8]
    key = request.GET.get('key', '')

    if not settings.DEBUG and key != secret_prefix:
        return JsonResponse({'error': 'Forbidden. Pass ?key=<first 8 chars of SECRET_KEY>'}, status=403)

    to_email = request.GET.get('to', settings.COMPANY_EMAIL)
    config = {
        'EMAIL_BACKEND':       settings.EMAIL_BACKEND,
        'EMAIL_HOST':          settings.EMAIL_HOST,
        'EMAIL_PORT':          settings.EMAIL_PORT,
        'EMAIL_USE_TLS':       settings.EMAIL_USE_TLS,
        'EMAIL_HOST_USER':     settings.EMAIL_HOST_USER,
        'EMAIL_HOST_PASSWORD': '***' + settings.EMAIL_HOST_PASSWORD[-4:] if settings.EMAIL_HOST_PASSWORD else '(empty)',
        'DEFAULT_FROM_EMAIL':  settings.DEFAULT_FROM_EMAIL,
        'COMPANY_EMAIL':       settings.COMPANY_EMAIL,
    }

    try:
        sent = send_mail(
            subject='[Test] Email Config Verification — 1957 Ghana Experience',
            message='If you receive this email, your SMTP configuration is working correctly on Render.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        return JsonResponse({'status': 'sent', 'messages_sent': sent, 'to': to_email, 'config': config})
    except Exception as e:
        return JsonResponse({'status': 'error', 'error': str(e), 'type': type(e).__name__, 'config': config}, status=500)
