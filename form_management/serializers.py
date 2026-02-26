"""
REST API Serializers for form_management app
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Form, FormSection, FormQuestion, QuestionPool, QuestionLogic,
    FormResponse, FormAnswer, ResponseFileUpload,
    FormAccessRule, FormAttemptLog, QuestionAnalytics, QuestionSnapshot
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


# ============ Form Serializers ============

class FormListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Form list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Form
        fields = [
            'id', 'public_id', 'title', 'mode', 'status',
            'start_date', 'end_date', 'max_attempts',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'public_id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormSerializer(serializers.ModelSerializer):
    """Full serializer for Form detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    question_count = serializers.SerializerMethodField()
    response_count = serializers.SerializerMethodField()

    class Meta:
        model = Form
        fields = [
            'id', 'public_id', 'title', 'description', 'mode', 'status',
            'is_public', 'login_required', 'allow_anonymous',
            'start_date', 'end_date', 'grace_minutes',
            'max_attempts', 'cooldown_minutes',
            'time_limit_minutes', 'timer_starts_on', 'auto_submit_on_close',
            'allow_back_navigation', 'one_question_per_page', 'show_progress_bar', 'enable_review_page',
            'shuffle_questions', 'shuffle_options_globally',
            'passing_marks', 'enable_negative_marking', 'round_score_to',
            'show_result_immediately', 'show_correct_answers', 'show_explanations', 'show_score_breakup',
            'auto_save_answers', 'save_interval_seconds',
            'record_ip_address', 'detect_tab_switch', 'require_fullscreen', 'webcam_required', 'disable_copy_paste',
            'institute_id', 'university_id', 'question_count', 'response_count',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'public_id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt', 'question_count', 'response_count']

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_response_count(self, obj):
        return obj.responses.count()


# ============ FormSection Serializers ============

class FormSectionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for FormSection list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = FormSection
        fields = [
            'id', 'form', 'form_title', 'title', 'order',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormSectionSerializer(serializers.ModelSerializer):
    """Full serializer for FormSection detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = FormSection
        fields = [
            'id', 'form', 'form_title', 'title', 'description', 'order',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ FormQuestion Serializers ============

class FormQuestionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for FormQuestion list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)
    section_title = serializers.CharField(source='section.title', read_only=True)

    class Meta:
        model = FormQuestion
        fields = [
            'id', 'form', 'form_title', 'section', 'section_title',
            'question_id', 'consider_for_analytics', 'order', 'marks',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormQuestionSerializer(serializers.ModelSerializer):
    """Full serializer for FormQuestion detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)
    section_title = serializers.CharField(source='section.title', read_only=True)

    class Meta:
        model = FormQuestion
        fields = [
            'id', 'form', 'form_title', 'section', 'section_title',
            'question_id', 'consider_for_analytics', 'order', 'is_required', 'marks', 'negative_marks',
            'shuffle_options_override', 'time_limit_seconds',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ QuestionPool Serializers ============

class QuestionPoolListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for QuestionPool list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = QuestionPool
        fields = [
            'id', 'form', 'form_title', 'name', 'pick_count',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class QuestionPoolSerializer(serializers.ModelSerializer):
    """Full serializer for QuestionPool detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = QuestionPool
        fields = [
            'id', 'form', 'form_title', 'name', 'pick_count', 'shuffle_questions',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ QuestionLogic Serializers ============

class QuestionLogicListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for QuestionLogic list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = QuestionLogic
        fields = [
            'id', 'form', 'form_title', 'source_question_id', 'action', 'target_question_id',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class QuestionLogicSerializer(serializers.ModelSerializer):
    """Full serializer for QuestionLogic detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = QuestionLogic
        fields = [
            'id', 'form', 'form_title', 'source_question_id', 'expected_answer',
            'target_question_id', 'action',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ FormAnswer Serializers ============

class FormAnswerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for FormAnswer list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = FormAnswer
        fields = [
            'id', 'response', 'question_id', 'is_correct', 'marks_awarded',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormAnswerSerializer(serializers.ModelSerializer):
    """Full serializer for FormAnswer detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = FormAnswer
        fields = [
            'id', 'response', 'question_id', 'answer_text', 'selected_option_ids',
            'displayed_option_order', 'time_spent_seconds', 'is_correct', 'marks_awarded',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ FormResponse Serializers ============

class FormResponseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for FormResponse list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = FormResponse
        fields = [
            'id', 'form', 'form_title', 'user_id', 'attempt_number',
            'started_at', 'submitted_at', 'score', 'passed', 'is_completed',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormResponseSerializer(serializers.ModelSerializer):
    """Full serializer for FormResponse detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)
    answer_count = serializers.SerializerMethodField()

    class Meta:
        model = FormResponse
        fields = [
            'id', 'form', 'form_title', 'user_id', 'attempt_number',
            'started_at', 'submitted_at', 'total_time_seconds',
            'score', 'passed', 'is_completed', 'ip_address', 'answer_count',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt', 'answer_count']

    def get_answer_count(self, obj):
        return obj.answers.count()


# ============ ResponseFileUpload Serializers ============

class ResponseFileUploadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for ResponseFileUpload list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = ResponseFileUpload
        fields = [
            'id', 'response', 'question_id', 'file_path',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class ResponseFileUploadSerializer(serializers.ModelSerializer):
    """Full serializer for ResponseFileUpload detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = ResponseFileUpload
        fields = [
            'id', 'response', 'question_id', 'file_path',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ FormAccessRule Serializers ============

class FormAccessRuleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for FormAccessRule list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = FormAccessRule
        fields = [
            'id', 'form', 'form_title', 'allowed_email_domain', 'otp_required',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormAccessRuleSerializer(serializers.ModelSerializer):
    """Full serializer for FormAccessRule detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)

    class Meta:
        model = FormAccessRule
        fields = [
            'id', 'form', 'form_title', 'allowed_email_domain', 'allowed_user_group_id', 'otp_required',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ FormAttemptLog Serializers ============

class FormAttemptLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for FormAttemptLog list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = FormAttemptLog
        fields = [
            'id', 'response', 'event_type', 'timestamp', 'ip_address',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']


class FormAttemptLogSerializer(serializers.ModelSerializer):
    """Full serializer for FormAttemptLog detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = FormAttemptLog
        fields = [
            'id', 'response', 'event_type', 'timestamp', 'ip_address',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']


# ============ QuestionAnalytics Serializers ============

class QuestionAnalyticsListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for QuestionAnalytics list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)
    accuracy_percentage = serializers.SerializerMethodField()

    class Meta:
        model = QuestionAnalytics
        fields = [
            'id', 'form', 'form_title', 'question_id',
            'total_attempts', 'correct_attempts', 'accuracy_percentage',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']

    def get_accuracy_percentage(self, obj):
        return obj.accuracy_percentage


class QuestionAnalyticsSerializer(serializers.ModelSerializer):
    """Full serializer for QuestionAnalytics detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    form_title = serializers.CharField(source='form.title', read_only=True)
    accuracy_percentage = serializers.SerializerMethodField()

    class Meta:
        model = QuestionAnalytics
        fields = [
            'id', 'form', 'form_title', 'question_id',
            'total_attempts', 'correct_attempts', 'accuracy_percentage',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']

    def get_accuracy_percentage(self, obj):
        return obj.accuracy_percentage


# ============ Question Snapshot Serializers ============

class QuestionSnapshotListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for QuestionSnapshot list view"""
    form_question_detail = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = QuestionSnapshot
        fields = [
            'id', 'form_question', 'form_question_detail', 'question_type',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'created_dt']

    def get_form_question_detail(self, obj):
        """Return basic form question info"""
        return {
            'id': obj.form_question.id,
            'form_id': obj.form_question.form.id,
            'form_title': obj.form_question.form.title,
            'question_id': obj.form_question.question_id,
            'order': obj.form_question.order
        }


class QuestionSnapshotSerializer(serializers.ModelSerializer):
    """Full serializer for QuestionSnapshot detail view"""
    form_question_detail = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = QuestionSnapshot
        fields = [
            'id', 'form_question', 'form_question_detail',
            'question_text', 'question_type', 'options_snapshot',
            'institute_id', 'university_id',
            'created_by', 'created_by_username', 'created_dt',
            'updated_by', 'updated_by_username', 'updated_dt'
        ]
        read_only_fields = ['id', 'institute_id', 'university_id', 'created_by', 'created_by_username', 'updated_by', 'updated_by_username', 'created_dt', 'updated_dt']

    def get_form_question_detail(self, obj):
        """Return complete form question info"""
        return {
            'id': obj.form_question.id,
            'form_id': obj.form_question.form.id,
            'form_title': obj.form_question.form.title,
            'form_status': obj.form_question.form.status,
            'question_id': obj.form_question.question_id,
            'order': obj.form_question.order,
            'is_required': obj.form_question.is_required,
            'marks': obj.form_question.marks,
            'consider_for_analytics': obj.form_question.consider_for_analytics
        }

