import logging
import time
import resend
from django.conf import settings

logger = logging.getLogger(__name__)


def send_order_confirmation_email(subject, message, from_email, recipient_list, html_message):
    resend.api_key = settings.RESEND_API_KEY

    for attempt in range(3):
        try:
            resend.Emails.send({
                "from": from_email,
                "to": recipient_list,
                "subject": subject,
                "html": html_message,
                "text": message,
            })
            logger.info(f"Email envoyé à {recipient_list}")
            return
        except Exception as exc:
            logger.error(f"Tentative {attempt + 1}/3 échouée : {exc}")
            if attempt < 2:
                time.sleep(2 ** attempt)
    logger.error(f"Email définitivement échoué après 3 tentatives vers {recipient_list}")
