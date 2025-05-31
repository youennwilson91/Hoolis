import time
import logging

logger = logging.getLogger(__name__)

def process_order(order_id):
    """
    Process an order synchronously
    """
    logger.info(f"Starting to process order {order_id}")
    # Simuler un traitement qui prend du temps
    time.sleep(5)
    logger.info(f"Order {order_id} has been processed successfully")
    return f"Order {order_id} processed successfully" 