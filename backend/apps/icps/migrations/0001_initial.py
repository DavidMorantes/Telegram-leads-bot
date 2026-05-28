from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ICP",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                ("min_employees", models.PositiveIntegerField(blank=True, null=True)),
                ("allowed_regions", models.JSONField(blank=True, default=list)),
                ("allowed_industries", models.JSONField(blank=True, default=list)),
                ("required_interests", models.JSONField(blank=True, default=list)),
                ("exclusion_rules", models.JSONField(blank=True, default=list)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ("name",)},
        ),
        migrations.CreateModel(
            name="PromptTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120)),
                ("system_prompt", models.TextField()),
                ("output_schema", models.JSONField(blank=True, default=dict)),
                ("version", models.CharField(default="v1", max_length=50)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "icp",
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="prompt_templates", to="icps.icp"),
                ),
            ],
            options={
                "ordering": ("icp__name", "name", "-created_at"),
                "unique_together": {("icp", "name", "version")},
            },
        ),
    ]
