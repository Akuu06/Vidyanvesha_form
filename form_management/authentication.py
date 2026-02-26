"""
Firebase Authentication for SSO in form_management
This module handles Firebase token verification and user profile management

IMPORTANT ARCHITECTURE NOTE:
- vidyanvesha_core and vidyanvesha_form are on DIFFERENT VMs
- We access vidyanvesha_core data via database routing (using='secondary')
- NO direct imports from vidyanvesha_core models - that would fail cross-VM
"""
import logging
import sys
import os
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth as firebase_auth
import firebase_admin
from .secondary_db_helper import SecondaryDatabaseHelper

logger = logging.getLogger(__name__)


def _is_firebase_initialized():
    """Check if Firebase Admin SDK is properly initialized"""
    try:
        if not firebase_admin._apps:
            return False
        return True
    except:
        return False



class UserProxy:
    """
    Simple proxy object to represent a user from secondary database.
    Mimics Django User model interface for compatibility with DRF.
    """
    def __init__(self, user_data):
        # Handle both dict and object inputs
        if isinstance(user_data, dict):
            # IMPORTANT: Prefer 'user_id' over 'id' because user_id is auth_user.id
            # while 'id' might be user_profile.id (different tables!)
            self.id = user_data.get('user_id') or user_data.get('id')
            self.username = user_data.get('username')
            self.email = user_data.get('email')
            self.is_active = user_data.get('is_active', True)
        else:
            # Assume it's an object with attributes
            # IMPORTANT: Prefer 'user_id' over 'id' because user_id is auth_user.id
            self.id = getattr(user_data, 'user_id', None) or getattr(user_data, 'id', None)
            self.username = getattr(user_data, 'username', None)
            self.email = getattr(user_data, 'email', None)
            self.is_active = getattr(user_data, 'is_active', True)
        
        self.is_authenticated = True
        self.is_staff = False
        self.is_superuser = False
        self.pk = self.id
        
    def __str__(self):
        return self.username or str(self.id)
    
    def __repr__(self):
        return f"<UserProxy: {self.username}>"


def _get_base_authentication_class():
    """Lazy load BaseAuthentication to avoid module-level DRF initialization"""
    from rest_framework.authentication import BaseAuthentication
    return BaseAuthentication


