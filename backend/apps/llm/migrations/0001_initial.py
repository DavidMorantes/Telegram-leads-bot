from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="LLMProviderConfig",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "provider",
                    models.CharField(
                        choices=[
                            ("groq", "Groq"),
                            ("openai", "OpenAI"),
                            ("anthropic", "Anthropic"),
                            ("gemini", "Gemini"),
                            ("mock", "Mock"),
                        ],
                        max_length=30,
                    ),
                ),
                ("name", models.CharField(max_length=120)),
                ("model", models.CharField(max_length=120)),
                (
                    "api_key",
                    models.CharField(
                        blank=True,
                        help_text="TODO: replace with encrypted secret storage before production.",
                        max_length=255,
                    ),
                ),
                ("base_url", models.URLField(blank=True)),
                ("temperature", models.DecimalField(decimal_places=2, default=0.2, max_digits=4)),
                ("max_tokens", models.PositiveIntegerField(default=512)),
                ("timeout_seconds", models.PositiveIntegerField(default=30)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ("name",)},
        ),
    ]
