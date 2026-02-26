"""
Database router to direct reads/writes to the correct database.
Models from vidyanvesha_core apps go to 'secondary' database.
"""

SECONDARY_APPS = [
    'commons',
    'institutes_management',
    'universities_management',
    'programs_management',
    'departments_management',
    'academic_domains_management',
    'academic_sessions_management',
    'account_management',
    'classes_management',
    'load_management',
    'students_management',
    'teaching_staff_management',
    'courses_management',
    'deliverables_management',
    'exam_categories_management',
    'events_management',
    'committees_management',
    'module_management',
    'student_attendance_management',
]


class SecondaryDatabaseRouter:
    """
    A router to control all database operations on models from vidyanvesha_core apps.
    """

    def db_for_read(self, model, **hints):
        """
        Attempts to read models from vidyanvesha_core should go to secondary.
        """
        if model._meta.app_label in SECONDARY_APPS:
            return 'secondary'
        return 'default'

    def db_for_write(self, model, **hints):
        """
        Attempts to write models from vidyanvesha_core should go to secondary.
        """
        if model._meta.app_label in SECONDARY_APPS:
            return 'secondary'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between models in the same database.
        """
        db1 = self.db_for_read(type(obj1), **hints)
        db2 = self.db_for_read(type(obj2), **hints)
        return db1 == db2

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure that apps in SECONDARY_APPS only migrate on secondary database.
        All other apps only migrate on default database.
        """
        if app_label in SECONDARY_APPS:
            # Secondary apps can ONLY migrate on 'secondary' database
            return db == 'secondary'
        else:
            # All other apps can ONLY migrate on 'default' database
            return db == 'default'
