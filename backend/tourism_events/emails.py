"""
Email notifications for Trip Requests.

Sends two branded HTML emails on every new request:
  1. To the company — full details so staff can follow up.
  2. To the customer — confirmation that the request was received.

Emails are sent in a non-daemon background thread with join() to ensure
they complete before Gunicorn recycles the worker (important for Render).
"""

import logging
import re
import threading
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

COMPANY_EMAIL    = getattr(settings, 'COMPANY_EMAIL', 'info@1957ghanaexperience.com')
WHATSAPP_NUMBER  = getattr(settings, 'COMPANY_WHATSAPP', '233557533568')
LOGO_URL         = getattr(
    settings, 'LOGO_URL',
    'https://res.cloudinary.com/dy8me66pj/image/upload/v1775072991/tourism/branding/logo.png',
)

# Maximum seconds to wait for the email thread before returning the response.
# Gmail SMTP typically takes 1-3s. 15s is generous enough for slow networks.
EMAIL_THREAD_TIMEOUT = 15


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def send_trip_request_emails(trip_request):
    """
    Send email pair for a newly created TripRequest.
    Uses a non-daemon thread with join() so Gunicorn cannot kill it mid-send.
    """
    ctx = _snapshot(trip_request)
    thread = threading.Thread(target=_send_emails_sync, args=(ctx,), daemon=False)
    thread.start()
    thread.join(timeout=EMAIL_THREAD_TIMEOUT)
    if thread.is_alive():
        logger.warning('Email thread for TripRequest #%s still running after %ss', ctx['pk'], EMAIL_THREAD_TIMEOUT)


def send_custom_tour_request_emails(custom_request):
    """
    Send email pair for a newly created CustomTourRequest.
    Uses a non-daemon thread with join() so Gunicorn cannot kill it mid-send.
    """
    ctx = _custom_snapshot(custom_request)
    thread = threading.Thread(target=_send_custom_emails_sync, args=(ctx,), daemon=False)
    thread.start()
    thread.join(timeout=EMAIL_THREAD_TIMEOUT)
    if thread.is_alive():
        logger.warning('Email thread for CustomTourRequest #%s still running after %ss', ctx['pk'], EMAIL_THREAD_TIMEOUT)


# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------

def _clean_phone(phone):
    """Strip everything except digits from a phone number."""
    return re.sub(r'[^\d]', '', phone or '')


def _snapshot(tr):
    """Pull all needed values into a plain dict so the bg thread never touches the ORM."""
    return {
        'pk':                  tr.pk,
        'request_id':          tr.pk,
        'customer_name':       tr.customer_name,
        'customer_email':      tr.customer_email,
        'customer_phone':      tr.customer_phone,
        'customer_phone_clean': _clean_phone(tr.customer_phone),
        'tour_title':          tr.tour.title,
        'tour_location':       tr.tour.location,
        'tour_duration':       tr.tour.duration or 'N/A',
        'preferred_date':      tr.preferred_date.strftime('%B %d, %Y') if tr.preferred_date else 'Flexible',
        'adults':              tr.number_of_adults,
        'children':            tr.number_of_children,
        'infants':             tr.number_of_infants,
        'total_travellers':    tr.total_travellers,
        'special_requests':    tr.special_requests or '',
        # Branding
        'logo_url':            LOGO_URL,
        'company_email':       COMPANY_EMAIL,
        'whatsapp_number':     WHATSAPP_NUMBER,
        'admin_url':           getattr(settings, 'FRONTEND_URL', 'http://localhost:3000') + '/admin/trip-requests',
    }


