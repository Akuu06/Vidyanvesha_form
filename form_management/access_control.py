"""
Role-Based Access Control (RBAC) utilities for form_management API
Integrates with vidyanvesha_core's role and permission system via secondary database routing
"""

# Import RBAC utilities from commons
from commons.access_control import (
    get_all_child_modules,
    get_user_allowed_urls,
    check_url_access,
    check_role_based_access,
    RoleBasedAccessControlMixin,
    get_user_managed_users,
    get_user_management_chain,
    can_user_delete_record,
    get_accessible_records_queryset,
    DataAccessControlMixin
)

# Re-export for backward compatibility
__all__ = [
    'get_all_child_modules',
    'get_user_allowed_urls',
    'check_url_access',
    'check_role_based_access',
    'RoleBasedAccessControlMixin',
    'get_user_managed_users',
    'get_user_management_chain',
    'can_user_delete_record',
    'get_accessible_records_queryset',
    'DataAccessControlMixin',
]
