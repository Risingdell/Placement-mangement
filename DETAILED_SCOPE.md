# Placement Management System - Detailed Scope & Bug Analysis

**Last Updated**: 2026-03-23
**Project**: Placement Management System (React 19 + Node.js + MySQL)

---

## 📋 EXECUTIVE SUMMARY

This document provides a comprehensive analysis of the admin and student functionalities in the placement management system. It identifies the current architecture, data flows, role-based access control, and known issues to help prioritize and resolve bugs systematically.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Technology Stack
- **Frontend**: React 19 + Vite + Tailwind CSS + React Router DOM 7
- **Backend**: Node.js + Express + MySQL (mysql2 promisePool)
- **Authentication**: JWT (7-day expiry) + bcrypt passwords
- **Database**: MySQL with 15+ tables and relationships
- **File Uploads**: Multer middleware for photos, resumes, certificates
- **Notifications**: Email via Resend API, In-app messages/notifications

### Project Structure
```
placement-management-system/
├── backend/
│   ├── routes/               # 14 route files
│   ├── controllers/          # 14 controller files
│   ├── middlewares/          # Auth, upload, error handling
│   ├── models/              # Database models (if any)
│   ├── config/              # Database, environment setup
│   └── scripts/             # Setup, migration scripts
├── src/                     # React frontend
│   ├── pages/
│   │   ├── admin/          # 10 admin pages
│   │   └── student/        # 7 student pages
│   ├── services/           # API communication
│   ├── components/         # Reusable React components
│   ├── contexts/           # Theme, auth contexts
│   └── styles/             # Global CSS
├── docker-compose.yml      # Container orchestration
├── Dockerfile + .dockerignore
└── README.md
```

---

## 👨‍💼 ADMIN FUNCTIONALITY SCOPE

### Admin Routes & Endpoints (42 routes)

#### 1. **Student Management** (`/api/admin/students`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get all students (search, filter, sort) | List, Filter, Pagination |
| GET | `/stats` | Student statistics | Dashboard metrics |
| GET | `/:id` | Get student by ID | Detailed view |
| PUT | `/:id` | Update student profile | Edit basic info |
| PUT | `/:id/placement-status` | Toggle is_placed | Mark placed/unplaced |
| GET | `/documents/pending` | Get pending verifications | Document workflow |
| PUT | `/documents/:docId/verify` | Verify document | Approval workflow |
| GET | `/profile-changes/pending` | Get change requests | Change approval |
| PUT | `/profile-changes/:requestId/approve` | Approve profile change | Approval workflow |

**Key Data Fields**:
- Searchable: name, email, usn, branch
- Filterable: branch, batch_year, is_placed, eligible (CGPA ≥ 6.0)
- Sortable: name, cgpa, ctc, placement_date

---

#### 2. **Company Management** (`/api/admin/companies`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/eligible-students` | Get students matching criteria | Company filtering |
| GET | `/` | Get all companies (search, filter) | List with counts |
| GET | `/:id` | Get company details | Detailed view |
| POST | `/` | Create new company | Form submission |
| PUT | `/:id` | Update company | Edit details |
| DELETE | `/:id` | Delete company (CASCADE) | Soft/hard delete |
| GET | `/:id/shortlists` | Get shortlisted students | List shortlists |
| POST | `/:id/shortlists` | Add students to shortlist | Bulk shortlist |
| PUT | `/shortlists/:shortlistId` | Update shortlist status | Status workflow |
| DELETE | `/shortlists/:shortlistId` | Remove from shortlist | Delete shortlist |
| POST | `/:id/notify` | Send notification to shortlisted | Email/message send |

**Key Operations**:
- Company CRUD with cascading deletes
- Shortlist management (add/remove/update students)
- Eligibility filtering: CGPA, branch, backlogs, batch_year
- Notification sending to shortlisted students

---

#### 3. **Placement Drives** (`/api/admin/drives`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| POST | `/` | Create placement drive | Form submission |
| GET | `/` | Get all drives | List, search, filter |
| GET | `/:id` | Get drive details | Detailed view |
| PUT | `/:id` | Update drive | Edit details |
| DELETE | `/:id` | Delete drive | Delete cascade |

