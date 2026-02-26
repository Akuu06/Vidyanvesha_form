"""
REST API Views for form_management app
"""
import logging
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from commons.access_control import InstitutionAccessControlMixin, RoleBasedAccessControlMixin, DataAccessControlMixin
from .models import (
    Form, FormSection, FormQuestion, QuestionPool, QuestionLogic,
    FormResponse, FormAnswer, ResponseFileUpload,
    FormAccessRule, FormAttemptLog, QuestionAnalytics, QuestionSnapshot
)
from .serializers import (
    FormListSerializer, FormSerializer,
    FormSectionListSerializer, FormSectionSerializer,
    FormQuestionListSerializer, FormQuestionSerializer,
    QuestionPoolListSerializer, QuestionPoolSerializer,
    QuestionLogicListSerializer, QuestionLogicSerializer,
    FormResponseListSerializer, FormResponseSerializer,
    FormAnswerListSerializer, FormAnswerSerializer,
    ResponseFileUploadListSerializer, ResponseFileUploadSerializer,
    FormAccessRuleListSerializer, FormAccessRuleSerializer,
    FormAttemptLogListSerializer, FormAttemptLogSerializer,
    QuestionAnalyticsListSerializer, QuestionAnalyticsSerializer,
    QuestionSnapshotListSerializer, QuestionSnapshotSerializer
)
from .authentication import FirebaseAuthentication
from .secondary_db_helper import SecondaryDatabaseHelper

logger = logging.getLogger(__name__)


def get_user_audit_and_institution_data(user):
    """
    Extract user_id, institute_id, university_id from UserProxy or request.user.
    
    Returns:
        {
            'user_id': <int>,
            'firebase_uid': <str>,
            'institute_id': <int or None>,
            'university_id': <int or None>
        }
    """
    user_id = None
    firebase_uid = None
    
    # Extract user_id and firebase_uid from UserProxy (dict or object)
    if isinstance(user, dict):
        user_id = user.get('id') or user.get('user_id')
        firebase_uid = user.get('firebase_uid')
    else:
        user_id = getattr(user, 'id', None) or getattr(user, 'user_id', None)
        firebase_uid = getattr(user, 'firebase_uid', None)
    
    # Get institution data from user profile in secondary database
    institution_data = SecondaryDatabaseHelper.get_user_institution_data(
        user_id=user_id,
        firebase_uid=firebase_uid
    )
    
    return {
        'user_id': user_id,
        'firebase_uid': firebase_uid,
        'institute_id': institution_data.get('institute_id') if institution_data else None,
        'university_id': institution_data.get('university_id') if institution_data else None
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Firebase login endpoint for Form Management API
    
    Request body:
    {
        "firebase_token": "firebase_id_token"
    }
    
    Response:
    {
        "success": True,
        "user": {
            "id": 4,
            "username": "user@example.com",
            "email": "user@example.com",
            "firebase_uid": "fzhEyQ1IkxgDhbvpauUc7UgITKk2"
        },
        "allowed_urls": [...]
    }
    """
    try:
        firebase_token = request.data.get('firebase_token')
        
        if not firebase_token:
            return Response(
                {"error": "firebase_token is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate using Firebase token
        authenticator = FirebaseAuthentication()
        user_proxy = authenticator.authenticate_token(firebase_token)
        
        if not user_proxy:
            return Response(
                {"error": "Invalid firebase token"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Extract user info from UserProxy
        user_id = user_proxy.get('id') if isinstance(user_proxy, dict) else getattr(user_proxy, 'id', None)
        username = user_proxy.get('username') if isinstance(user_proxy, dict) else getattr(user_proxy, 'username', None)
        email = user_proxy.get('email') if isinstance(user_proxy, dict) else getattr(user_proxy, 'email', None)
        firebase_uid = user_proxy.get('firebase_uid') if isinstance(user_proxy, dict) else getattr(user_proxy, 'firebase_uid', None)
        
        # Get allowed URLs from access control
        audit_data = get_user_audit_and_institution_data(user_proxy)
        
        # For now, return all available endpoints (in production, use get_user_allowed_urls)
        allowed_urls_list = [
            {"path": "/api/forms/", "method": "GET"},
            {"path": "/api/forms/", "method": "POST"},
            {"path": "/api/form-sections/", "method": "GET"},
            {"path": "/api/form-questions/", "method": "GET"},
            {"path": "/api/question-pools/", "method": "GET"},
            {"path": "/api/form-responses/", "method": "GET"},
            {"path": "/api/form-answers/", "method": "GET"},
            {"path": "/api/question-analytics/", "method": "GET"},
        ]
        
        # Return response
        response_data = {
            "success": True,
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "firebase_uid": firebase_uid,
            },
            "allowed_urls": allowed_urls_list,
        }
        
        logger.info(f"[OK] Login successful for user {username}")
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"[ERROR] Login error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def api_root(request):
    """API root endpoint for form management"""
    return Response({
        'message': 'Welcome to Form Management API',
        'version': '1.0',
        'endpoints': {
            'forms': '/api/forms/',
            'form-sections': '/api/form-sections/',
            'form-questions': '/api/form-questions/',
            'question-pools': '/api/question-pools/',
            'question-logic': '/api/question-logic/',
            'form-responses': '/api/form-responses/',
            'form-answers': '/api/form-answers/',
            'file-uploads': '/api/file-uploads/',
            'access-rules': '/api/access-rules/',
            'attempt-logs': '/api/attempt-logs/',
            'question-analytics': '/api/question-analytics/',
            'login': '/api/login/'
        }
    }, status=status.HTTP_200_OK)


# ============ Form ViewSet ============

class FormViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """
    ViewSet for Form model
    
    Endpoints:
    - GET /api/forms/ - List all forms
    - POST /api/forms/ - Create a new form
    - GET /api/forms/{id}/ - Get form details
    - PUT /api/forms/{id}/ - Update a form
    - DELETE /api/forms/{id}/ - Delete a form
    - GET /api/forms/by-institute/{institute_id}/ - Filter by institute
    - GET /api/forms/published/ - Get only published forms
    - GET /api/forms/active/ - Get active forms (within date window)
    """
    queryset = Form.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'mode', 'institute_id', 'university_id']
    search_fields = ['title', 'description', 'public_id']
    ordering_fields = ['created_dt', 'start_date', 'status']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return FormListSerializer
        return FormSerializer

    def perform_create(self, serializer):
        """Set created_by, updated_by, institute_id, university_id on create"""
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        """Set updated_by on update"""
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )

    @action(detail=False, methods=['get'])
    def by_institute(self, request):
        """Get forms by institute ID"""
        institute_id = request.query_params.get('institute_id')
        if not institute_id:
            return Response({'error': 'institute_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(institute_id=institute_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get only published forms"""
        queryset = self.get_queryset().filter(status='published')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active forms (within date window)"""
        from django.utils import timezone
        now = timezone.now()
        queryset = self.get_queryset().filter(
            Q(start_date__lte=now) | Q(start_date__isnull=True),
            Q(end_date__gte=now) | Q(end_date__isnull=True),
            status='published'
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============ FormSection ViewSet ============

class FormSectionViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for FormSection model"""
    queryset = FormSection.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['form', 'institute_id', 'university_id']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_dt']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'list':
            return FormSectionListSerializer
        return FormSectionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )


# ============ FormQuestion ViewSet ============

class FormQuestionViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for FormQuestion model"""
    queryset = FormQuestion.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['form', 'section', 'is_required', 'consider_for_analytics', 'institute_id', 'university_id']
    search_fields = ['question_id']
    ordering_fields = ['order', 'marks', 'created_dt']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'list':
            return FormQuestionListSerializer
        return FormQuestionSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )

    @action(detail=False, methods=['get'])
    def by_form(self, request):
        """Get questions for a specific form"""
        form_id = request.query_params.get('form_id')
        if not form_id:
            return Response({'error': 'form_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(form_id=form_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============ QuestionPool ViewSet ============

class QuestionPoolViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for QuestionPool model"""
    queryset = QuestionPool.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['form', 'institute_id', 'university_id']
    search_fields = ['name']
    ordering_fields = ['created_dt']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionPoolListSerializer
        return QuestionPoolSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )


# ============ QuestionLogic ViewSet ============

class QuestionLogicViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for QuestionLogic model"""
    queryset = QuestionLogic.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['form', 'action', 'institute_id', 'university_id']
    ordering_fields = ['created_dt']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionLogicListSerializer
        return QuestionLogicSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )


# ============ FormResponse ViewSet ============

class FormResponseViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """
    ViewSet for FormResponse model
    
    Endpoints:
    - GET /api/form-responses/ - List all responses
    - POST /api/form-responses/ - Submit a new response
    - GET /api/form-responses/{id}/ - Get response details
    - GET /api/form-responses/by-user/{user_id}/ - Get user's responses
    - GET /api/form-responses/completed/ - Get completed responses
    """
    queryset = FormResponse.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['form', 'user_id', 'is_completed', 'passed', 'institute_id', 'university_id']
    ordering_fields = ['started_at', 'score', 'created_dt']
    ordering = ['-started_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return FormResponseListSerializer
        return FormResponseSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """Get responses from a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(user_id=user_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get only completed responses"""
        queryset = self.get_queryset().filter(is_completed=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============ FormAnswer ViewSet ============

class FormAnswerViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for FormAnswer model"""
    queryset = FormAnswer.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['response', 'question_id', 'is_correct', 'institute_id', 'university_id']
    ordering_fields = ['created_dt', 'marks_awarded']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        if self.action == 'list':
            return FormAnswerListSerializer
        return FormAnswerSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )

    @action(detail=False, methods=['get'])
    def by_response(self, request):
        """Get answers for a specific response"""
        response_id = request.query_params.get('response_id')
        if not response_id:
            return Response({'error': 'response_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(response_id=response_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============ ResponseFileUpload ViewSet ============

class ResponseFileUploadViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for ResponseFileUpload model"""
    queryset = ResponseFileUpload.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['response', 'question_id', 'institute_id', 'university_id']
    ordering_fields = ['created_dt']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        if self.action == 'list':
            return ResponseFileUploadListSerializer
        return ResponseFileUploadSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )


# ============ FormAccessRule ViewSet ============

class FormAccessRuleViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for FormAccessRule model"""
    queryset = FormAccessRule.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['form', 'otp_required', 'institute_id', 'university_id']
    search_fields = ['allowed_email_domain']
    ordering_fields = ['created_dt']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        if self.action == 'list':
            return FormAccessRuleListSerializer
        return FormAccessRuleSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )


# ============ FormAttemptLog ViewSet ============

class FormAttemptLogViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """ViewSet for FormAttemptLog model"""
    queryset = FormAttemptLog.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['response', 'event_type', 'institute_id', 'university_id']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_serializer_class(self):
        if self.action == 'list':
            return FormAttemptLogListSerializer
        return FormAttemptLogSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )


# ============ QuestionAnalytics ViewSet ============

class QuestionAnalyticsViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """
    ViewSet for QuestionAnalytics model
    
    Endpoints:
    - GET /api/question-analytics/ - List all question analytics
    - GET /api/question-analytics/by-form/{form_id}/ - Get analytics for a form's questions
    - GET /api/question-analytics/by-question/{question_id}/ - Get analytics for specific question
    """
    queryset = QuestionAnalytics.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['form', 'question_id', 'institute_id', 'university_id']
    ordering_fields = ['correct_attempts', 'total_attempts', 'created_dt']
    ordering = ['-total_attempts']

    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionAnalyticsListSerializer
        return QuestionAnalyticsSerializer

    def perform_create(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        user = self.request.user
        audit_data = get_user_audit_and_institution_data(user)
        
        serializer.save(
            updated_by=audit_data['user_id']
        )

    @action(detail=False, methods=['get'])
    def by_form(self, request):
        """Get analytics for all questions in a form"""
        form_id = request.query_params.get('form_id')
        if not form_id:
            return Response({'error': 'form_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(form_id=form_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_question(self, request):
        """Get analytics for a specific question"""
        question_id = request.query_params.get('question_id')
        if not question_id:
            return Response({'error': 'question_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(question_id=question_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ============ Question Snapshot ViewSet ============

class QuestionSnapshotViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, RoleBasedAccessControlMixin, viewsets.ModelViewSet):
    """
    ViewSet for QuestionSnapshot model
    
    Endpoints:
    - GET /api/question-snapshots/ - List all snapshots
    - POST /api/question-snapshots/ - Create a new snapshot
    - GET /api/question-snapshots/{id}/ - Get snapshot details
    - PUT /api/question-snapshots/{id}/ - Update a snapshot
    - DELETE /api/question-snapshots/{id}/ - Delete a snapshot
    - GET /api/question-snapshots/by-form-question/{form_question_id}/ - Get snapshot for a form question
    """
    queryset = QuestionSnapshot.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['form_question', 'question_type', 'institute_id', 'university_id']
    search_fields = ['question_text', 'question_type']
    ordering_fields = ['created_dt', 'question_type']
    ordering = ['-created_dt']

    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return QuestionSnapshotListSerializer
        return QuestionSnapshotSerializer

    def perform_create(self, serializer):
        """Set created_by, updated_by, institute_id, university_id on create"""
        audit_data = get_user_audit_and_institution_data(self.request.user)
        serializer.save(
            created_by=audit_data['user_id'],
            updated_by=audit_data['user_id'],
            institute_id=audit_data['institute_id'],
            university_id=audit_data['university_id']
        )

    def perform_update(self, serializer):
        """Set updated_by on update"""
        audit_data = get_user_audit_and_institution_data(self.request.user)
        serializer.save(
            updated_by=audit_data['user_id']
        )

    @action(detail=False, methods=['get'])
    def by_form_question(self, request):
        """Get snapshot for a specific form question"""
        form_question_id = request.query_params.get('form_question_id')
        if not form_question_id:
            return Response({'error': 'form_question_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            snapshot = self.get_queryset().get(form_question_id=form_question_id)
            serializer = self.get_serializer(snapshot)
            return Response(serializer.data)
        except QuestionSnapshot.DoesNotExist:
            return Response({'error': 'Snapshot not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def by_form(self, request):
        """Get snapshots for all questions in a form"""
        form_id = request.query_params.get('form_id')
        if not form_id:
            return Response({'error': 'form_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(form_question__form_id=form_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