class FirebaseAuthentication(_get_base_authentication_class()):
    """
    Firebase SSO Authentication for form_management API
    
    Verifies Firebase ID tokens from Authorization header and creates/retrieves user profiles.
    Uses the user_profile model from vidyanvesha_core to maintain SSO state.
    
    Usage:
    - Send requests with Authorization: Bearer <firebase_token>
    - User profiles are automatically synced from Firebase
    
    Features:
    - Bearer token verification
    - Automatic user creation/retrieval
    - Email and provider synchronization
    - Proper error handling and logging
    """

    def authenticate(self, request):
        """
        Authenticate request using Firebase token
        
        Args:
            request: Django request object
        
        Returns:
            Tuple of (user, None) if authentication successful
            None if no Authorization header (unauthenticated request)
            Raises AuthenticationFailed if token is invalid
        """
        # Lazy import
        
        auth_header = request.headers.get("Authorization")
        
        logger.info(f"🔍 FirebaseAuthentication: Checking Authorization header")

        if not auth_header:
            logger.warning(f"⚠️ No Authorization header found")
            return None

        if not auth_header.startswith("Bearer "):
            logger.error(f"❌ Invalid Authorization header format: {auth_header[:20]}...")
            raise AuthenticationFailed("Invalid Authorization header format. Use 'Bearer <token>'")

        token = auth_header.split(" ")[1]
        logger.info(f"🔑 Token extracted: {token[:20]}...")

        user_data = self.authenticate_with_token(token)
        
        if user_data:
            user = UserProxy(user_data)
            logger.info(f"✅ Authentication successful for user: {user.username}")
            return (user, None)
        else:
            raise AuthenticationFailed("Invalid or expired Firebase token")
    
    def authenticate_with_token(self, token):
        """
        Verify Firebase token and get/create user.
        Can be called directly from login endpoint without a request object.
        
        Args:
            token: Firebase ID token or custom token string
        
        Returns:
            Dictionary with user data if successful, None if token is invalid
        
        Raises:
            AuthenticationFailed: If token is invalid or user doesn't exist
        """
        # Check if Firebase is initialized
        if not _is_firebase_initialized():
            logger.error(f"❌ Firebase not initialized - credentials file missing")
            raise AuthenticationFailed(
                "Authentication unavailable: Firebase not configured on server. "
                "Please ensure firebase_service_account.json is deployed to the server at: "
                "/app/config/firebase_service_account.json or set GOOGLE_APPLICATION_CREDENTIALS"
            )
        
        decoded_token = None
        
        try:
            # Try to verify as ID token first (client-issued)
            decoded_token = firebase_auth.verify_id_token(token)
            logger.info(f"✅ ID Token verified: {decoded_token.get('email', 'unknown')}")
        except Exception as e:
            # Handle custom token case for development/testing
            error_msg = str(e).lower()
            if "custom token" in error_msg or "expects an id" in error_msg:
                logger.info(f"ℹ️  Attempting to decode custom token...")
                try:
                    import json
                    import base64
                    # Custom tokens are JWT format but not verified with public keys
                    # For development: decode without verification
                    parts = token.split('.')
                    if len(parts) != 3:
                        raise AuthenticationFailed(f"Invalid token format")
                    
                    # Decode the payload (add padding if needed)
                    payload = parts[1]
                    padding = 4 - (len(payload) % 4)
                    if padding:
                        payload += '=' * padding
                    
                    decoded_payload = json.loads(base64.urlsafe_b64decode(payload))
                    decoded_token = decoded_payload
                    logger.info(f"✅ Custom token decoded (development mode): {decoded_token.get('uid', 'unknown')}")
                except Exception as decode_error:
                    logger.error(f"❌ Failed to decode custom token: {str(decode_error)}")
                    raise AuthenticationFailed(f"Invalid custom token: {str(decode_error)}")
            else:
                logger.error(f"❌ Firebase verification failed: {str(e)}")
                raise AuthenticationFailed(f"Invalid or expired Firebase token: {str(e)}")
        
        if not decoded_token:
            raise AuthenticationFailed("Failed to decode token")

        # Extract token information (handle both ID and custom tokens)
        firebase_uid = decoded_token.get("uid") or decoded_token.get("user_id")
        email = decoded_token.get("email")
        email_verified = decoded_token.get("email_verified", False)
        provider = decoded_token.get("firebase", {}).get("sign_in_provider", "custom") if isinstance(decoded_token.get("firebase"), dict) else "custom"

        if not firebase_uid:
            logger.error(f"❌ No UID in token payload")
            raise AuthenticationFailed("Invalid Firebase token payload: missing UID")

        # Get or create user
        try:
            user_data = self._get_or_create_user(firebase_uid, email, email_verified, provider)
            return user_data
        except Exception as e:
            logger.error(f"❌ Error getting/creating user: {str(e)}")
            raise AuthenticationFailed(f"User creation/retrieval failed: {str(e)}")

    def _get_or_create_user(self, firebase_uid, email, email_verified, provider):
        """
        Get existing user from vidyanvesha_core and link to Firebase if needed.
        
        IMPORTANT: This method does NOT create new users. Users must exist in 
        vidyanvesha_core before they can authenticate via Firebase SSO.
        
        ARCHITECTURE: Since vidyanvesha_core is on a different VM, we:
        1. Use SecondaryDatabaseHelper for direct SQL queries to secondary database
        2. No Django ORM models needed - just raw SQL to user and user_profile tables
        3. Never use local vidyanvesha_form database for user storage
        
        Args:
            firebase_uid: Firebase user ID
            email: User email
            email_verified: Is email verified
            provider: Firebase provider name
        
        Returns:
            Dictionary with user data from vidyanvesha_core database
            
        Raises:
            AuthenticationFailed: If user does not exist in vidyanvesha_core
        """
        
        try:
            # Step 1: Check if user_profile already exists (user already linked to Firebase)
            profile = SecondaryDatabaseHelper.get_user_profile_by_firebase_uid(firebase_uid)
            
            if profile:
                logger.info(f"✅ User profile found in vidyanvesha_core: {profile.get('username')}")
                return profile
            
            # Step 2: Check if User exists by email in vidyanvesha_core
            user = SecondaryDatabaseHelper.get_user_by_email(email)
            
            if user:
                logger.info(f"✅ User found in vidyanvesha_core by email: {user.get('username')}")
                # Link existing user to Firebase by creating user_profile
                try:
                    profile = SecondaryDatabaseHelper.create_user_profile(
                        user_id=user.get('id'),
                        firebase_uid=firebase_uid,
                        user_email=email,
                        email_verified=email_verified,
                        firebase_provider=provider
                    )
                    if profile:
                        logger.info(f"📝 Linked user to Firebase: {user.get('username')}")
                        # Return updated profile data
                        return SecondaryDatabaseHelper.get_user_profile_by_firebase_uid(firebase_uid)
                except Exception as e:
                    logger.warning(f"⚠️ Could not link user to Firebase: {str(e)}")
                    # Still return user even if profile creation failed
                    return user
                
            # Step 3: User doesn't exist in vidyanvesha_core - REJECT
            logger.error(f"❌ User with email {email} not found in vidyanvesha_core")
            raise AuthenticationFailed(
                f"User with email {email} does not exist in vidyanvesha_core. "
                "Please contact your administrator to create your account first."
            )
            
        except AuthenticationFailed:
            # Re-raise authentication failures
            raise
        except Exception as e:
            logger.error(f"❌ Error accessing vidyanvesha_core database: {str(e)}")
            raise AuthenticationFailed(f"User authentication failed: {str(e)}")
