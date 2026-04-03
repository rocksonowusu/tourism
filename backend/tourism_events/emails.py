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


def send_event_request_emails(event_request):
    """
    Send email pair for a newly created EventRequest.
    Uses a non-daemon thread with join() so Gunicorn cannot kill it mid-send.
    """
    ctx = _event_request_snapshot(event_request)
    thread = threading.Thread(target=_send_event_request_emails_sync, args=(ctx,), daemon=False)
    thread.start()
    thread.join(timeout=EMAIL_THREAD_TIMEOUT)
    if thread.is_alive():
        logger.warning('Email thread for EventRequest #%s still running after %ss', ctx['pk'], EMAIL_THREAD_TIMEOUT)


def send_event_booking_emails(booking):
    """
    Send email pair for a newly created EventBooking (quick booking from
    the event detail page).
    Uses a non-daemon thread with join() so Gunicorn cannot kill it mid-send.
    """
    ctx = _event_booking_snapshot(booking)
    thread = threading.Thread(target=_send_event_booking_emails_sync, args=(ctx,), daemon=False)
    thread.start()
    thread.join(timeout=EMAIL_THREAD_TIMEOUT)
    if thread.is_alive():
        logger.warning('Email thread for EventBooking #%s still running after %ss', ctx['pk'], EMAIL_THREAD_TIMEOUT)


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
        reply_to=[COMPANY_EMAIL],
        bcc=[COMPANY_EMAIL],
    )
    customer_msg.attach_alternative(customer_html, 'text/html')

    # ── Send on a fresh connection ────────────────────────────────────
    logger.info(
        'Sending trip request emails for #%s — FROM: %s, TO_COMPANY: %s, TO_CUSTOMER: %s',
        ctx['pk'], from_email, COMPANY_EMAIL, ctx['customer_email'],
    )

    sent = 0
    for label, msg in [('company', company_msg), ('customer+bcc', customer_msg)]:
        try:
            connection = get_connection(fail_silently=False)
            connection.open()
            result = connection.send_messages([msg])
            connection.close()
            sent += result or 0
            logger.info('TripRequest #%s — %s email sent', ctx['pk'], label)
        except Exception:
            logger.exception('TripRequest #%s — failed to send %s email', ctx['pk'], label)

    logger.info('Trip request emails for #%s — %s of 2 delivered', ctx['pk'], sent)


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
        reply_to=[COMPANY_EMAIL],
        bcc=[COMPANY_EMAIL],
    )
    customer_msg.attach_alternative(customer_html, 'text/html')

    logger.info(
        'Sending custom tour emails for #%s — FROM: %s, TO_COMPANY: %s, TO_CUSTOMER: %s',
        ctx['pk'], from_email, COMPANY_EMAIL, ctx['customer_email'],
    )

    sent = 0
    for label, msg in [('company', company_msg), ('customer+bcc', customer_msg)]:
        try:
            connection = get_connection(fail_silently=False)
            connection.open()
            result = connection.send_messages([msg])
            connection.close()
            sent += result or 0
            logger.info('CustomTourRequest #%s — %s email sent', ctx['pk'], label)
        except Exception:
            logger.exception('CustomTourRequest #%s — failed to send %s email', ctx['pk'], label)

    logger.info('Custom tour request emails for #%s — %s of 2 delivered', ctx['pk'], sent)


# ---------------------------------------------------------------------------
# Event Request email internals  (Phase 4)
# ---------------------------------------------------------------------------

def _event_request_snapshot(er):
    """Pull all needed values for an EventRequest into a plain dict."""
    return {
        'pk':                      er.pk,
        'request_id':              er.pk,
        'customer_name':           er.customer_name,
        'customer_email':          er.customer_email,
        'customer_phone':          er.customer_phone,
        'customer_phone_clean':    _clean_phone(er.customer_phone),
        'event_type':              er.get_event_type_display(),
        'preferred_date':          er.preferred_date.strftime('%B %d, %Y') if er.preferred_date else 'Flexible',
        'expected_attendees':      er.expected_attendees,
        'location_preference':     er.location_preference or 'Not specified',
        'budget_range':            er.budget_range or 'Not specified',
        'activities_interested_in': er.activities_interested_in or [],
        'special_requirements':    er.special_requirements or '',
        # Branding
        'logo_url':                LOGO_URL,
        'company_email':           COMPANY_EMAIL,
        'whatsapp_number':         WHATSAPP_NUMBER,
        'admin_url':               getattr(settings, 'FRONTEND_URL', 'http://localhost:3000') + '/admin/event-requests',
    }


