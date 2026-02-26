# Form Management API - Complete Endpoint Documentation

## Overview
**System**: Vidyanvesha Form Management  
**API Root**: `/api/`  
**Authentication**: Firebase SSO  
**Database**: PostgreSQL (AWS RDS)  
**Framework**: Django REST Framework 3.16.1  
**Status**: ✅ Production Ready

---

## Module Hierarchy

### Super Parent Module (ID: 562)
- **Name**: Form Overall Management
- **Description**: Parent module for all form management features
- **Direct Children**: 11 Parent Modules (55 Child Modules, 65 Endpoints)

---

## Detailed Endpoint Documentation

### Parent Module 1: Forms Management (ID: 563)
**Description**: Management of form creation, updates, and deletion

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Forms Management - Insert Form | `POST` | `/api/forms/` | 482 | Create new form |
| 2 | Forms Management - Update Form | `PUT` | `/api/forms/{id}/` | 483 | Update existing form |
| 3 | Forms Management - Delete Form | `DELETE` | `/api/forms/{id}/` | 484 | Delete form |
| 4 | Forms Management - View All Forms | `GET` | `/api/forms/` | 485 | List all forms |
| 5 | Forms Management - View Specific Form | `GET` | `/api/forms/{id}/` | 486 | View specific form details |

---

### Parent Module 2: Form Sections Management (ID: 569)
**Description**: Management of form sections

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Form Sections Management - Insert Form Section | `POST` | `/api/form-sections/` | 487 | Create form section |
| 2 | Form Sections Management - Update Form Section | `PUT` | `/api/form-sections/{id}/` | 488 | Update form section |
| 3 | Form Sections Management - Delete Form Section | `DELETE` | `/api/form-sections/{id}/` | 489 | Delete form section |
| 4 | Form Sections Management - View All Form Sections | `GET` | `/api/form-sections/` | 490 | List form sections |
| 5 | Form Sections Management - View Specific Form Section | `GET` | `/api/form-sections/{id}/` | 491 | View specific form section |

---

### Parent Module 3: Form Questions Management (ID: 575)
**Description**: Management of questions in forms

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Form Questions Management - Insert Form Question | `POST` | `/api/form-questions/` | 492 | Create form question |
| 2 | Form Questions Management - Update Form Question | `PUT` | `/api/form-questions/{id}/` | 493 | Update form question |
| 3 | Form Questions Management - Delete Form Question | `DELETE` | `/api/form-questions/{id}/` | 494 | Delete form question |
| 4 | Form Questions Management - View All Form Questions | `GET` | `/api/form-questions/` | 495 | List form questions |
| 5 | Form Questions Management - View Specific Form Question | `GET` | `/api/form-questions/{id}/` | 496 | View specific form question |

---

### Parent Module 4: Question Pools Management (ID: 581)
**Description**: Management of question pools for random selection

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Question Pools Management - Insert Question Pool | `POST` | `/api/question-pools/` | 497 | Create question pool |
| 2 | Question Pools Management - Update Question Pool | `PUT` | `/api/question-pools/{id}/` | 498 | Update question pool |
| 3 | Question Pools Management - Delete Question Pool | `DELETE` | `/api/question-pools/{id}/` | 499 | Delete question pool |
| 4 | Question Pools Management - View All Question Pools | `GET` | `/api/question-pools/` | 500 | List question pools |
| 5 | Question Pools Management - View Specific Question Pool | `GET` | `/api/question-pools/{id}/` | 501 | View specific question pool |

---

### Parent Module 5: Question Logic Management (ID: 587)
**Description**: Management of conditional logic for questions

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Question Logic Management - Insert Question Logic | `POST` | `/api/question-logic/` | 502 | Create question logic |
| 2 | Question Logic Management - Update Question Logic | `PUT` | `/api/question-logic/{id}/` | 503 | Update question logic |
| 3 | Question Logic Management - Delete Question Logic | `DELETE` | `/api/question-logic/{id}/` | 504 | Delete question logic |
| 4 | Question Logic Management - View All Question Logic | `GET` | `/api/question-logic/` | 505 | List question logic |
| 5 | Question Logic Management - View Specific Question Logic | `GET` | `/api/question-logic/{id}/` | 506 | View specific question logic |

---

