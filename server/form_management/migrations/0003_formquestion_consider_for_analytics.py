from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('form_management', '0002_alter_question_identifier_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='formquestion',
            name='consider_for_analytics',
            field=models.BooleanField(default=False),
        ),
    ]
