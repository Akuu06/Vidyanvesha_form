from django.db import models
from commons.models import TimeStampedAuditModel
from .secondary_db_helper import SecondaryDatabaseHelper


# Create your models here.
# Local models for vidyanvesha_form can be added here
# Secondary models from vidyanvesha_core are accessed via database routing
class Form(TimeStampedAuditModel):

    public_id = models.UUIDField(unique=True, db_index=True)
    # Public safe ID for API URLs → example: "8b52f0c4-9b2e..."

    title = models.CharField(max_length=300)
    # example: "Semester 3 Internal Test"

    description = models.TextField(blank=True)
    # example: "Physics unit 1–3 test"

    mode_choices = [
        ("normal_form", "Normal Form"),
        ("quiz", "Quiz"),
    ]

    mode = models.CharField(max_length=20, choices=mode_choices, default="normal_form")
    # "form" OR "quiz"

    status_choices = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("closed", "Closed"),
    ]

    status = models.CharField(max_length=20, choices=status_choices, default="draft")
    # draft / published / closed

    # ---------- ACCESS ----------
    is_public = models.BooleanField(default=False)
    # example: True → shareable public link

    login_required = models.BooleanField(default=True)
    # True for exams

    allow_anonymous = models.BooleanField(default=False)

    # ---------- TIME WINDOW ----------
    start_date = models.DateTimeField(null=True, blank=True)
    # example: 2026-03-01 09:00

    end_date = models.DateTimeField(null=True, blank=True)

    grace_minutes = models.IntegerField(default=0)
    # example: 10 extra minutes allowed

    # ---------- ATTEMPTS ----------
    max_attempts = models.IntegerField(default=1)
    # example: 1 for exam, 3 for practice quiz

    cooldown_minutes = models.IntegerField(default=0)

    # ---------- TIMER ----------
    time_limit_minutes = models.IntegerField(null=True, blank=True)
    # example: 60

    timer_starts_on = models.CharField(max_length=30, default="first_question")
    # "open" OR "first_question"

    auto_submit_on_close = models.BooleanField(default=True)

    # ---------- NAVIGATION ----------
    allow_back_navigation = models.BooleanField(default=True)
    # False → strict competitive exam

    one_question_per_page = models.BooleanField(default=False)

    show_progress_bar = models.BooleanField(default=True)

    enable_review_page = models.BooleanField(default=True)

    # ---------- SHUFFLING ----------
    shuffle_questions = models.BooleanField(default=False)

    shuffle_options_globally = models.BooleanField(default=False)

    # ---------- SCORING ----------
    passing_marks = models.FloatField(null=True, blank=True)
    # example: 40

    enable_negative_marking = models.BooleanField(default=False)

    round_score_to = models.IntegerField(default=2)
    # decimal precision

    # ---------- RESULT DISPLAY ----------
    show_result_immediately = models.BooleanField(default=False)

    show_correct_answers = models.BooleanField(default=False)

    show_explanations = models.BooleanField(default=False)

    show_score_breakup = models.BooleanField(default=False)

    # ---------- AUTOSAVE ----------
    auto_save_answers = models.BooleanField(default=True)

    save_interval_seconds = models.IntegerField(default=5)

    # ---------- SECURITY ----------
    record_ip_address = models.BooleanField(default=True)

    detect_tab_switch = models.BooleanField(default=False)

    require_fullscreen = models.BooleanField(default=False)

    webcam_required = models.BooleanField(default=False)

    disable_copy_paste = models.BooleanField(default=False)

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    @property
    def institute(self):
        """Get institute object from secondary database"""
        return SecondaryDatabaseHelper.get_institute(self.institute_id)
    
    @property
    def university(self):
        """Get university object from secondary database"""
        return SecondaryDatabaseHelper.get_university(self.university_id)

    def __str__(self):
        return self.title


class FormSection(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="sections")

    title = models.CharField(max_length=200)
    # example: "Part A — MCQ"

    description = models.TextField(blank=True)

    order = models.IntegerField()
    # example: 1,2,3

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['order']

    def __str__(self):
        return f"{self.form.title} - {self.title}"


class FormQuestion(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="questions")

    section = models.ForeignKey(FormSection, null=True, blank=True, on_delete=models.CASCADE, related_name="questions")

    question_id = models.IntegerField(db_index=True)
    # from question microservice
    consider_for_analytics = models.BooleanField(default=False)

    order = models.IntegerField()
    # display order

    is_required = models.BooleanField(default=True)

    # scoring override
    marks = models.FloatField(default=1)
    negative_marks = models.FloatField(default=0)

    shuffle_options_override = models.BooleanField(null=True, blank=True)
    # None → inherit form setting

    # optional time limit per question
    time_limit_seconds = models.IntegerField(null=True, blank=True)

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order} - {self.form.title}"