### Parent Module 6: Form Responses Management (ID: 593)
**Description**: Management of form responses and submissions

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Form Responses Management - Insert Form Response | `POST` | `/api/form-responses/` | 507 | Create form response |
| 2 | Form Responses Management - Update Form Response | `PUT` | `/api/form-responses/{id}/` | 508 | Update form response |
| 3 | Form Responses Management - Delete Form Response | `DELETE` | `/api/form-responses/{id}/` | 509 | Delete form response |
| 4 | Form Responses Management - View All Form Responses | `GET` | `/api/form-responses/` | 510 | List form responses |
| 5 | Form Responses Management - View Specific Form Response | `GET` | `/api/form-responses/{id}/` | 511 | View specific form response |

---

### Parent Module 7: Form Answers Management (ID: 599)
**Description**: Management of answers to form questions

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Form Answers Management - Insert Form Answer | `POST` | `/api/form-answers/` | 512 | Create form answer |
| 2 | Form Answers Management - Update Form Answer | `PUT` | `/api/form-answers/{id}/` | 513 | Update form answer |
| 3 | Form Answers Management - Delete Form Answer | `DELETE` | `/api/form-answers/{id}/` | 514 | Delete form answer |
| 4 | Form Answers Management - View All Form Answers | `GET` | `/api/form-answers/` | 515 | List form answers |
| 5 | Form Answers Management - View Specific Form Answer | `GET` | `/api/form-answers/{id}/` | 516 | View specific form answer |

---

### Parent Module 8: Response File Uploads Management (ID: 605)
**Description**: Management of file uploads in form responses

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Response File Uploads Management - Insert File Upload | `POST` | `/api/file-uploads/` | 517 | Create file upload |
| 2 | Response File Uploads Management - Update File Upload | `PUT` | `/api/file-uploads/{id}/` | 518 | Update file upload |
| 3 | Response File Uploads Management - Delete File Upload | `DELETE` | `/api/file-uploads/{id}/` | 519 | Delete file upload |
| 4 | Response File Uploads Management - View All File Uploads | `GET` | `/api/file-uploads/` | 520 | List file uploads |
| 5 | Response File Uploads Management - View Specific File Upload | `GET` | `/api/file-uploads/{id}/` | 521 | View specific file upload |

---

### Parent Module 9: Form Access Rules Management (ID: 611)
**Description**: Management of access rules and restrictions for forms

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Form Access Rules Management - Insert Access Rule | `POST` | `/api/access-rules/` | 522 | Create access rule |
| 2 | Form Access Rules Management - Update Access Rule | `PUT` | `/api/access-rules/{id}/` | 523 | Update access rule |
| 3 | Form Access Rules Management - Delete Access Rule | `DELETE` | `/api/access-rules/{id}/` | 524 | Delete access rule |
| 4 | Form Access Rules Management - View All Access Rules | `GET` | `/api/access-rules/` | 525 | List access rules |
| 5 | Form Access Rules Management - View Specific Access Rule | `GET` | `/api/access-rules/{id}/` | 526 | View specific access rule |

---

### Parent Module 10: Form Attempt Logs Management (ID: 618)
**Description**: Management of attempt logs and security tracking

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Form Attempt Logs Management - Insert Attempt Log | `POST` | `/api/attempt-logs/` | 527 | Create attempt log |
| 2 | Form Attempt Logs Management - Update Attempt Log | `PUT` | `/api/attempt-logs/{id}/` | 528 | Update attempt log |
| 3 | Form Attempt Logs Management - Delete Attempt Log | `DELETE` | `/api/attempt-logs/{id}/` | 529 | Delete attempt log |
| 4 | Form Attempt Logs Management - View All Attempt Logs | `GET` | `/api/attempt-logs/` | 530 | List attempt logs |
| 5 | Form Attempt Logs Management - View Specific Attempt Log | `GET` | `/api/attempt-logs/{id}/` | 531 | View specific attempt log |

---

### Parent Module 11: Question Analytics Management (ID: 624)
**Description**: Management and analysis of question performance metrics

