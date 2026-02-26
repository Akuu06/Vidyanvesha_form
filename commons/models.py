from django.db import models

class TimeStampedAuditModel(models.Model):
    created_dt = models.DateTimeField(auto_now_add=True)
    updated_dt = models.DateTimeField(auto_now=True)

    # Store user IDs as integers - users are in vidyanvesha_core (secondary database)
    # NOT in vidyanvesha_form primary database
    created_by = models.IntegerField(
        null=True,
        blank=True,
        help_text="References user ID from vidyanvesha_core database"
    )
    updated_by = models.IntegerField(
        null=True,
        blank=True,
        help_text="References user ID from vidyanvesha_core database"
    )

    class Meta:
        abstract = True