**Key Data**:
- Drive info: company_name, job_title, package, location, job_type
- Eligibility: min_cgpa, max_active_backlogs, allowed_branches (JSON), allowed_batch_years
- Timeline: drive_date, registration_deadline, status (upcoming/active/completed)
- Tracking: created_by, attendance tracking

---

#### 4. **Applications Management** (`/api/admin/applications`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get all applications | List, filter, search |
| GET | `/stats` | Application statistics | Dashboard metrics |
| GET | `/:id` | Get application details | Single app view |
| PUT | `/:id/status` | Update application status | Status workflow |
| POST | `/bulk/update-status` | Bulk update statuses | Batch operations |
| POST | `/export` | Export applications | CSV/Excel export |

**Workflow**:
- Status flow: Applied → Shortlisted → Selected/Rejected → Withdrawn
- Bulk operations for efficiency
- Export for reporting

---

#### 5. **Statistics & Reporting** (`/api/admin/stats`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/dashboard` | Dashboard statistics | Overview metrics |
| GET | `/placement` | Placement trends | Time-series data |
| GET | `/branch-wise` | Branch-wise stats | Comparative analysis |
| GET | `/company-wise` | Company-wise stats | Company performance |
| GET | `/salary-analysis` | CTC distribution | Salary insights |
| GET | `/application-trends` | Application trends | Trend analysis |
| POST | `/export` | Export report | CSV/Excel export |

**Metrics Tracked**:
- Total students, placed students, eligible students
- Average CTC, highest CTC, lowest CTC
- Branch-wise placement rates
- Company-wise placements
- Application status breakdown

---

#### 6. **Events Management** (`/api/admin/events`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| POST | `/` | Create event | Form submission |
| GET | `/` | Get all events | List, filter |
| GET | `/:id` | Get event details | Single event |
| PUT | `/:id` | Update event | Edit details |
| DELETE | `/:id` | Delete event | Delete event |

**Event Types**:
- Workshop, Seminar, Mock Interview, Career Fair
- Fields: title, description, date, location, duration, registrations

---

#### 7. **Messaging** (`/api/admin/inbox` or similar)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get all messages | List view |
| GET | `/:id` | Get single message | Detail view |
| POST | `/` | Send message to student | Compose |
| POST | `/:id/reply` | Reply to student | Reply workflow |
| PUT | `/:id/read` | Mark as read | Read tracking |
| DELETE | `/:id` | Delete message | Delete |

---

#### 8. **Notifications** (`/api/admin/notifications`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get notifications | List view |
| GET | `/:id` | Get single notification | Detail view |
| POST | `/` | Create notification | Create |
| PUT | `/:id` | Update notification | Edit |
| DELETE | `/:id` | Delete notification | Delete |
| POST | `/:id/send` | Send notification | Dispatch |
| GET | `/:id/recipients` | Get recipients | Tracking |

---

#### 9. **Authorized Emails** (`/api/auth/authorized-emails`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get all authorized emails | List, filter |
| POST | `/` | Add authorized email | Single entry |
| POST | `/bulk` | Bulk import emails | CSV upload |
| GET | `/statistics` | Email statistics | Dashboard |
| GET | `/:id` | Get email details | Detail view |
| PUT | `/:id` | Update email | Edit |
| DELETE | `/:id` | Delete email | Delete |
| PATCH | `/:id/status` | Toggle email status | Activate/deactivate |

---

#### 10. **Attendee Management** (`/api/drives/:driveId/attendees`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/drives/:driveId/attendees` | Get attendees | List |
| POST | `/drives/:driveId/attendees` | Add attendees | Bulk add |
| DELETE | `/drives/:driveId/attendees/:userId` | Remove attendee | Delete |
| GET | `/drives/:driveId/non-attendees` | Get non-attendees | Inverse list |
| POST | `/drives/:driveId/attendees/send-message` | Send message to attendees | Bulk message |

---

### Admin Frontend Pages (10 pages)

1. **AdminDashboardHome.jsx** - Overview dashboard
   - Stats: Students, Placed, Eligible, Companies, Drives, Apps
   - Recent placements, avg CTC, highest CTC
   - Quick action buttons

2. **StudentsPage.jsx** - Student management
   - Search, filter, sort students
   - Bulk actions
   - Profile viewing

3. **CompaniesPage.jsx** - Company management
   - Add/edit/delete companies
   - Shortlist management modal
   - Eligible student calculation
   - Notify shortlisted students

