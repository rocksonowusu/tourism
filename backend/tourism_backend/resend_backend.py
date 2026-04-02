"""
Custom Django email backend that sends via Resend's HTTP API.

This replaces SMTP entirely — no outbound socket connections needed,
so it works on platforms like Render that block SMTP ports.

Usage in settings.py:
    EMAIL_BACKEND = 'tourism_backend.resend_backend.ResendEmailBackend'
    RESEND_API_KEY = os.getenv('RESEND_API_KEY', '')
"""

import logging
import resend
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)


class ResendEmailBackend(BaseEmailBackend):
    """
    A Django email backend that uses the Resend HTTP API.
    Works as a drop-in replacement — all existing EmailMultiAlternatives
    code works without changes.
    """

    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, 'RESEND_API_KEY', '')

    def open(self):
        if not self.api_key:
            if not self.fail_silently:
                raise ValueError('RESEND_API_KEY is not set in Django settings.')
            return False
        resend.api_key = self.api_key
        return True

    def close(self):
        pass

    def send_messages(self, email_messages):
        if not self.api_key:
            if not self.fail_silently:
                raise ValueError('RESEND_API_KEY is not set in Django settings.')
            return 0

        resend.api_key = self.api_key
        sent_count = 0

        for message in email_messages:
            try:
                params = {
                    'from_': message.from_email or settings.DEFAULT_FROM_EMAIL,
                    'to': list(message.to),
                    'subject': message.subject,
                    'text': message.body,
                }

                # Check for HTML alternative
                for content, mimetype in getattr(message, 'alternatives', []):
                    if mimetype == 'text/html':
                        params['html'] = content
                        break

                # Add CC / BCC if present
                if message.cc:
                    params['cc'] = list(message.cc)
                if message.bcc:
                    params['bcc'] = list(message.bcc)
                if message.reply_to:
                    params['reply_to'] = list(message.reply_to)

                # Resend SDK uses 'from_' but their Emails.send() expects 'from'
                send_params = {
                    'from': params.pop('from_'),
                    'to': params['to'],
                    'subject': params['subject'],
                }
                if 'html' in params:
                    send_params['html'] = params['html']
                if 'text' in params:
                    send_params['text'] = params.get('text', '')
                if 'cc' in params:
                    send_params['cc'] = params['cc']
                if 'bcc' in params:
                    send_params['bcc'] = params['bcc']
                if 'reply_to' in params:
                    # Resend expects reply_to as a string
                    send_params['reply_to'] = params['reply_to'][0] if params['reply_to'] else None

                result = resend.Emails.send(send_params)
                logger.info(
                    'Resend email sent: to=%s, subject="%s", id=%s',
                    send_params['to'], send_params['subject'],
                    getattr(result, 'id', result.get('id', '?')) if isinstance(result, dict) else getattr(result, 'id', '?'),
                )
                sent_count += 1

            except Exception as e:
                logger.exception(
                    'Resend email failed: to=%s, subject="%s", error=%s',
                    list(message.to), message.subject, e,
                )
                if not self.fail_silently:
                    raise

        return sent_count
