from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("icps", "0001_initial"),
        ("llm", "0001_initial"),
        ("sheets", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Bot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120)),
                ("telegram_username", models.CharField(blank=True, max_length=120)),
                (
                    "telegram_token",
                    models.CharField(
                        help_text="TODO: replace with encrypted secret storage before production.",
                        max_length=255,
                    ),
                ),
                ("webhook_secret", models.CharField(blank=True, max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "default_icp",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="default_for_bots",
                        to="icps.icp",
                    ),
                ),
                (
                    "llm_provider_config",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="bots",
                        to="llm.llmproviderconfig",
                    ),
                ),
                (
                    "sheet_config",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="bots",
                        to="sheets.sheetconfig",
                    ),
                ),
            ],
            options={"ordering": ("name",)},
        ),
    ]