| # | Child Module | HTTP | Endpoint | URL ID | Description |
|---|---|---|---|---|---|
| 1 | Question Analytics Management - Insert Question Analytics | `POST` | `/api/question-analytics/` | 532 | Create question analytics |
| 2 | Question Analytics Management - Update Question Analytics | `PUT` | `/api/question-analytics/{id}/` | 533 | Update question analytics |
| 3 | Question Analytics Management - Delete Question Analytics | `DELETE` | `/api/question-analytics/{id}/` | 534 | Delete question analytics |
| 4 | Question Analytics Management - View All Question Analytics | `GET` | `/api/question-analytics/` | 535 | List question analytics |
| 5 | Question Analytics Management - View Specific Question Analytics | `GET` | `/api/question-analytics/{id}/` | 536 | View specific question analytics |

---

## Statistics

| Metric | Count |
|--------|-------|
| **Super Parent Module** | 1 |
| **Parent Modules** | 11 |
| **Child Modules** | 54 |
| **Total Modules** | 66 |
| **Parent-Child Relationships** | 65 |
| **Total URL Endpoints** | 64 |
| **POST (Create)** | 11 |
| **PUT (Update)** | 11 |
| **DELETE** | 11 |
| **GET (Read)** | 31 |

---

## API Endpoints by HTTP Method

### POST Endpoints (Create Operations - 11 total)
| # | Endpoint | Parent Module | Description |
|---|---|---|---|
| 1 | `POST /api/forms/` | Forms Management | Create new form |
| 2 | `POST /api/form-sections/` | Form Sections Management | Create form section |
| 3 | `POST /api/form-questions/` | Form Questions Management | Create form question |
| 4 | `POST /api/question-pools/` | Question Pools Management | Create question pool |
| 5 | `POST /api/question-logic/` | Question Logic Management | Create question logic |
| 6 | `POST /api/form-responses/` | Form Responses Management | Create form response |
| 7 | `POST /api/form-answers/` | Form Answers Management | Create form answer |
| 8 | `POST /api/file-uploads/` | Response File Uploads Management | Create file upload |
| 9 | `POST /api/access-rules/` | Form Access Rules Management | Create access rule |
| 10 | `POST /api/attempt-logs/` | Form Attempt Logs Management | Create attempt log |
| 11 | `POST /api/question-analytics/` | Question Analytics Management | Create question analytics |

### PUT Endpoints (Update Operations - 11 total)
| # | Endpoint | Parent Module | Description |
|---|---|---|---|
| 1 | `PUT /api/forms/{id}/` | Forms Management | Update existing form |
| 2 | `PUT /api/form-sections/{id}/` | Form Sections Management | Update form section |
| 3 | `PUT /api/form-questions/{id}/` | Form Questions Management | Update form question |
| 4 | `PUT /api/question-pools/{id}/` | Question Pools Management | Update question pool |
| 5 | `PUT /api/question-logic/{id}/` | Question Logic Management | Update question logic |
| 6 | `PUT /api/form-responses/{id}/` | Form Responses Management | Update form response |
| 7 | `PUT /api/form-answers/{id}/` | Form Answers Management | Update form answer |
| 8 | `PUT /api/file-uploads/{id}/` | Response File Uploads Management | Update file upload |
| 9 | `PUT /api/access-rules/{id}/` | Form Access Rules Management | Update access rule |
| 10 | `PUT /api/attempt-logs/{id}/` | Form Attempt Logs Management | Update attempt log |
| 11 | `PUT /api/question-analytics/{id}/` | Question Analytics Management | Update question analytics |

### DELETE Endpoints (Delete Operations - 11 total)
| # | Endpoint | Parent Module | Description |
|---|---|---|---|
| 1 | `DELETE /api/forms/{id}/` | Forms Management | Delete form |
| 2 | `DELETE /api/form-sections/{id}/` | Form Sections Management | Delete form section |
| 3 | `DELETE /api/form-questions/{id}/` | Form Questions Management | Delete form question |
| 4 | `DELETE /api/question-pools/{id}/` | Question Pools Management | Delete question pool |
| 5 | `DELETE /api/question-logic/{id}/` | Question Logic Management | Delete question logic |
| 6 | `DELETE /api/form-responses/{id}/` | Form Responses Management | Delete form response |
| 7 | `DELETE /api/form-answers/{id}/` | Form Answers Management | Delete form answer |
| 8 | `DELETE /api/file-uploads/{id}/` | Response File Uploads Management | Delete file upload |
| 9 | `DELETE /api/access-rules/{id}/` | Form Access Rules Management | Delete access rule |
| 10 | `DELETE /api/attempt-logs/{id}/` | Form Attempt Logs Management | Delete attempt log |
| 11 | `DELETE /api/question-analytics/{id}/` | Question Analytics Management | Delete question analytics |

