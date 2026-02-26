"""
Role-based Access Control (RBAC) utilities for API endpoints
Queries RBAC data directly from vidyanvesha_core database on every request (no caching)
"""
import re
import logging
import time
from functools import wraps
from django.http import HttpResponseForbidden
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.contrib.auth.models import User
from django.db.models import Q
from django.apps import apps
from form_management.secondary_db_helper import SecondaryDatabaseHelper

logger = logging.getLogger(__name__)

# Simple in-memory cache for RBAC queries (expires after 5 minutes)
_rbac_cache = {}
_cache_timestamps = {}
CACHE_TTL = 300  # 5 minutes


def _get_cache_key(user_id):
    """Generate cache key for user"""
    return f"rbac_urls_{user_id}"


def _get_cached_urls(user_id):
    """Get cached URLs if available and not expired"""
    cache_key = _get_cache_key(user_id)
    if cache_key in _rbac_cache:
        timestamp = _cache_timestamps.get(cache_key, 0)
        if time.time() - timestamp < CACHE_TTL:
            logger.debug(f"✓ Using cached RBAC data for user {user_id}")
            return _rbac_cache[cache_key]
        else:
            # Cache expired
            del _rbac_cache[cache_key]
            del _cache_timestamps[cache_key]
    return None


def _set_cached_urls(user_id, urls):
    """Cache URLs for user with timestamp"""
    cache_key = _get_cache_key(user_id)
    _rbac_cache[cache_key] = urls
    _cache_timestamps[cache_key] = time.time()
    logger.debug(f"✓ Cached RBAC data for user {user_id} (expires in {CACHE_TTL}s)")


def get_user_allowed_urls(user, role_id=None):
    """
    Get all allowed URLs for a user based on their roles and modules.
    Uses caching (5 min TTL) to improve performance.
    
    Args:
        user: Django User object (from vidyanvesha_core)
        role_id: Optional specific role ID to check (if not provided, uses all user roles)
    
    Returns:
        set of allowed URL paths as tuples: (url_path, action/method)
    """
    all_allowed_urls = set()
    
    try:
        # Get user's ID from the user object
        user_id = user.id if hasattr(user, 'id') else user.get('id') if isinstance(user, dict) else None
        
        if not user_id:
            logger.warning(f"⚠️ Cannot get user ID for user: {user}")
            return all_allowed_urls
        
        # Check cache first
        cached_urls = _get_cached_urls(user_id)
        if cached_urls is not None:
            return cached_urls
        
        # Cache miss - query database
        logger.info(f"📊 Querying RBAC data for user_id={user_id} from secondary DB")
        
        # Step 1: Get user roles from secondary database
        user_roles = SecondaryDatabaseHelper.get_user_roles(user_id)
        
        if not user_roles:
            logger.warning(f"⚠️ No roles found for user: {user}")
            _set_cached_urls(user_id, all_allowed_urls)  # Cache empty result
            return all_allowed_urls
        
        logger.info(f"📋 Found {len(user_roles)} role(s) for user {getattr(user, 'username', user)}")
        
        # Step 2: For each role, get modules and their URLs
        for user_role_entry in user_roles:
            role_id_val = user_role_entry.get('role_id')
            role_name = user_role_entry.get('role_name', 'Unknown')
            
            logger.debug(f"  Processing role: {role_name} (ID: {role_id_val})")
            
            # Get modules for this role
            role_modules = SecondaryDatabaseHelper.get_role_modules(role_id_val)
            
            for role_module_entry in role_modules:
                module_id = role_module_entry.get('module_id')
                module_name = role_module_entry.get('module_name', 'Unknown')
                
                logger.debug(f"    Processing module: {module_name} (ID: {module_id})")
                
                # Get all URLs for this module
                module_urls = SecondaryDatabaseHelper.get_module_urls(module_id)
                
                for url_entry in module_urls:
                    url_path = url_entry.get('url_path')
                    action = url_entry.get('action')
                    all_allowed_urls.add((url_path, action))
                    logger.debug(f"      Added URL: {action} {url_path}")
                
                # Get child modules and their URLs
                child_module_ids = SecondaryDatabaseHelper.get_child_modules(module_id)
                if child_module_ids:
                    for child_module_id in child_module_ids:
                        child_urls = SecondaryDatabaseHelper.get_module_urls(child_module_id)
                        for url_entry in child_urls:
                            url_path = url_entry.get('url_path')
                            action = url_entry.get('action')
                            all_allowed_urls.add((url_path, action))
                            logger.debug(f"      Added child URL: {action} {url_path}")
        
        logger.info(f"✅ Total allowed URLs for {getattr(user, 'username', user)}: {len(all_allowed_urls)}")
    
    except Exception as e:
        logger.error(f"❌ Error getting allowed URLs: {str(e)}", exc_info=True)
    
    # Cache the result before returning
    _set_cached_urls(user_id, all_allowed_urls)
    return all_allowed_urls


