import logging
import time
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_order_confirmation_email(subject, message, from_email, recipient_list, html_message):
    for attempt in range(3):
        try:
            send_mail(subject, message, from_email, recipient_list, html_message=html_message)
            logger.info(f"Email envoyé à {recipient_list}")
            return
        except Exception as exc:
            logger.error(f"Tentative {attempt + 1}/3 échouée : {exc}")
            if attempt < 2:
                time.sleep(2 ** attempt)
    logger.error(f"Email définitivement échoué après 3 tentatives vers {recipient_list}")
