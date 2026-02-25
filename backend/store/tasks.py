import logging
from celery import shared_task
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_confirmation_email(self, subject, message, from_email, recipient_list, html_message):
    try:
        send_mail(subject, message, from_email, recipient_list, html_message=html_message)
        logger.info(f"Email envoyé à {recipient_list}")
    except Exception as exc:
        logger.error(f"Erreur envoi email, retry {self.request.retries}/3 : {exc}")
        raise self.retry(exc=exc)