def check_url_access(request_path, request_method, allowed_urls):
    """
    Check if a request path and method match any of the allowed URLs.
    
    Args:
        request_path: Current request path (e.g., '/api/users/123/')
        request_method: HTTP method (GET, POST, PUT, PATCH, DELETE)
        allowed_urls: Set of tuples (url_path, action)
    
    Returns:
        bool: True if access is allowed, False otherwise
    """
    logger.debug(f"🔍 Checking access for: {request_method} {request_path}")
    logger.debug(f"📋 Allowed URLs count: {len(allowed_urls)}")
    
    # Log first 5 allowed URLs for debugging
    for url_entry in list(allowed_urls)[:5]:
        logger.debug(f"   URL Entry: {url_entry}")
    
    for allowed_url_path, allowed_action in allowed_urls:
        # Only check if method matches
        if allowed_action.upper() != request_method.upper():
            continue
        
        # Convert URL pattern to regex
        # Replace {id}, {user_id}, etc. with \d+ for integer matching
        pattern = re.sub(r'\{[\w_]+\}', r'\\d+', allowed_url_path)
        pattern = f"^{pattern}$"
        
        logger.debug(f"  Trying pattern: {pattern} against {request_path}")
        
        if re.match(pattern, request_path):
            logger.info(f"  ✅ Match found: {allowed_url_path} ({allowed_action})")
            return True
        
        # Try with normalized trailing slash
        pattern_no_slash = pattern.rstrip('/').replace('/$', '$')
        request_path_no_slash = request_path.rstrip('/')
        if re.match(pattern_no_slash, request_path_no_slash):
            logger.info(f"  ✅ Match found (trailing slash normalized): {allowed_url_path} ({allowed_action})")
            return True
    
    logger.warning(f"  ❌ No matching URL found for {request_method} {request_path}")
    return False


