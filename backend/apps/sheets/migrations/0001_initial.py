from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SheetConfig",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120)),
                ("spreadsheet_id", models.CharField(max_length=255)),
                ("worksheet_name", models.CharField(max_length=120)),
                (
                    "credentials_json",
                    models.TextField(
                        blank=True,
                        help_text="TODO: replace with encrypted secret storage before production.",
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ("name",)},
        ),
    ]