4. **PlacementDrivesPage.jsx** - Drive management
   - Create/edit/delete drives
   - Set eligibility criteria
   - View applications per drive

5. **ApplicationsPage.jsx** - Application management
   - View all applications
   - Filter by status
   - Bulk update statuses
   - Export applications

6. **EventsPage.jsx** - Event management
   - Create/edit/delete events
   - Event type selection
   - Date/location management

7. **MessagesPage.jsx** - Messaging interface
   - Send messages to students
   - Message history/replies
   - Bulk messaging capability

8. **ReportsPage.jsx** - Analytics & reports
   - Statistics visualizations
   - Charts and graphs
   - Export reports

9. **AuthorizedEmailsPage.jsx** - Email whitelist management
   - Add/remove authorized emails
   - Bulk import (CSV)
   - Toggle email status

10. **AdminNotificationsPage.jsx** (if exists) - Notification management
    - Create notifications
    - Send to targeted groups
    - Track delivery/read status

---

## 👨‍🎓 STUDENT FUNCTIONALITY SCOPE

### Student Routes & Endpoints (19 routes)

#### 1. **Placement Drives** (`/api/drives`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get all drives (with eligibility) | List, filter, search |
| GET | `/:id` | Get drive details | Detailed view |
| GET | `/upcoming/preview` | Get upcoming drives | Dashboard widget |

**Special Logic**:
- **Admin/TPO**: See all drives, no eligibility filter
- **Student**: Only eligible drives shown, with reasons if ineligible
- Eligibility checks:
  - CGPA ≥ drive's min_cgpa
  - active_backlogs ≤ drive's max_backlogs
  - branch in drive's allowed_branches
  - not already is_placed
- Response includes: `isEligible`, `eligibilityReasons`, `hasApplied`, `applications_count`

---

#### 2. **Applications** (`/api/applications`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get my applications | Student's app list |
| GET | `/:id` | Get application details | Single app detail |
| POST | `/` | Apply for drive | Submit application |
| DELETE | `/:id` | Withdraw application | Cancel application |

**Validation on Apply**:
- Check eligibility criteria
- Check not already applied to drive
- Check application deadline passed
- Check not already placed

**Fields in Response**:
- Drive info: company_name, job_title, job_role, package, ctc, location
- Application: status, applied_at, created_at
- Status history tracking

---

#### 3. **Student Profile** (`/api/profile`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get complete profile | All student data |
| GET | `/eligibility` | Get eligibility status | Placement eligibility |
| GET | `/ranking` | Get ranking insights | Peer comparison |
| PUT | `/basic` | Update basic info | Name, email, phone |
| PUT | `/academics` | Update academics | CGPA, branch, backlogs |
| POST | `/photo` | Upload profile photo | Multipart upload |
| POST | `/resume` | Upload resume | Multipart upload |
| DELETE | `/resume` | Delete resume | Remove file |
| POST | `/skills` | Add skill | Create |
| DELETE | `/skills/:id` | Delete skill | Delete |
| POST | `/projects` | Add project | Create |
| PUT | `/projects/:id` | Update project | Edit |
| DELETE | `/projects/:id` | Delete project | Delete |
| POST | `/achievements` | Add achievement | Create |
| DELETE | `/achievements/:id` | Delete achievement | Delete |
| POST | `/achievements/:id/certificate` | Upload achievement certificate | Multipart upload |
| POST | `/portfolios` | Add portfolio | Create |
| PUT | `/portfolios/:id` | Update portfolio | Edit |
| DELETE | `/portfolios/:id` | Delete portfolio | Delete |
| POST | `/internships` | Add internship | Create |
| PUT | `/internships/:id` | Update internship | Edit |
| DELETE | `/internships/:id` | Delete internship | Delete |

**Profile Sections**:
1. **Basic Info**: Name, email, phone, whatsapp_number, photo_url
2. **Academics**: Branch, batch_year, current_semester, CGPA, SGPA, backlogs, resumes
3. **Skills**: Skill name, proficiency level
4. **Projects**: Title, description, tech stack, GitHub/project URL
5. **Achievements**: Title, issuer, issued_date, certificate
6. **Internships**: Company, role, duration, dates, description
7. **Portfolios**: Portfolio URL, description, built_with
8. **Semester Marks**: Semester-wise CGPA/SGPA (read-only)

---

