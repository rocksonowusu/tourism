from django.http import JsonResponse
from django.conf import settings
from django.core.mail import send_mail
import socket
import ssl


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({'status': 'ok', 'message': 'Tourism backend is running.'})


def email_test(request):
    """
    GET /health/email-test/
    Step-by-step SMTP diagnostic + sends a test email.
    Protected by first 8 chars of SECRET_KEY when DEBUG=False.
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
        'EMAIL_USE_SSL':       getattr(settings, 'EMAIL_USE_SSL', False),
        'EMAIL_TIMEOUT':       getattr(settings, 'EMAIL_TIMEOUT', None),
        'EMAIL_HOST_USER':     settings.EMAIL_HOST_USER or '(empty)',
        'EMAIL_HOST_PASSWORD': ('***' + settings.EMAIL_HOST_PASSWORD[-4:]) if settings.EMAIL_HOST_PASSWORD else '(empty)',
        'DEFAULT_FROM_EMAIL':  settings.DEFAULT_FROM_EMAIL,
        'COMPANY_EMAIL':       getattr(settings, 'COMPANY_EMAIL', '(not set)'),
    }

    diagnostics = {}

    # Step 1: DNS resolution
    try:
        ip = socket.gethostbyname(settings.EMAIL_HOST)
        diagnostics['dns_resolve'] = f'OK — {settings.EMAIL_HOST} → {ip}'
    except Exception as e:
        diagnostics['dns_resolve'] = f'FAIL — {e}'
        return JsonResponse({'status': 'error', 'step': 'dns', 'diagnostics': diagnostics, 'config': config}, status=500)

    # Step 2: TCP connection test
    try:
        sock = socket.create_connection((settings.EMAIL_HOST, settings.EMAIL_PORT), timeout=10)
        diagnostics['tcp_connect'] = f'OK — connected to {settings.EMAIL_HOST}:{settings.EMAIL_PORT}'
        sock.close()
    except Exception as e:
        diagnostics['tcp_connect'] = f'FAIL — {e}'
        return JsonResponse({'status': 'error', 'step': 'tcp', 'diagnostics': diagnostics, 'config': config}, status=500)

    # Step 3: SSL/TLS handshake (for port 465)
    if getattr(settings, 'EMAIL_USE_SSL', False):
        try:
            ctx = ssl.create_default_context()
            raw_sock = socket.create_connection((settings.EMAIL_HOST, settings.EMAIL_PORT), timeout=10)
            ssl_sock = ctx.wrap_socket(raw_sock, server_hostname=settings.EMAIL_HOST)
            diagnostics['ssl_handshake'] = f'OK — {ssl_sock.version()}'
            ssl_sock.close()
        except Exception as e:
            diagnostics['ssl_handshake'] = f'FAIL — {e}'

    # Step 4: Actually send the test email via Django
    try:
        sent = send_mail(
            subject='[Test] Email Config Verification — 1957 Ghana Experience',
            message='If you receive this email, your SMTP configuration is working correctly on Render.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        diagnostics['send_mail'] = f'OK — {sent} message(s) sent to {to_email}'
        return JsonResponse({'status': 'sent', 'messages_sent': sent, 'to': to_email, 'diagnostics': diagnostics, 'config': config})
    except Exception as e:
        diagnostics['send_mail'] = f'FAIL — [{type(e).__name__}] {e}'
        return JsonResponse({'status': 'error', 'step': 'send', 'diagnostics': diagnostics, 'config': config}, status=500)
