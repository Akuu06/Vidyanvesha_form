"""
Helper utilities for accessing secondary database (vidyanvesha_core) models and data.
Provides cached access to related entities without circular imports.
"""

from django.db import connections


class SecondaryDatabaseHelper:
    """Helper class to fetch data from secondary database with caching"""
    
    _cache = {}
    
    @classmethod
    def _execute_query(cls, query, params=None):
        """Execute query on secondary database"""
        try:
            with connections['secondary'].cursor() as cursor:
                cursor.execute(query, params or [])
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                print(f"✅ Query successful, found {len(rows)} rows")
                return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            print(f"❌ Error querying secondary database: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    @classmethod
    def get_institute(cls, institute_id):
        """Get institute details from secondary database"""
        if not institute_id:
            return None
        
        cache_key = f"institute_{institute_id}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]
        
        results = cls._execute_query(
            "SELECT * FROM institutes_management_institutes WHERE id = %s",
            [institute_id]
        )
        result = results[0] if results else None
        cls._cache[cache_key] = result
        return result
    
    @classmethod
    def get_university(cls, university_id):
        """Get university details from secondary database"""
        if not university_id:
            return None
        
        cache_key = f"university_{university_id}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]
        
        results = cls._execute_query(
            "SELECT * FROM universities_management_universities WHERE id = %s",
            [university_id]
        )
        result = results[0] if results else None
        cls._cache[cache_key] = result
        return result
    
    @classmethod
    def get_class(cls, class_id):
        """Get class details from secondary database"""
        if not class_id:
            return None
        
        cache_key = f"class_{class_id}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]
        
        results = cls._execute_query(
            "SELECT * FROM classes_management_classes WHERE id = %s",
            [class_id]
        )
        result = results[0] if results else None
        cls._cache[cache_key] = result
        return result
    
    @classmethod
    def get_academic_session(cls, session_id):
        """Get academic session details from secondary database"""
        if not session_id:
            return None
        
        cache_key = f"academic_session_{session_id}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]
        
        results = cls._execute_query(
            "SELECT * FROM academic_sessions_management_academic_sessions WHERE id = %s",
            [session_id]
        )
        result = results[0] if results else None
        cls._cache[cache_key] = result
        return result
    
    @classmethod
    def get_load(cls, load_id):
        """Get load details from secondary database"""
        if not load_id:
            return None
        
        cache_key = f"load_{load_id}"
        if cache_key in cls._cache:
            return cls._cache[cache_key]
        
        results = cls._execute_query(
            "SELECT * FROM load_management_load_details WHERE id = %s",
            [load_id]
        )
        result = results[0] if results else None
        cls._cache[cache_key] = result
        return result
    
    @classmethod
    def get_user_profile_by_firebase_uid(cls, firebase_uid):
        """Get user profile by Firebase UID from secondary database"""
        if not firebase_uid:
            return None
        
        cache_key = f"user_profile_firebase_{firebase_uid}"
        if cache_key in cls._cache:
            cached_value = cls._cache[cache_key]
            if cached_value is not None:
                print(f"📦 Using cached profile for Firebase UID: {firebase_uid}")
                return cached_value
            # If cached value is None, try fresh query
        
        print(f"🔍 Querying secondary DB for profile with Firebase UID: {firebase_uid}")
        results = cls._execute_query(
            """SELECT up.id, up.user_id, up.firebase_uid, up.user_email, up.email_verified, up.firebase_provider,
                      up.institute_id, up.university_id,
                      u.username, u.email, u.is_active
               FROM account_management_user_profile up
               LEFT JOIN auth_user u ON up.user_id = u.id
               WHERE up.firebase_uid = %s""",
            [firebase_uid]
        )
        result = results[0] if results else None
        
        if result:
            print(f"✅ Found profile for Firebase UID {firebase_uid}")
            cls._cache[cache_key] = result
        else:
            print(f"❌ No profile found for Firebase UID {firebase_uid} - NOT caching")
            # Don't cache negative results
        
        return result
    
    @classmethod
    def get_user_institution_data(cls, user_id=None, firebase_uid=None):
        """
        Get institute_id and university_id for a user from secondary database.
        Can use either user_id or firebase_uid.
        
        Returns:
            {
                'institute_id': <int>,
                'university_id': <int>,
                'user_id': <int>
            }
            or None if user/profile not found
        """
        profile = None
        
        if firebase_uid:
            profile = cls.get_user_profile_by_firebase_uid(firebase_uid)
        elif user_id:
            results = cls._execute_query(
                """SELECT id, user_id, institute_id, university_id 
                   FROM account_management_user_profile 
                   WHERE user_id = %s""",
                [user_id]
            )
            profile = results[0] if results else None
        
        if not profile:
            print(f"⚠️  No user profile found for user_id={user_id}, firebase_uid={firebase_uid}")
            return None
        
        return {
            'institute_id': profile.get('institute_id'),
            'university_id': profile.get('university_id'),
            'user_id': profile.get('user_id')
        }
    
    @classmethod
    def get_user_by_email(cls, email):
        """Get user by email from secondary database"""
        if not email:
            return None
        
        cache_key = f"user_email_{email}"
        if cache_key in cls._cache:
            cached_value = cls._cache[cache_key]
            if cached_value is not None:
                print(f"📦 Using cached user for email: {email}")
                return cached_value
            # If cached value is None, try fresh query
        
        print(f"🔍 Querying secondary DB for user with email: {email}")
        results = cls._execute_query(
            """SELECT id, username, email, is_active FROM auth_user WHERE email = %s""",
            [email]
        )
        result = results[0] if results else None
        
        if result:
            print(f"✅ Found user with email {email}: {result.get('username')}")
            cls._cache[cache_key] = result
        else:
            print(f"❌ No user found with email {email} - NOT caching")
            # Don't cache negative results so we try again next time
        
        return result
    
    @classmethod
    def create_user(cls, username, email):
        """Create new user in secondary database"""
        try:
            connection = connections['secondary']
            connection.ensure_connection()
            
            with connection.cursor() as cursor:
                cursor.execute(
                    """INSERT INTO auth_user (username, email, is_active, is_staff, is_superuser, password, last_login, date_joined)
                       VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                       RETURNING id, username, email, is_active""",
                    [username, email, True, False, False, '!unused']
                )
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()
                connection.commit()
                result = dict(zip(columns, row)) if row else None
                print(f"✅ User created in secondary database: {username}")
                return result
        except Exception as e:
            print(f"❌ Error creating user in secondary database: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @classmethod
    def create_user_profile(cls, user_id, firebase_uid, user_email, email_verified, firebase_provider):
        """Create user profile in secondary database"""
        try:
            connection = connections['secondary']
            connection.ensure_connection()
            
            with connection.cursor() as cursor:
                cursor.execute(
                    """INSERT INTO account_management_user_profile 
                       (user_id, firebase_uid, user_email, email_verified, firebase_provider, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                       RETURNING id, user_id, firebase_uid, user_email, email_verified, firebase_provider""",
                    [user_id, firebase_uid, user_email, email_verified, firebase_provider]
                )
                columns = [col[0] for col in cursor.description]
                row = cursor.fetchone()
                connection.commit()
                result = dict(zip(columns, row)) if row else None
                print(f"✅ User profile created in secondary database for user_id: {user_id}")
                return result
        except Exception as e:
            print(f"❌ Error creating user profile in secondary database: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @classmethod
    def clear_cache(cls):
        """Clear all cached data"""
        print(f"🧹 Clearing cache with {len(cls._cache)} entries")
        cls._cache.clear()
    
    # ============================================================================
    # RBAC (Role-Based Access Control) Methods - Query secondary DB for permissions
    # ============================================================================
    
    @classmethod
    def get_user_roles(cls, user_id):
        """Get all roles assigned to a user from secondary database"""
        if not user_id:
            return []
        
        results = cls._execute_query(
            """SELECT ur.id, ur.role_id, r.id as role_id_check, r.role_name, r.role_desc
               FROM account_management_user_role ur
               LEFT JOIN account_management_roles r ON ur.role_id = r.id
               WHERE ur.user_id = %s""",
            [user_id]
        )
        print(f"📋 Found {len(results)} role(s) for user_id {user_id}")
        return results
    
    @classmethod
    def get_role_modules(cls, role_id):
        """Get all modules assigned to a role from secondary database"""
        if not role_id:
            return []
        
        results = cls._execute_query(
            """SELECT rm.id, rm.module_id, m.id as module_id_check, m.module_name, m.module_desc
               FROM module_management_role_module rm
               LEFT JOIN module_management_modules m ON rm.module_id = m.id
               WHERE rm.role_id = %s""",
            [role_id]
        )
        print(f"📦 Found {len(results)} module(s) for role_id {role_id}")
        return results
    
    @classmethod
    def get_module_urls(cls, module_id):
        """Get all URLs/permissions for a module from secondary database"""
        if not module_id:
            return []
        
        results = cls._execute_query(
            """SELECT id, url_path, action, module_id
               FROM module_management_urls
               WHERE module_id = %s""",
            [module_id]
        )
        print(f"🔗 Found {len(results)} URL(s) for module_id {module_id}")
        return results
    
    @classmethod
    def get_child_modules(cls, module_id, visited=None):
        """Recursively get all child modules from secondary database"""
        if visited is None:
            visited = set()
        
        if not module_id or module_id in visited:
            return set()
        
        visited.add(module_id)
        child_ids = set()
        
        results = cls._execute_query(
            """SELECT module_id, parent_module_id
               FROM module_management_module_parentmodule
               WHERE parent_module_id = %s""",
            [module_id]
        )
        
        for row in results:
            child_id = row.get('module_id')
            if child_id and child_id not in visited:
                child_ids.add(child_id)
                # Recursively get grandchildren
                child_ids.update(cls.get_child_modules(child_id, visited))
        
        if results:
            print(f"👶 Found {len(child_ids)} child module(s) for module_id {module_id}")
        return child_ids
    
    @classmethod
    def get_all_child_classes(cls, class_id, visited=None):
        """Recursively get all child classes from secondary database using BFS"""
        if not class_id:
            return []
        
        if visited is None:
            visited = set()
        
        cache_key = f"child_classes_{class_id}"
        if cache_key in cls._cache:
            cached_value = cls._cache[cache_key]
            if cached_value is not None:
                print(f"📦 Using cached child classes for class_id: {class_id}")
                return cached_value
        
        child_classes = []
        queue = [class_id]
        visited = set()
        
        while queue:
            current_class_id = queue.pop(0)
            
            if current_class_id in visited:
                continue
            
            visited.add(current_class_id)
            
            # Query all direct children of current class
            results = cls._execute_query(
                """SELECT c.id, c.class_name, c.class_status
                   FROM classes_management_classes c
                   INNER JOIN classes_management_class_parentclass cp ON c.id = cp.class_name_id
                   WHERE cp.parent_class_name_id = %s""",
                [current_class_id]
            )
            
            # Add children to result and queue for further traversal
            for row in results:
                child_id = row.get('id')
                if child_id and child_id not in visited:
                    child_classes.append(row)
                    queue.append(child_id)
        
        # Cache the result
        cls._cache[cache_key] = child_classes
        
        if child_classes:
            print(f"👶 Found {len(child_classes)} child class(es) for class_id {class_id}")
        else:
            print(f"📭 No child classes found for class_id {class_id}")
        
        return child_classes