#### 4. **Events** (`/api/events`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get all events | List, filter by type |
| GET | `/:id` | Get event details | Single event |
| GET | `/upcoming/preview` | Get upcoming events | Dashboard widget |
| GET | `/range` | Get events by date range | Calendar data |
| GET | `/calendar` | Get calendar events | Calendar view |

**Event Registration**: (Likely via separate endpoint)
- Register for event
- View registration status
- Track attendance

---

#### 5. **Inbox/Messages** (`/api/inbox`)
| Method | Endpoint | Function | Status |
|--------|----------|----------|--------|
| GET | `/` | Get my messages | Inbox list |
| GET | `/unread/count` | Get unread count | Badge count |
| GET | `/preview` | Get inbox preview | Dashboard widget |
| GET | `/:id` | Get message details | Single message |
| PUT | `/:id/read` | Mark as read | Read tracking |
| PUT | `/:id/unread` | Mark as unread | Mark unread |
| DELETE | `/:id` | Delete message | Delete |

**Message Features**:
- Receive-only (students can't initiate)
- Admin can send bulk messages
- Read status tracking
- Delete capability

---

### Student Frontend Pages (7 pages)

1. **DashboardPage.jsx** - Student dashboard
   - Profile completion percentage
   - Total applications count
   - Ranking/insights
   - Upcoming drives widget
   - Upcoming events list
   - Inbox preview
   - Latest activity feed

2. **DrivesPage.jsx** - Browse placement drives
   - List all eligible drives
   - Filter by status (All, Upcoming, Active, Completed)
   - Search by company
   - Show eligibility status and reasons if ineligible
   - Apply button/modal
   - Show has_applied status

3. **ApplicationsPage.jsx** - Student's applications
   - View all applications
   - Filter by status (Applied, Shortlisted, Selected, Rejected, Withdrawn)
   - View application details
   - Status history
   - Withdraw option

4. **EventsPage.jsx** - Browse events
   - List all events
   - Filter by event type
   - Register for events
   - View event details
   - Calendar view (optional)

5. **ProfilePage.jsx** - Complete profile management
   - Multiple sections (accordion/tabs):
     - Basic Info (edit)
     - Academics (view/edit)
     - Photo (upload)
     - Resume (upload/delete)
     - Skills (add/delete)
     - Projects (add/edit/delete)
     - Achievements (add/delete + certificate upload)
     - Portfolio (add/edit/delete)
     - Internships (add/edit/delete)
   - Profile completion percentage
   - Eligibility status display

6. **InboxPage.jsx** - Message inbox
   - View messages from admin
   - Mark read/unread
   - Delete messages
   - Unread count badge

7. **RankingPage.jsx** (optional) - Placement ranking
   - Student's ranking among peers
   - Comparative metrics
   - Performance insights

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Role System
```
┌─────────────────────────┐
│   Three Roles           │
├─────────────────────────┤
│ 1. admin                │ ← Full system access
│ 2. tpo                  │ ← Same as admin (Training & Placement Officer)
│ 3. student              │ ← Limited, profile + application access
└─────────────────────────┘
```

### Registration Flow
```
1. Check authorized_emails whitelist (required)
2. Validate email not already registered
3. Optional: Validate USN/branch/batch_year match whitelist
4. Hash password (bcrypt, salt 10)
5. Create user with role = 'student' (ALWAYS)
6. Create student_academics record
7. Mark authorized_email as is_used = TRUE
```

**Critical**: Role is ALWAYS 'student' on registration. Only database can change it to 'admin' or 'tpo'.

### Authentication Flow
```
Login Request
    ↓
Validate email + password
    ↓
Generate JWT (7-day expiry, claims: {id})
    ↓
Return token + user object (id, usn, email, name, role, is_placed, whatsapp_number)
    ↓
Frontend stores in localStorage
    ↓
Subsequent requests: Authorization: Bearer {token}
    ↓
Backend protect middleware:
  - Extract token
  - Verify JWT signature
  - Query users table by ID
  - Check is_active = TRUE
  - Attach to req.user
```

### Authorization Flow
```
Protected Route with restrictTo('admin', 'tpo')
    ↓
protect middleware (validate token, attach req.user)
    ↓
restrictTo('admin', 'tpo') middleware
    ↓
Check req.user.role IN ['admin', 'tpo']
    ↓
If NO: return 403 Forbidden
If YES: proceed to controller
```

### Key Middleware
- **protect**: Validates JWT, queries user, checks is_active
- **restrictTo(...roles)**: Checks req.user.role in allowed roles
- **handleUploadError**: Catches multer upload errors

### Deactivation
- Admin can set `is_active = FALSE` on user account
- Any login/request by deactivated user returns 401
- Student cannot reactivate themselves

---

## 💾 DATABASE SCHEMA

### Core Tables (15+)

#### users
```
id, usn (UNIQUE), email (UNIQUE), password_hash, full_name,
phone, whatsapp_number, role (DEFAULT 'student'),
is_active (DEFAULT TRUE), is_placed (DEFAULT FALSE),
created_at, updated_at

Indexes: email, usn, role
```

#### student_academics
```
id, user_id (FK), branch, batch_year, current_semester,
cgpa, sgpa, tenth_percentage, twelfth_percentage,
diploma_percentage, total_backlogs, active_backlogs,
photo_url, resume_url, created_at, updated_at

Indexes: user_id, branch, batch_year
```

#### placement_drives
```
id, company_name, job_title, job_description, job_type,
package_offered, package_currency, location,
min_cgpa, max_active_backlogs,
allowed_branches (JSON), allowed_batch_years,
required_skills, drive_date, registration_deadline,
status (ENUM), created_by (FK), created_at, updated_at

Indexes: status, drive_date, registration_deadline
```

#### applications
```
id, drive_id (FK), user_id (FK),
status (ENUM: Applied/Shortlisted/Selected/Rejected/Withdrawn),
applied_at, updated_at, remarks

Unique: (drive_id, user_id)
Indexes: drive_id, user_id, status
```

#### companies
```
id, name, company_type, industry, location, website,
description, contact_email, contact_phone,
hr_name, company_size, is_active, created_at, updated_at
```

#### company_shortlists
```
id, company_id (FK), student_id (FK), status,
created_at, updated_at

Unique: (company_id, student_id)
```

#### authorized_emails
```
id, email (UNIQUE), is_active (DEFAULT TRUE),
is_used (DEFAULT FALSE), student_name, usn,
branch, batch_year, used_by_user_id (FK),
used_at, created_at, updated_at

Indexes: email, is_active, is_used
```

#### events
```
id, title, description, event_type (ENUM),
event_date, duration, location, organizer,
registration_required, registration_deadline,
max_participants, created_by (FK),
created_at, updated_at

Indexes: event_date, event_type
```

#### event_registrations
```
id, event_id (FK), user_id (FK), registration_date,
attendance_status (ENUM: Registered/Attended/Absent)

Unique: (event_id, user_id)
Indexes: event_id, user_id
```

#### skills
```
id, user_id (FK), skill_name, proficiency_level (ENUM),
category, created_at

Indexes: user_id
```

#### projects
```
id, user_id (FK), title, description, technologies,
start_date, end_date, project_url, github_url,
tech_stack, status, is_ongoing, created_at, updated_at

Indexes: user_id
```

#### achievements
```
id, user_id (FK), title, description, issued_by,
issued_date, certificate_url, type,
issuer, date_achieved, created_at

Indexes: user_id
```

#### internships
```
id, user_id (FK), company_name, role, duration_months,
start_date, end_date, description, certificate_url,
created_at, updated_at

Indexes: user_id
```

#### portfolios
```
id, user_id (FK), title, portfolio_url, description,
built_with, build_details, created_at, updated_at

Indexes: user_id
```

#### password_reset_tokens
```
id, user_id (FK), token, expires_at,
used (DEFAULT FALSE), created_at

Indexes: token, user_id, expires_at
```

#### Other tables: notifications, inbox/messages, drive_attendees, semester_marks, etc.

---

## 🚨 KNOWN ISSUES & BUGS

### From Memory (Previous Sessions)

1. **403 Forbidden on Admin Routes**
   - Cause: User logged in as student, not admin
   - Fix: Use admin@college.edu to login
   - Related: Authentication/role checking

2. **Events 400 "Title and event date required"**
   - Cause: Frontend sending snake_case (event_date), backend expects camelCase (eventDate)
   - Fix: Map snake_case → camelCase on frontend before submit
   - Related: Field name mapping, EventsPage.jsx

3. **Input Text Invisible**
   - Cause: Missing CSS for input/textarea/select colors
   - Fix: Add global CSS rule in src/styles/base.css with text-gray-900 bg-white
   - Related: Styling, form fields

4. **500 on Stats/Application Endpoints**
   - Cause: Wrong database import (pool vs promisePool)
   - Fix: Use `{ promisePool: db }` or `{ promisePool }` in controllers
   - Pattern: `const { promisePool } = require('../config/database')`
   - Related: adminStatsController.js, adminApplicationController.js

5. **404 "Academic info not found" for Admin**
   - Cause: getAllDrives queried student_academics without role check
   - Fix: Skip student_academics check for admin/tpo users
   - Related: driveController.js

### Potential Bugs to Investigate

1. **API Base URL Configuration**
   - Check: `VITE_API_URL` env var fallback in api.js
   - Issue: Might mismatch between dev/prod environments
   - Fix: Verify correct fallback to `http://localhost:5000/api`

2. **JWT Token Expiration**
   - Check: 7-day expiry might be too long/short for your use case
   - Issue: Expired tokens cause 401 errors without clear messaging
   - Fix: Implement token refresh mechanism if needed

3. **Cascading Deletes**
   - Check: Company deletion deletes all shortlists and related data
   - Issue: Might lose important historical data
   - Fix: Consider soft deletes or archive logic for audit trails

4. **Bulk Email Whitelist Import**
   - Check: CSV parsing and validation
   - Issue: Large files might timeout, duplicate handling unclear
   - Fix: Add pagination, duplicate detection, batch processing

5. **File Upload Size Limits**
   - Check: Resume/photo/certificate file size restrictions
   - Issue: Users might upload large files causing server errors
   - Fix: Set clear size limits, provide user-friendly error messages

6. **GET Request Deduplication Cache**
   - Check: 1.5s cache might cause stale data in real-time scenarios
   - Issue: Data might not reflect latest state immediately
   - Fix: Make cache duration configurable, provide refresh button

7. **Eligibility Calculation**
   - Check: JSON parsing of allowed_branches, allowed_batch_years
   - Issue: Malformed JSON crashes eligibility check
   - Fix: Add try-catch and validation for JSON fields

8. **Drive Attendance Tracking**
   - Check: How attendance is marked (manual vs automatic)
   - Issue: attendance_key might not be generated/validated
   - Fix: Implement QR code or manual entry mechanism

9. **Password Reset Email**
   - Check: Resend API configuration
   - Issue: Email might not send, reset link might expire
   - Fix: Test email delivery, verify token expiration (30 min)

10. **Student Profile Completion**
    - Check: How percentage is calculated (missing fields)
    - Issue: Unclear which fields are mandatory vs optional
    - Fix: Define completion rules clearly

11. **Notification Delivery**
    - Check: How bulk notifications are sent
    - Issue: Large bulk sends might timeout
    - Fix: Implement queue-based notification system

12. **Application Status Workflow**
    - Check: If invalid status transitions are prevented
    - Issue: Status might jump from Applied directly to Selected
    - Fix: Validate workflow (Applied → Shortlisted → Selected/Rejected)

13. **Error Messages**
    - Check: If backend returns user-friendly error messages
    - Issue: Generic error responses don't help debugging
    - Fix: Return specific error codes and messages

14. **CORS Issues**
    - Check: CORS configuration for different environments
    - Issue: Requests blocked in some environments
    - Fix: Verify allowed origins match deployment URLs

15. **Database Connection Pooling**
    - Check: Max connections, timeout settings
    - Issue: Connections might be exhausted under load
    - Fix: Monitor pool stats, adjust max connections

---

## 📊 BUG CATEGORIES FOR PLANNING

### Priority 1: Critical (Affects Core Functionality)
- [ ] Authentication/authorization issues (403, 401 errors)
- [ ] Database connection errors (500 on API calls)
- [ ] Role-based access control (admin routes returning 403)
- [ ] Application workflow (can't apply, can't withdraw)
- [ ] Student profile (can't update, missing fields)

### Priority 2: High (Affects User Experience)
- [ ] Form field mapping (snake_case ↔ camelCase)
- [ ] Input styling (invisible text, unreadable forms)
- [ ] Eligibility calculation (wrong students shown/hidden)
- [ ] File uploads (resume, photo, certificate)
- [ ] Search and filter functionality
- [ ] Pagination on large lists

### Priority 3: Medium (Nice to Have)
- [ ] Email notifications
- [ ] Bulk operations (CSV import, bulk updates)
- [ ] Export functionality (CSV, Excel)
- [ ] Analytics and reports
- [ ] Caching and performance
- [ ] Error handling improvements

### Priority 4: Low (Polish/Optimization)
- [ ] UI/UX improvements
- [ ] Dark mode consistency
- [ ] Mobile responsiveness
- [ ] Accessibility features
- [ ] Documentation updates

---

## 🧪 TESTING SCOPE

### Admin Testing
- [ ] Login as admin (admin@college.edu / Admin@1234)
- [ ] Dashboard loads correctly with all stats
- [ ] Add/edit/delete company
- [ ] Create placement drive with eligibility criteria
- [ ] Shortlist students (single and bulk)
- [ ] Update application statuses
- [ ] Send notifications to students
- [ ] View and filter students list
- [ ] Create and manage events
- [ ] Upload authorized emails (CSV)
- [ ] Export reports (CSV/Excel)
- [ ] View statistics (branch-wise, company-wise, salary analysis)

### Student Testing
- [ ] Login as student (student email)
- [ ] View profile and complete sections
- [ ] Upload photo and resume
- [ ] Add skills, projects, achievements, internships
- [ ] View eligible placement drives
- [ ] Apply for drive (should be eligible)
- [ ] Try to apply for ineligible drive (should show reason)
- [ ] View applications list
- [ ] Withdraw from application
- [ ] View inbox messages from admin
- [ ] Browse events and register

### Integration Testing
- [ ] Admin creates drive → Students see it → Students apply → Admin updates status
- [ ] Admin sends message → Student receives → Student reads
- [ ] Admin shortlists student → Student can't apply to other drives (if placed)
- [ ] Multiple students apply → Admin bulk updates → All get notifications

### Edge Cases
- [ ] Login with deactivated account (should fail)
- [ ] Access admin routes as student (should return 403)
- [ ] Access student routes as admin (should work)
- [ ] Expired JWT token (should return 401)
- [ ] Large file upload (should handle gracefully)
- [ ] Concurrent applications to same drive (should prevent duplicate)
- [ ] Delete company with existing shortlists (should cascade)

---

## 🎯 RECOMMENDED FIX PRIORITIES

### Phase 1: Foundation (Critical Bugs)
1. Verify database connection (promisePool vs pool)
2. Test authentication/authorization flows
3. Fix role-based access control (restrictTo middleware)
4. Fix form field mapping (snake_case ↔ camelCase)
5. Fix input styling (invisible text issue)

### Phase 2: Core Features
6. Test application workflow (apply, withdraw, status update)
7. Test student profile (all sections, file uploads)
8. Test placement drive eligibility logic
9. Test admin student management (search, filter, bulk)
10. Test company and shortlist management

### Phase 3: Enhancement
11. Implement email notifications
12. Fix bulk operations (CSV import, bulk updates)
13. Implement export functionality
14. Add error handling improvements
15. Optimize database queries and caching

### Phase 4: Polish
16. UI/UX improvements and consistency
17. Dark mode fixes
18. Mobile responsiveness
19. Accessibility features
20. Documentation and comments

---

## 📝 VERIFICATION CHECKLIST

Before declaring a bug fixed:
- [ ] Tested in both admin and student roles
- [ ] Verified database changes persisted
- [ ] No console errors in browser
- [ ] No server errors in backend logs
- [ ] Responsive on mobile/tablet
- [ ] Proper error messages displayed
- [ ] Related features still working
- [ ] Performance acceptable (< 3s load time)

---

## 📚 FILE REFERENCES

### Key Files to Review
- **Authentication**: `backend/middlewares/authMiddleware.js`, `backend/controllers/authController.js`
- **Database Config**: `backend/config/database.js`
- **API Service**: `src/services/api.js`
- **Admin Routes**: `backend/routes/admin*.js` (14 files)
- **Student Routes**: `backend/routes/profile.js`, `backend/routes/applications.js`, `backend/routes/drives.js`
- **Controllers**: `backend/controllers/*.js`
- **Frontend Pages**: `src/pages/admin/` and `src/pages/`

---

**Last Revision**: 2026-03-23 | **Author**: Claude Code Analysis