### GET Endpoints (Read Operations - 32 total)
| # | Endpoint | Parent Module | Description |
|---|---|---|---|
| 1 | `GET /api/forms/` | Forms Management | List all forms |
| 2 | `GET /api/forms/{id}/` | Forms Management | View specific form details |
| 3 | `GET /api/form-sections/` | Form Sections Management | List form sections |
| 4 | `GET /api/form-sections/{id}/` | Form Sections Management | View specific form section |
| 5 | `GET /api/form-questions/` | Form Questions Management | List form questions |
| 6 | `GET /api/form-questions/{id}/` | Form Questions Management | View specific form question |
| 7 | `GET /api/question-pools/` | Question Pools Management | List question pools |
| 8 | `GET /api/question-pools/{id}/` | Question Pools Management | View specific question pool |
| 9 | `GET /api/question-logic/` | Question Logic Management | List question logic |
| 10 | `GET /api/question-logic/{id}/` | Question Logic Management | View specific question logic |
| 11 | `GET /api/form-responses/` | Form Responses Management | List form responses |
| 12 | `GET /api/form-responses/{id}/` | Form Responses Management | View specific form response |
| 13 | `GET /api/form-answers/` | Form Answers Management | List form answers |
| 14 | `GET /api/form-answers/{id}/` | Form Answers Management | View specific form answer |
| 15 | `GET /api/file-uploads/` | Response File Uploads Management | List file uploads |
| 16 | `GET /api/file-uploads/{id}/` | Response File Uploads Management | View specific file upload |
| 17 | `GET /api/access-rules/` | Form Access Rules Management | List access rules |
| 18 | `GET /api/access-rules/{id}/` | Form Access Rules Management | View specific access rule |
| 19 | `GET /api/attempt-logs/` | Form Attempt Logs Management | List attempt logs |
| 20 | `GET /api/attempt-logs/{id}/` | Form Attempt Logs Management | View specific attempt log |
| 21 | `GET /api/question-analytics/` | Question Analytics Management | List question analytics |
| 22 | `GET /api/question-analytics/{id}/` | Question Analytics Management | View specific question analytics |

---

## Authentication

All API endpoints require Firebase authentication token. Include the token in the request header:

```
Authorization: Bearer <firebase_token>
```

### Login Endpoint
- **URL**: `POST /api/login/`
- **Description**: Validate Firebase token and get user profile + allowed URLs
- **Request Body**:
  ```json
  {
    "firebase_token": "firebase_token_here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "user@example.com",
      "email": "user@example.com",
      "firebase_uid": "firebase_uid_here"
    },
    "allowed_urls": [
      {"path": "/api/forms/", "method": "GET"},
      {"path": "/api/forms/", "method": "POST"},
      ...
    ]
  }
  ```

---

## Role-Based Access Control (RBAC)

Access to endpoints is controlled through a hierarchical module system:

1. **Super Parent Module**: Form Overall Management (controls all form features)
2. **Parent Modules** (11): Management categories like Forms, Sections, Questions, etc.
3. **Child Modules** (55): Specific operations (Insert, Update, Delete, View All, View Specific)
4. **URLs** (65): REST API endpoints mapped to each child module

### RBAC Flow
```
User → Role → Modules → URLs → Endpoints
  ↓       ↓       ↓        ↓        ↓
Auth    Role   Module   URL     Permission
Check   Check  Check   Check     Granted
```

**Access Control Hierarchy**:
- Super Parent (562): Form Overall Management
  - ├─ Parent (563): Forms Management
  - ├─ Parent (569): Form Sections Management
  - ├─ Parent (575): Form Questions Management
  - ├─ Parent (581): Question Pools Management
  - ├─ Parent (587): Question Logic Management
  - ├─ Parent (593): Form Responses Management
  - ├─ Parent (599): Form Answers Management
  - ├─ Parent (605): Response File Uploads Management
  - ├─ Parent (611): Form Access Rules Management
  - ├─ Parent (618): Form Attempt Logs Management
  - └─ Parent (624): Question Analytics Management

---

## CRUD Pattern

All endpoints follow RESTful CRUD conventions:

| Operation | HTTP Method | Endpoint Pattern | Example |
|-----------|------------|------------------|---------|
| **Create** | POST | `/api/{resource}/` | `POST /api/forms/` |
| **Read (List)** | GET | `/api/{resource}/` | `GET /api/forms/` |
| **Read (Detail)** | GET | `/api/{resource}/{id}/` | `GET /api/forms/1/` |
| **Update** | PUT | `/api/{resource}/{id}/` | `PUT /api/forms/1/` |
| **Delete** | DELETE | `/api/{resource}/{id}/` | `DELETE /api/forms/1/` |

---

## Response Format

### Success Response (200 OK)
```json
{
  "id": 1,
  "name": "Form Name",
  "status": "active",
  "created_at": "2026-02-24T10:30:00Z",
  "updated_at": "2026-02-24T10:30:00Z",
  "created_by": "user@example.com",
  "updated_by": "user@example.com"
}
```

### List Response (with pagination)
```json
{
  "count": 100,
  "next": "http://api.example.com/forms/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Form Name",
      ...
    }
  ]
}
```

### Error Response
```json
{
  "detail": "Not found.",
  "code": "not_found"
}
```

---

## Module Descriptions

### 1. Forms Management
- Create, manage, and configure forms
- Control form timing, navigation, shuffling, scoring
- Manage form security and access settings
- Support multiple form types and configurations

### 2. Form Sections Management
- Organize questions into logical sections
- Control section ordering and grouping
- Manage section-level configuration
- Support conditional section display

### 3. Form Questions Management
- Create and manage individual questions
- Set per-question scoring overrides
- Configure time limits per question
- Support multiple question types (MCQ, SAQ, etc.)

#### Recent Model/API Updates (2026-02-26)
- `FormQuestion.question_id` is now **Integer** (previous UUID usage removed in form question related models).
- New flag `consider_for_analytics` added to `FormQuestion` (default: `false`).
- `Form Questions` APIs now include `consider_for_analytics` in list/detail/create/update payloads.
- `Form Questions` list endpoint supports filtering by this flag via query parameters:
  - `GET /api/form-questions/?consider_for_analytics=true`
  - `GET /api/form-questions/?consider_for_analytics=false`
- **Deprecated**: Dedicated filter endpoint (URL 537, Module 630) removed. Use query parameter filtering instead.

#### Question ID Type Alignment
- The following fields are Integer-based now:
  - `FormQuestion.question_id`
  - `FormAnswer.question_id`
  - `ResponseFileUpload.question_id`
  - `QuestionAnalytics.question_id`
  - `QuestionLogic.source_question_id`
  - `QuestionLogic.target_question_id`

### 4. Question Pools Management
- Define question pools for random selection
- Manage pool composition and selection rules
- Control pool-based question randomization
- Track question usage in pools

### 5. Question Logic Management
- Set conditional show/hide logic based on answers
- Create complex question dependencies
- Manage jump logic and question flow
- Support branching scenarios

### 6. Form Responses Management
- Manage student form submissions
- Track attempt history and scoring
- Monitor response status and completion
- Support draft and final submissions

### 7. Form Answers Management
- Store individual answers to questions
- Track answer correctness and scoring
- Manage answer revisions and updates
- Support partial and complete answers

### 8. Response File Uploads Management
- Handle file uploads in form responses
- Manage file storage and validation
- Track upload history and metadata
- Support file type restrictions

### 9. Form Access Rules Management
- Set access restrictions (email domains, OTP, etc.)
- Manage IP-based access control
- Configure time-based access windows
- Support institution-specific rules

### 10. Form Attempt Logs Management
- Track attempt history and timestamps
- Detect cheating (tab switches, fullscreen exits)
- Monitor suspicious activity
- Generate audit trails

### 11. Question Analytics Management
- Analyze question difficulty and discrimination
- Calculate student accuracy per question
- Generate performance metrics and insights
- Support comparative analysis

---

## Pagination & Filtering

### Query Parameters
- `page` - Page number (starts at 1)
- `page_size` - Not enabled by default in current DRF pagination config
- `search` - Search term for name/description fields
- `ordering` - Sort field (use `-` prefix for descending order)

### Example Requests
```
# Get page 2
GET /api/forms/?page=2

# Search and filter
GET /api/forms/?search=exam&ordering=-created_dt

# Filter by status
GET /api/forms/?status=published

# Filter Form Questions by analytics flag
GET /api/form-questions/?consider_for_analytics=false
```

