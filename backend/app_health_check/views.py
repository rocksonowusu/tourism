from django.http import JsonResponse
from django.conf import settings
from django.core.mail import send_mail


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({'status': 'ok', 'message': 'Tourism backend is running.'})


def email_test(request):
    """
    GET /health/email-test/
    Sends a test email via Resend HTTP API to verify config.
    Protected by first 8 chars of SECRET_KEY when DEBUG=False.
    """
    secret_prefix = settings.SECRET_KEY[:8]
    key = request.GET.get('key', '')

    if not settings.DEBUG and key != secret_prefix:
        return JsonResponse({'error': 'Forbidden. Pass ?key=<first 8 chars of SECRET_KEY>'}, status=403)

    to_email = request.GET.get('to', getattr(settings, 'COMPANY_EMAIL', 'test@example.com'))

    config = {
        'EMAIL_BACKEND':      settings.EMAIL_BACKEND,
        'RESEND_API_KEY':     ('***' + settings.RESEND_API_KEY[-4:]) if getattr(settings, 'RESEND_API_KEY', '') else '(empty)',
        'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
        'COMPANY_EMAIL':      getattr(settings, 'COMPANY_EMAIL', '(not set)'),
    }

    if not getattr(settings, 'RESEND_API_KEY', ''):
        return JsonResponse({
            'status': 'error',
            'step': 'config',
            'error': 'RESEND_API_KEY is not set. Add it to your Render environment variables.',
            'config': config,
        }, status=500)

    try:
        sent = send_mail(
            subject='[Test] Email Config Verification — 1957 Ghana Experience',
            message='If you receive this email, your Resend email configuration is working correctly on Render.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        return JsonResponse({'status': 'sent', 'messages_sent': sent, 'to': to_email, 'config': config})
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'step': 'send',
            'error': f'[{type(e).__name__}] {e}',
            'config': config,
        }, status=500)
