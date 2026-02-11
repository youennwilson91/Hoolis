# Generated manually to remove Cart and CartItem models

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0008_order_stripe_session_id'),
    ]

    operations = [
        migrations.RunSQL(
            sql="DROP TABLE IF EXISTS store_cartitem CASCADE;",
            reverse_sql="",  # Irreversible
        ),
        migrations.RunSQL(
            sql="DROP TABLE IF EXISTS store_cart CASCADE;",
            reverse_sql="",  # Irreversible
        ),
    ]