def _send_emails_sync(ctx):
    """Runs in a background thread — opens its own SMTP connection."""
    from_email = settings.DEFAULT_FROM_EMAIL

    # ── Render HTML templates ─────────────────────────────────────────
    company_html  = render_to_string('emails/company_notification.html', ctx)
    company_text  = strip_tags(company_html)

    customer_html = render_to_string('emails/customer_confirmation.html', ctx)
    customer_text = strip_tags(customer_html)

    # ── Build email messages ──────────────────────────────────────────
    company_msg = EmailMultiAlternatives(
        subject=f"[New Trip Request] {ctx['tour_title']} — {ctx['customer_name']}",
        body=company_text,
        from_email=from_email,
        to=[COMPANY_EMAIL],
    )
    company_msg.attach_alternative(company_html, 'text/html')

    customer_msg = EmailMultiAlternatives(
        subject=f"Trip Request Received — {ctx['tour_title']} | 1957 The Ghana Experience",
        body=customer_text,
        from_email=from_email,
        to=[ctx['customer_email']],
    )
    customer_msg.attach_alternative(customer_html, 'text/html')

    # ── Send on a fresh connection ────────────────────────────────────
    try:
        logger.info(
            'Sending trip request emails for #%s — FROM: %s, TO_COMPANY: %s, TO_CUSTOMER: %s, HOST: %s:%s',
            ctx['pk'], from_email, COMPANY_EMAIL, ctx['customer_email'],
            settings.EMAIL_HOST, settings.EMAIL_PORT,
        )
        connection = get_connection(fail_silently=False)
        connection.open()
        sent = connection.send_messages([company_msg, customer_msg])
        connection.close()
        logger.info('Trip request emails sent for TripRequest #%s — %s message(s) delivered', ctx['pk'], sent)
    except Exception:
        logger.exception('Failed to send emails for TripRequest #%s', ctx['pk'])


# ---------------------------------------------------------------------------
# Custom Tour Request email internals
# ---------------------------------------------------------------------------

def _custom_snapshot(cr):
    """Pull all needed values for a CustomTourRequest into a plain dict."""
    return {
        'pk':                    cr.pk,
        'request_id':            cr.pk,
        'customer_name':         cr.customer_name,
        'customer_email':        cr.customer_email,
        'customer_phone':        cr.customer_phone,
        'customer_phone_clean':  _clean_phone(cr.customer_phone),
        'country':               cr.country or 'Not specified',
        'site_names':            list(cr.sites.values_list('name', flat=True)),
        'package_labels':        cr.package_labels,
        'preferred_start_date':  cr.preferred_start_date.strftime('%B %d, %Y') if cr.preferred_start_date else 'Flexible',
        'preferred_end_date':    cr.preferred_end_date.strftime('%B %d, %Y') if cr.preferred_end_date else '',
        'flexibility':           cr.get_flexibility_display() if hasattr(cr, 'get_flexibility_display') else cr.flexibility,
        'adults':                cr.number_of_adults,
        'children':              cr.number_of_children,
        'infants':               cr.number_of_infants,
        'total_travellers':      cr.total_travellers,
        'special_requests':      cr.special_requests or '',
        # Branding
        'logo_url':              LOGO_URL,
        'company_email':         COMPANY_EMAIL,
        'whatsapp_number':       WHATSAPP_NUMBER,
        'admin_url':             getattr(settings, 'FRONTEND_URL', 'http://localhost:3000') + '/admin/custom-tour-requests',
    }


def _send_custom_emails_sync(ctx):
    """Runs in a background thread — sends custom tour request emails."""
    from_email = settings.DEFAULT_FROM_EMAIL

    company_html  = render_to_string('emails/custom_tour_company.html', ctx)
    company_text  = strip_tags(company_html)

    customer_html = render_to_string('emails/custom_tour_customer.html', ctx)
    customer_text = strip_tags(customer_html)

    site_list = ', '.join(ctx['site_names'][:3])
    if len(ctx['site_names']) > 3:
        site_list += f' +{len(ctx["site_names"]) - 3} more'

    company_msg = EmailMultiAlternatives(
        subject=f"[Custom Tour Request] {site_list} — {ctx['customer_name']}",
        body=company_text,
        from_email=from_email,
        to=[COMPANY_EMAIL],
    )
    company_msg.attach_alternative(company_html, 'text/html')

    customer_msg = EmailMultiAlternatives(
        subject=f"Custom Tour Request Received | 1957 The Ghana Experience",
        body=customer_text,
        from_email=from_email,
        to=[ctx['customer_email']],
    )
    customer_msg.attach_alternative(customer_html, 'text/html')

    try:
        logger.info(
            'Sending custom tour emails for #%s — FROM: %s, TO_COMPANY: %s, TO_CUSTOMER: %s, HOST: %s:%s',
            ctx['pk'], from_email, COMPANY_EMAIL, ctx['customer_email'],
            settings.EMAIL_HOST, settings.EMAIL_PORT,
        )
        connection = get_connection(fail_silently=False)
        connection.open()
        sent = connection.send_messages([company_msg, customer_msg])
        connection.close()
        logger.info('Custom tour request emails sent for CustomTourRequest #%s — %s message(s) delivered', ctx['pk'], sent)
    except Exception:
        logger.exception('Failed to send emails for CustomTourRequest #%s', ctx['pk'])
