from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("bots", "0001_initial"),
        ("icps", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Lead",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("telegram_chat_id", models.CharField(max_length=120)),
                ("telegram_message_id", models.CharField(max_length=120)),
                ("raw_text", models.TextField()),
                (
                    "decision",
                    models.CharField(
                        choices=[
                            ("qualified", "Qualified"),
                            ("not_qualified", "Not qualified"),
                            ("uncertain", "Uncertain"),
                            ("failed", "Failed"),
                        ],
                        default="uncertain",
                        max_length=20,
                    ),
                ),
                ("reason", models.TextField(blank=True)),
                ("confidence", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("extracted_data", models.JSONField(blank=True, default=dict)),
                ("llm_provider", models.CharField(blank=True, max_length=50)),
                ("llm_model", models.CharField(blank=True, max_length=120)),
                ("input_tokens", models.PositiveIntegerField(default=0)),
                ("output_tokens", models.PositiveIntegerField(default=0)),
                ("estimated_cost", models.DecimalField(blank=True, decimal_places=4, max_digits=10, null=True)),
                (
                    "sheet_status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("success", "Success"),
                            ("failed", "Failed"),
                            ("skipped", "Skipped"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("bot", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="leads", to="bots.bot")),
                (
                    "icp",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="leads",
                        to="icps.icp",
                    ),
                ),
                (
                    "prompt_template",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.deletion.SET_NULL,
                        related_name="leads",
                        to="icps.prompttemplate",
                    ),
                ),
            ],
            options={"ordering": ("-created_at",)},
        ),
        migrations.AddIndex(
            model_name="lead",
            index=models.Index(fields=["bot", "created_at"], name="leads_lead_bot_id_745233_idx"),
        ),
        migrations.AddIndex(
            model_name="lead",
            index=models.Index(fields=["decision"], name="leads_lead_decisio_f1bb56_idx"),
        ),
        migrations.AddIndex(
            model_name="lead",
            index=models.Index(fields=["sheet_status"], name="leads_lead_sheet_s_eb84c9_idx"),
        ),
    ]