---

## Date & Time Format

All timestamps are in ISO 8601 format (UTC):
```
2026-02-24T10:30:00Z
```

**Timezone**: UTC (Coordinated Universal Time)  
**Format**: `YYYY-MM-DDTHH:MM:SSZ`

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `not_found` | 404 | Resource not found |
| `permission_denied` | 403 | Access denied (RBAC check failed) |
| `unauthenticated` | 401 | Missing/invalid Firebase token |
| `invalid_request` | 400 | Invalid request data or validation error |
| `conflict` | 409 | Resource conflict (duplicate, constraint violation) |
| `server_error` | 500 | Internal server error |

---

## Audit Trail

Every endpoint tracks user actions:
- `created_by` - User ID from secondary auth/profile context
- `created_dt` - Creation timestamp (ISO 8601 UTC)
- `updated_by` - User ID from secondary auth/profile context
- `updated_dt` - Last update timestamp (ISO 8601 UTC)

All audit fields are automatically populated and read-only.

---

## Database References

**Primary Database**: 
- **Name**: vidyanvesha_form
- **Host**: localhost:5432
- **Type**: PostgreSQL
- **Purpose**: Form management data

**Secondary Database** (RBAC):
- **Name**: vidyanvesha_core
- **Host**: AWS RDS
- **Type**: PostgreSQL
- **Purpose**: User roles, modules, permissions

**Key Tables**:
- `module_management_modules` - Module definitions
- `module_management_module_parentmodule` - Hierarchical relationships
- `module_management_urls` - URL endpoint mappings

---

## API Root Endpoint

```
GET /api/
```

Returns a JSON object listing all available API endpoints grouped by resource type.

**Example Response**:
```json
{
  "message": "Welcome to Form Management API",
  "version": "1.0",
  "endpoints": {
    "forms": "/api/forms/",
    "form-sections": "/api/form-sections/",
    "form-questions": "/api/form-questions/",
    "question-pools": "/api/question-pools/",
    "question-logic": "/api/question-logic/"
  }
}
```

---

## Rate Limiting

**Current Status**: No rate limiting  
**Planned**: Will be configured based on usage patterns

---

## Versioning

**Current API Version**: v1 (implicit in URL structure)

**Future Plans**:
- v2: Enhanced filtering and aggregation APIs
- v3: GraphQL support

---

## Filtering Common Fields

Most list endpoints support filtering by common fields:

```
# Filter by status
GET /api/forms/?status=published

# Filter by date range
GET /api/forms/?created_dt__gte=2026-01-01&created_dt__lte=2026-02-24

# Filter by user
GET /api/forms/?created_by=4
```

---

## Sorting Examples

```
# Sort by creation date (ascending)
GET /api/forms/?ordering=created_dt

# Sort by creation date (descending)
GET /api/forms/?ordering=-created_dt

# Sort by multiple fields
GET /api/forms/?ordering=-created_dt,title
```

---

## Support & Resources

- **Framework Documentation**: https://www.django-rest-framework.org/
- **Firebase Authentication**: https://firebase.google.com/docs/auth
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Django Documentation**: https://docs.djangoproject.com/

---

## API Changelog

### Version 1.2 (2026-02-26)
- ✅ Removed dedicated filter endpoint (URL 537, Module 630 - `form_questions_management___filter_by_consider_for_analytics`)
- ℹ️ Filtering by `consider_for_analytics` now done via query parameters on main list endpoint
- Total endpoints reduced from 65 to 64

### Version 1.1 (2026-02-26)
- ✅ `question_id` migrated to Integer across form question-related models
- ✅ Added `consider_for_analytics` field to `FormQuestion` (default `false`)
- ✅ Added `consider_for_analytics` support in form question serializers and list filtering
- ✅ Updated login docs to use `firebase_token` request payload

### Version 1.0 (2026-02-24)
- ✅ Initial release with 65 endpoints
- ✅ 11 parent modules with full CRUD operations
- ✅ Firebase authentication
- ✅ Hierarchical RBAC system
- ✅ Audit trail tracking
- ✅ Full pagination and filtering support

---

**Last Updated**: 2026-02-26  
**Status**: ✅ Production Ready  
**Generated By**: Automated API Documentation Generator  
**Maintained By**: Vidyanvesha Development Team
