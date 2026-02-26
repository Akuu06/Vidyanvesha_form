from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login, api_root,
    FormViewSet, FormSectionViewSet, FormQuestionViewSet,
    QuestionPoolViewSet, QuestionLogicViewSet,
    FormResponseViewSet, FormAnswerViewSet,
    ResponseFileUploadViewSet, FormAccessRuleViewSet,
    FormAttemptLogViewSet, QuestionAnalyticsViewSet, QuestionSnapshotViewSet
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'forms', FormViewSet, basename='forms')
router.register(r'form-sections', FormSectionViewSet, basename='form_sections')
router.register(r'form-questions', FormQuestionViewSet, basename='form_questions')
router.register(r'question-pools', QuestionPoolViewSet, basename='question_pools')
router.register(r'question-logic', QuestionLogicViewSet, basename='question_logic')
router.register(r'form-responses', FormResponseViewSet, basename='form_responses')
router.register(r'form-answers', FormAnswerViewSet, basename='form_answers')
router.register(r'file-uploads', ResponseFileUploadViewSet, basename='file_uploads')
router.register(r'access-rules', FormAccessRuleViewSet, basename='access_rules')
router.register(r'attempt-logs', FormAttemptLogViewSet, basename='attempt_logs')
router.register(r'question-analytics', QuestionAnalyticsViewSet, basename='question_analytics')
router.register(r'question-snapshots', QuestionSnapshotViewSet, basename='question_snapshots')

urlpatterns = [
    path('', api_root, name='api-root'),
    path('login/', login, name='login'),
    path('', include(router.urls)),
]