def check_role_based_access(view_func):
    """
    Decorator to check if user has access to the current API endpoint based on roles and modules
    
    Usage:
        @check_role_based_access
        def my_api_view(request):
            ...
    
    For class-based views, use as method decorator:
        @check_role_based_access
        def get(self, request):
            ...
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # Allow unauthenticated users to pass through
        if not request.user or not request.user.is_authenticated:
            return view_func(request, *args, **kwargs)
        
        try:
            # Get user's roles
            try:
                user_role = apps.get_model('account_management', 'user_role')
                user_roles = user_role.objects.using('secondary').filter(
                    user=request.user
                ).select_related("role")
            except LookupError:
                logger.warning("⚠️ user_role model not available")
                return view_func(request, *args, **kwargs)
            
            if not user_roles.exists():
                logger.warning(f"⚠️ No roles found for user: {request.user.username}")
                return Response(
                    {"error": "User has no assigned roles"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all allowed URLs for the user
            allowed_urls = get_user_allowed_urls(request.user)
            
            if not allowed_urls:
                logger.warning(
                    f"⚠️ No allowed URLs for user: {request.user.username}"
                )
                return Response(
                    {"error": "User has no access to any resources"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if current URL is allowed
            current_path = request.path
            current_method = request.method
            
            if not check_url_access(current_path, current_method, allowed_urls):
                logger.warning(
                    f"❌ Access Denied for {request.user.username} to {current_method} {current_path}"
                )
                return Response(
                    {"error": f"Access denied. You do not have permission to {current_method} {current_path}"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            logger.info(
                f"✅ Access granted for {request.user.username} to {current_method} {current_path}"
            )
            
            # Store allowed URLs in request for potential use in view
            request.allowed_urls = allowed_urls
            request.user_roles = [ur.role for ur in user_roles]
            
            return view_func(request, *args, **kwargs)
        
        except Exception as e:
            logger.error(f"❌ Error checking role-based access: {str(e)}")
            return Response(
                {"error": f"Access control error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return _wrapped_view


class RoleBasedAccessControlMixin:
    """
    Mixin for DRF ViewSets to add role-based access control
    
    Usage in ViewSet:
        class MyViewSet(RoleBasedAccessControlMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MySerializer
    """
    
    def check_access_allowed(self):
        """Check if current user has access to this resource"""
        if not self.request.user or not self.request.user.is_authenticated:
            logger.warning("⚠️ RBAC: User not authenticated, DENYING access")
            return False
        
        try:
            username = getattr(self.request.user, 'username', 'Unknown')
            logger.info(f"🔐 RBAC Check - User: {username} | Path: {self.request.path} | Method: {self.request.method}")
            
            allowed_urls = get_user_allowed_urls(self.request.user)
            logger.info(f"📋 Allowed URLs for {username}: {len(allowed_urls)} entries")
            logger.info(f"📋 Sample URLs: {list(allowed_urls)[:3]}")
            
            # IMPORTANT: If user has no allowed URLs, deny access
            if not allowed_urls:
                logger.warning(
                    f"⚠️ No allowed URLs for user: {username} - DENYING ACCESS"
                )
                return False
            
            has_access = check_url_access(
                self.request.path,
                self.request.method,
                allowed_urls
            )
            
            if has_access:
                logger.info(f"✅ RBAC ALLOWED - {username} to {self.request.method} {self.request.path}")
                return True
            else:
                logger.warning(
                    f"❌ RBAC DENIED - {username} to {self.request.method} {self.request.path}"
                )
                return False
        
        except Exception as e:
            logger.error(f"❌ RBAC Error: {str(e)}", exc_info=True)
            return False
    
    def initial(self, request, *args, **kwargs):
        """Called after request is initialized and authenticated"""
        # Check RBAC before calling parent's initial method
        if not self.check_access_allowed():
            try:
                username = getattr(request.user, 'username', 'Unknown') if request.user and request.user.is_authenticated else 'Anonymous'
            except:
                username = 'Unknown'
            logger.error(f"❌ RBAC BLOCKED - {username} to {request.method} {request.path}")
            raise PermissionDenied(detail="You do not have permission to access this resource")
        
        logger.info(f"✅ RBAC ALLOWED - Continuing to process request")
        return super().initial(request, *args, **kwargs)
    
    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to ensure authentication happens first"""
        logger.info(f"🚀 DISPATCH called")
        return super().dispatch(request, *args, **kwargs)


# ============================================================================
# Data Access Control Helper Functions
# ============================================================================

def get_user_managed_users(user):
    """
    Get all users that are directly managed by a given user.
    
    Args:
        user: Django User object
    
    Returns:
        QuerySet of User objects managed by this user
    """
    try:
        user_manager_users = apps.get_model('account_management', 'user_manager_users')
        managed_user_ids = user_manager_users.objects.using('secondary').filter(
            manager=user
        ).values_list('managed_user_id', flat=True)
        
        return User.objects.filter(id__in=managed_user_ids)
    except LookupError:
        logger.warning("⚠️ user_manager_users model not available")
        return User.objects.none()


def get_user_management_chain(user):
    """
    Get all users in the management chain (managers, managers of managers, etc.)
    up to 5 levels.
    
    Args:
        user: Django User object
    
    Returns:
        Set of User IDs in the management chain
    """
    try:
        user_manager_users = apps.get_model('account_management', 'user_manager_users')
    except LookupError:
        logger.warning("⚠️ user_manager_users model not available")
        return set()
    
    chain = set()
    visited = set()
    
    def get_managers_recursive(current_user, level=0):
        if current_user.id in visited or level >= 5:
            return
        visited.add(current_user.id)
        
        try:
            managers = user_manager_users.objects.using('secondary').filter(
                managed_user=current_user
            ).select_related('manager').values_list('manager_id', flat=True)
            
            for manager_id in managers:
                chain.add(manager_id)
                manager = User.objects.get(id=manager_id)
                get_managers_recursive(manager, level + 1)
        except Exception as e:
            logger.error(f"❌ Error getting managers for user {current_user.username}: {str(e)}")
    
    get_managers_recursive(user)
    return chain


def can_user_delete_record(user, record):
    """
    Check if a user can delete a record.
    User can delete only if they created the record.
    
    Args:
        user: Django User object (current user)
        record: Model instance with created_by field (IntegerField with user_id)
    
    Returns:
        Boolean
    """
    if not hasattr(record, 'created_by'):
        return False
    
    # created_by is now an IntegerField (user_id), not a ForeignKey
    user_id = getattr(user, 'id', None) or getattr(user, 'user_id', None)
    return record.created_by == user_id


def get_accessible_records_queryset(user, queryset):
    """
    Filter queryset to return only records the user can see:
    - Records created by the user
    - Records created by users they manage (not their managers)
    
    Args:
        user: Django User object
        queryset: QuerySet to filter
    
    Returns:
        Filtered QuerySet
    """
    
    # Get users managed by current user
    managed_users = get_user_managed_users(user)
    managed_user_ids = list(managed_users.values_list('id', flat=True))
    
    # Extract user ID - handle both dict and object formats from UserProxy
    if isinstance(user, dict):
        user_id = user.get('id') or user.get('user_id')
    else:
        user_id = getattr(user, 'id', None) or getattr(user, 'user_id', None)
    
    # Filter: created by user OR created by users they manage
    filtered_queryset = queryset.filter(
        Q(created_by=user_id) | Q(created_by__in=managed_user_ids)
    )
    
    return filtered_queryset


# ============================================================================
# ViewSet Mixin for Data Access Control
# ============================================================================

class DataAccessControlMixin:
    """
    Mixin for ViewSets to automatically filter records based on user permissions.
    
    Features:
    - Users see records they created
    - Users see records created by users they manage
    - Only record creator can delete their records
    
    Example usage:
        class MyViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MySerializer
            permission_classes = [IsAuthenticated]
    """
    
    def get_queryset(self):
        """
        Override queryset to filter based on user access control.
        Returns only records created by the user or their managed users.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user and user.is_authenticated:
            # Filter records: created by user OR created by users they manage
            queryset = get_accessible_records_queryset(user, queryset)
            # Safely extract username for logging
            try:
                username = getattr(user, 'username', 'Unknown') if user else 'Unknown'
            except:
                username = 'Unknown'
            logger.info(
                f"✅ Filtered queryset for user {username} - "
                f"Retrieved {queryset.count()} accessible records"
            )
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Override destroy to only allow deletion by the record creator.
        """
        instance = self.get_object()
        user = request.user
        
        # Check if user is the creator
        if not can_user_delete_record(user, instance):
            logger.warning(
                f"❌ User {user.username} (id={getattr(user, 'id', '?')}) attempted to delete record created by user_id={instance.created_by}"
            )
            return Response(
                {
                    "error": "You can only delete records you created.",
                    "created_by": instance.created_by if instance.created_by else "Unknown"
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(
            f"✅ User {user.username} deleted record {instance.id}"
        )
        return super().destroy(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Override update to only allow updates by the record creator.
        """
        instance = self.get_object()
        user = request.user
        
        # Check if user is the creator
        if not can_user_delete_record(user, instance):
            logger.warning(
                f"❌ User {user.username} (id={getattr(user, 'id', '?')}) attempted to update record created by user_id={instance.created_by}"
            )
            return Response(
                {
                    "error": "You can only update records you created.",
                    "created_by": instance.created_by if instance.created_by else "Unknown"
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(
            f"✅ User {user.username} updating record {instance.id}"
        )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Override partial_update to only allow updates by the record creator.
        """
        instance = self.get_object()
        user = request.user
        
        # Check if user is the creator
        if not can_user_delete_record(user, instance):
            logger.warning(
                f"❌ User {user.username} (id={getattr(user, 'id', '?')}) attempted to partially update record created by user_id={instance.created_by}"
            )
            return Response(
                {
                    "error": "You can only update records you created.",
                    "created_by": instance.created_by if instance.created_by else "Unknown"
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        logger.info(
            f"✅ User {user.username} partially updating record {instance.id}"
        )
        return super().partial_update(request, *args, **kwargs)

# ============================================================================
# Institution-based Access Control (Institute/University Auto-fill)
# ============================================================================

class InstitutionAccessControlMixin:
    """
    Mixin to automatically populate institute and university fields from user's profile.
    
    ARCHITECTURE: 
    - Accesses user_profile from vidyanvesha_core database via 'secondary' routing
    - Uses apps.get_model() to avoid cross-VM import issues
    
    Features:
    - Automatically fills institute from user's profile on record creation
    - Automatically fills university from user's profile on record creation
    - Handles University Admin case (where institute can be null)
    - Prevents frontend from overriding these values for security
    - Removes institute/university from request data before validation
    
    Fields used from user_profile (vidyanvesha_core):
    - institute (ForeignKey to institutes model)
    - university (ForeignKey to universities model)
    
    Usage in ViewSet:
        class MyViewSet(InstitutionAccessControlMixin, DataAccessControlMixin, viewsets.ModelViewSet):
            queryset = MyModel.objects.all()
            serializer_class = MySerializer
    
    IMPORTANT: Mark 'institute_id' and 'university_id' as read_only_fields in serializer Meta:
        read_only_fields = ['institute_id', 'university_id', 'created_by', 'created_dt', 'updated_by', 'updated_dt']
    """
    
    def get_user_institution_data(self):
        """
        Get institute and university from user's profile in vidyanvesha_core database
        
        Returns:
            dict with 'institute' and 'university' keys
            
        Raises:
            ValidationError if user profile not found
        """
        user = self.request.user
        
        try:
            # Get user_profile model from vidyanvesha_core via secondary database
            user_profile_model = apps.get_model('account_management', 'user_profile')
            user_prof = user_profile_model.objects.using('secondary').get(user=user)
            
            logger.info(
                f"🏛️ Institution Data for {user.username}: "
                f"institute_id={user_prof.institute_id}, university_id={user_prof.university_id}"
            )
            
            return {
                'institute': user_prof.institute_id,  # Can be None for University Admin
                'university': user_prof.university_id
            }
        except Exception as e:
            logger.error(f"❌ Error fetching institution data from vidyanvesha_core: {str(e)}")
            raise ValidationError({
                "error": "User profile not configured. Contact administrator."
            })
    
    def initialize_request(self, request, *args, **kwargs):
        """
        Override initialize_request to remove institute/university from request data
        This prevents frontend from sending these values and forcing validation errors
        """
        request = super().initialize_request(request, *args, **kwargs)
        
        # Remove institute and university from request data if present
        # These will be set automatically from user profile in perform_create/perform_update
        if hasattr(request, 'data') and isinstance(request.data, dict):
            request.data.pop('institute', None)
            request.data.pop('university', None)
            request.data.pop('institute_id', None)
            request.data.pop('university_id', None)
            logger.debug(f"🔒 Removed institute/university from request data for user {self.request.user.username}")
        
        return request
    
    def perform_create(self, serializer):
        """
        Override perform_create to auto-fill institute and university from user profile
        Prevents frontend from sending institute/university values
        """
        user = self.request.user
        institution_data = self.get_user_institution_data()
        
        # Force set institute and university from user profile
        # This prevents frontend from sending incorrect values
        serializer.save(
            created_by=user,
            updated_by=user,
            institute_id=institution_data['institute'],
            university_id=institution_data['university']
        )
        
        logger.info(
            f"✅ Record created by {user.username} with "
            f"institute_id={institution_data['institute']}, "
            f"university_id={institution_data['university']}"
        )
    
    def perform_update(self, serializer):
        """
        Override perform_update to preserve institute and university from user profile
        """
        user = self.request.user
        institution_data = self.get_user_institution_data()
        
        # Ensure institute and university are not changed by frontend
        serializer.save(
            updated_by=user,
            institute_id=institution_data['institute'],
            university_id=institution_data['university']
        )
        
        logger.info(
            f"✅ Record updated by {user.username} - "
            f"institute and university preserved from user profile"
        )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Override partial_update to preserve institute and university from user profile
        """
        instance = self.get_object()
        user = request.user
        institution_data = self.get_user_institution_data()
        
        # Force preserve institution data
        if hasattr(instance, 'institute_id'):
            instance.institute_id = institution_data['institute']
        if hasattr(instance, 'university_id'):
            instance.university_id = institution_data['university']
        instance.updated_by = user
        instance.save()
        
        logger.info(
            f"✅ Record {instance.id} partially updated by {user.username} - "
            f"institution data preserved"
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