def _send_event_request_emails_sync(ctx):
    """Runs in a background thread — sends event request emails."""
    from_email = settings.DEFAULT_FROM_EMAIL

    company_html  = render_to_string('emails/event_request_company.html', ctx)
    company_text  = strip_tags(company_html)

    customer_html = render_to_string('emails/event_request_customer.html', ctx)
    customer_text = strip_tags(customer_html)

    company_msg = EmailMultiAlternatives(
        subject=f"[New Event Request] {ctx['event_type']} — {ctx['customer_name']}",
        body=company_text,
        from_email=from_email,
        to=[COMPANY_EMAIL],
    )
    company_msg.attach_alternative(company_html, 'text/html')

    # BCC the company on the customer email so the company always gets a
    # copy even when the from-address domain hasn't been verified in Resend
    # (Resend's free-tier test sender can only deliver to the account owner).
    customer_msg = EmailMultiAlternatives(
        subject=f"Event Request Received — {ctx['event_type']} | 1957 The Ghana Experience",
        body=customer_text,
        from_email=from_email,
        to=[ctx['customer_email']],
        reply_to=[COMPANY_EMAIL],
        bcc=[COMPANY_EMAIL],
    )
    customer_msg.attach_alternative(customer_html, 'text/html')

    logger.info(
        'Sending event request emails for #%s — FROM: %s, TO_COMPANY: %s, TO_CUSTOMER: %s',
        ctx['pk'], from_email, COMPANY_EMAIL, ctx['customer_email'],
    )

    sent = 0
    # Send the company-specific email first (may fail on Resend free tier)
    for label, msg in [('company', company_msg), ('customer+bcc', customer_msg)]:
        try:
            connection = get_connection(fail_silently=False)
            connection.open()
            result = connection.send_messages([msg])
            connection.close()
            sent += result or 0
            logger.info('EventRequest #%s — %s email sent', ctx['pk'], label)
        except Exception:
            logger.exception('EventRequest #%s — failed to send %s email', ctx['pk'], label)

    logger.info('Event request emails for #%s — %s of 2 delivered', ctx['pk'], sent)


# ---------------------------------------------------------------------------
# Event Booking email internals  (quick booking from event detail page)
# ---------------------------------------------------------------------------

def _event_booking_snapshot(booking):
    """Pull all needed values for an EventBooking into a plain dict."""
    return {
        'pk':                  booking.pk,
        'booking_id':          booking.pk,
        'customer_name':       booking.customer_name,
        'customer_email':      booking.customer_email,
        'customer_phone':      booking.customer_phone,
        'customer_phone_clean': _clean_phone(booking.customer_phone),
        'number_of_guests':    booking.number_of_guests,
        'special_requests':    booking.special_requests or '',
        'event_title':         booking.event.title,
        'event_date':          booking.event.date.strftime('%A, %B %d, %Y at %I:%M %p') if booking.event.date else 'TBA',
        'event_location':      booking.event.location,
        'event_slug':          booking.event.slug,
        # Branding
        'logo_url':            LOGO_URL,
        'company_email':       COMPANY_EMAIL,
        'whatsapp_number':     WHATSAPP_NUMBER,
        'admin_url':           getattr(settings, 'FRONTEND_URL', 'http://localhost:3000') + '/admin/event-bookings',
    }


def _send_event_booking_emails_sync(ctx):
    """Runs in a background thread — sends event booking emails."""
    from_email = settings.DEFAULT_FROM_EMAIL

    company_html  = render_to_string('emails/event_booking_company.html', ctx)
    company_text  = strip_tags(company_html)

    customer_html = render_to_string('emails/event_booking_customer.html', ctx)
    customer_text = strip_tags(customer_html)

    company_msg = EmailMultiAlternatives(
        subject=f"[New Event Booking] {ctx['event_title']} — {ctx['customer_name']} ({ctx['number_of_guests']} guest{'s' if ctx['number_of_guests'] != 1 else ''})",
        body=company_text,
        from_email=from_email,
        to=[COMPANY_EMAIL],
    )
    company_msg.attach_alternative(company_html, 'text/html')

    customer_msg = EmailMultiAlternatives(
        subject=f"Booking Confirmed — {ctx['event_title']} | 1957 The Ghana Experience",
        body=customer_text,
        from_email=from_email,
        to=[ctx['customer_email']],
        reply_to=[COMPANY_EMAIL],
        bcc=[COMPANY_EMAIL],
    )
    customer_msg.attach_alternative(customer_html, 'text/html')

    logger.info(
        'Sending event booking emails for #%s — FROM: %s, TO_COMPANY: %s, TO_CUSTOMER: %s',
        ctx['pk'], from_email, COMPANY_EMAIL, ctx['customer_email'],
    )

    sent = 0
    for label, msg in [('company', company_msg), ('customer+bcc', customer_msg)]:
        try:
            connection = get_connection(fail_silently=False)
            connection.open()
            result = connection.send_messages([msg])
            connection.close()
            sent += result or 0
            logger.info('EventBooking #%s — %s email sent', ctx['pk'], label)
        except Exception:
            logger.exception('EventBooking #%s — failed to send %s email', ctx['pk'], label)

    logger.info('Event booking emails for #%s — %s of 2 delivered', ctx['pk'], sent)
