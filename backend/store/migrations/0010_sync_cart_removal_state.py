# Closes the migration state gap left by 0009_remove_cart_models, which
# dropped the Cart/CartItem tables via RunSQL without updating Django's
# model state. No database changes here — the tables are already gone.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0009_remove_cart_models'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.RemoveField(
                    model_name='cartitem',
                    name='cart',
                ),
                migrations.AlterUniqueTogether(
                    name='cartitem',
                    unique_together=None,
                ),
                migrations.RemoveField(
                    model_name='cartitem',
                    name='product',
                ),
                migrations.DeleteModel(
                    name='Cart',
                ),
                migrations.DeleteModel(
                    name='CartItem',
                ),
            ],
        ),
    ]