class QuestionPool(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="question_pools")

    name = models.CharField(max_length=200)
    # example: "Math Question Bank"

    pick_count = models.IntegerField()
    # example: pick 10

    shuffle_questions = models.BooleanField(default=True)

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    def __str__(self):
        return f"{self.name} - {self.form.title}"


class QuestionLogic(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="question_logic")

    source_question_id = models.IntegerField()

    expected_answer = models.TextField()
    # example: "YES"

    target_question_id = models.IntegerField()

    action = models.CharField(max_length=50)
    # show / hide / jump_section / jump_question

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    def __str__(self):
        return f"Logic: {self.source_question_id} -> {self.action} {self.target_question_id}"


class FormResponse(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="responses")

    user_id = models.UUIDField(null=True, db_index=True)
    # example: student UUID

    attempt_number = models.IntegerField(default=1)

    started_at = models.DateTimeField()

    submitted_at = models.DateTimeField(null=True)

    total_time_seconds = models.IntegerField(default=0)

    score = models.FloatField(default=0)

    passed = models.BooleanField(default=False)

    is_completed = models.BooleanField(default=False)

    ip_address = models.GenericIPAddressField(null=True)

    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.form.title} - Attempt {self.attempt_number} - Score: {self.score}"


class FormAnswer(TimeStampedAuditModel):

    response = models.ForeignKey(FormResponse, on_delete=models.CASCADE, related_name="answers")

    question_id = models.IntegerField(db_index=True)

    answer_text = models.TextField(null=True, blank=True)
    # example: "Newton's second law"

    selected_option_ids = models.JSONField(null=True, blank=True)
    # example: ["opt_1","opt_3"]

    displayed_option_order = models.JSONField(null=True, blank=True)
    # saves shuffled order

    time_spent_seconds = models.IntegerField(default=0)

    is_correct = models.BooleanField(null=True)

    marks_awarded = models.FloatField(default=0)

    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    def __str__(self):
        return f"Answer to Q{self.question_id} - Response {self.response.id}"


class ResponseFileUpload(TimeStampedAuditModel):

    response = models.ForeignKey(FormResponse, on_delete=models.CASCADE, related_name="file_uploads")

    question_id = models.IntegerField(db_index=True)

    file_path = models.TextField()

    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    def __str__(self):
        return f"File Upload - Q{self.question_id} - Response {self.response.id}"


class FormAccessRule(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="access_rules")

    allowed_email_domain = models.CharField(max_length=200, blank=True)
    # example: "vesit.edu"

    allowed_user_group_id = models.UUIDField(null=True)

    otp_required = models.BooleanField(default=False)

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    def __str__(self):
        return f"Access Rule - {self.form.title} - {self.allowed_email_domain}"


class FormAttemptLog(TimeStampedAuditModel):

    response = models.ForeignKey(FormResponse, on_delete=models.CASCADE, related_name="attempt_logs")

    event_type = models.CharField(max_length=100)
    # TAB_SWITCH / FULLSCREEN_EXIT

    timestamp = models.DateTimeField(auto_now_add=True)

    ip_address = models.GenericIPAddressField(null=True)

    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event_type} - Response {self.response.id} at {self.timestamp}"


class QuestionAnalytics(TimeStampedAuditModel):

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="question_analytics")

    question_id = models.IntegerField(db_index=True)

    total_attempts = models.IntegerField(default=0)

    correct_attempts = models.IntegerField(default=0)

    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    @property
    def accuracy_percentage(self):
        """Calculate accuracy percentage"""
        if self.total_attempts == 0:
            return 0
        return (self.correct_attempts / self.total_attempts) * 100

    def __str__(self):
        return f"Analytics - Q{self.question_id} - {self.accuracy_percentage:.2f}% accuracy"


class QuestionSnapshot(TimeStampedAuditModel):
    form_question = models.OneToOneField(FormQuestion, on_delete=models.CASCADE)
    question_text = models.TextField()
    question_type = models.CharField(max_length=100)
    options_snapshot = models.JSONField(null=True, blank=True)

    # ---------- META ----------
    institute_id = models.IntegerField(null=True, db_index=True)  # References institutes in secondary DB

    university_id = models.IntegerField(null=True, db_index=True)  # References universities in secondary DB

    class Meta:
        app_label = 'form_management'
        ordering = ['-created_dt']

    def __str__(self):
        return f"Snapshot - Q{self.form_question.question_id} - {self.form_question.form.title}"