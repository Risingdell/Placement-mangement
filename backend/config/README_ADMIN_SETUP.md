## Admin Tables Setup Guide

This guide explains the admin-specific database tables and how to set them up.

### 📋 Table of Contents
1. [New Admin Tables](#new-admin-tables)
2. [Setup Instructions](#setup-instructions)
3. [Table Descriptions](#table-descriptions)
4. [Usage Examples](#usage-examples)

---

## 🗄️ New Admin Tables

### Core Tables (12 new tables):

1. **companies** - Store company information separate from drives
2. **company_shortlists** - Track students shortlisted for each company
3. **admin_actions** - Log all admin activities
4. **placement_statistics** - Pre-calculated placement stats
5. **notifications** - System-wide notifications
6. **notification_recipients** - Track notification delivery
7. **admin_messages** - Admin-to-student communication
8. **document_verifications** - Profile document approval workflow
9. **system_settings** - Admin configuration settings
10. **bulk_operations** - Track bulk actions (emails, notifications)
11. **export_logs** - Track data exports
12. **profile_change_requests** - Track and approve profile changes

---

## 🚀 Setup Instructions

### Option 1: Manual Setup (Recommended)

```bash
# 1. Navigate to backend config directory
cd backend/config

# 2. Run schema.sql (if not already done)
mysql -u root -p placement_management < schema.sql

# 3. Create admin tables
mysql -u root -p placement_management < admin_tables.sql

# 4. Populate with dummy data
mysql -u root -p placement_management < admin_dummy_data.sql

# 5. (Optional) Add student dummy data
mysql -u root -p placement_management < ../dummy_data.sql
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your server
3. Open and execute files in this order:
   - `schema.sql`
   - `admin_tables.sql`
   - `admin_dummy_data.sql`
   - `../dummy_data.sql`

### Option 3: Using phpMyAdmin

1. Open phpMyAdmin
2. Select `placement_management` database
3. Go to Import tab
4. Import files in order (as above)

---

## 📊 Table Descriptions

### 1. **companies**
Stores detailed company information.

**Key Features:**
- Separate from placement drives (one company, multiple drives)
- Contact information, HR details
- Company type, size, industry
- Active/inactive status

**Use Cases:**
- View company history
- Track multiple drives per company
- Maintain company contact database

---

### 2. **company_shortlists**
Tracks which students are shortlisted for which companies.

**Key Features:**
- Links company → drive → student
- Status tracking (Shortlisted, Notified, Confirmed, Rejected)
- Notification timestamp
- Admin remarks

**Use Cases:**
- Admin creates shortlist for a company
- Send bulk notifications to shortlisted students
- Track confirmation status

---

### 3. **admin_actions**
Comprehensive logging of all admin activities.

**Key Features:**
- Action types: Create, Update, Delete, Send, Approve, Reject, Export
- Entity tracking (what was modified)
- Metadata storage (old/new values)
- IP and user agent tracking

**Use Cases:**
- Audit trail for compliance
- Track who made what changes
- Debug issues
- Generate admin activity reports

---

### 4. **placement_statistics**
Pre-calculated daily placement statistics.

**Key Features:**
- Daily snapshots of placement data
- Overall statistics (placed, unplaced, avg CTC)
- Branch-wise and company-wise stats (JSON)
- Historical data for trends

**Use Cases:**
- Quick dashboard statistics
- Trend analysis over time
- Reports generation
- Performance tracking

---

### 5. **notifications**
System-wide notifications to students.

**Key Features:**
- Target audience filtering (All, Students, Branch, Year, etc.)
- Priority levels (Low, Medium, High, Urgent)
- Expiry dates
- Types: Info, Success, Warning, Error, Drive, Announcement

**Use Cases:**
- Send drive announcements
- System-wide alerts
- Deadline reminders
- Important updates

---

### 6. **notification_recipients**
Tracks individual notification delivery and read status.

**Key Features:**
- Per-user delivery tracking
- Read/unread status
- Read timestamp
- Prevents duplicate notifications

**Use Cases:**
- Check who received notification
- Track read rates
- Resend to unread users

---

### 7. **admin_messages**
Direct admin-to-student messaging.

**Key Features:**
- Message threading (replies)
- Related to entities (Applications, Drives)
- Message types (General, Profile, Application, etc.)
- Read status tracking

**Use Cases:**
- Profile correction requests
- Application feedback
- General communication
- Warnings and notices

---

### 8. **document_verifications**
Document approval workflow for student profiles.

**Key Features:**
- Document types (Resume, Photo, Marksheet, etc.)
- Approval workflow (Pending, Approved, Rejected)
- Verification notes
- Verifier tracking

**Use Cases:**
- Approve student documents
- Request re-uploads
- Track verification progress
- Maintain document quality

---

### 9. **system_settings**
Configurable system parameters.

**Key Features:**
- Key-value configuration
- Categories (General, Eligibility, Access, etc.)
- Public/private settings
- Type validation (String, Number, Boolean, JSON)

**Default Settings:**
- Placement year
- Min CGPA requirement
- Max backlogs allowed
- Email notification toggle
- College name and contact info

---

### 10. **bulk_operations**
Tracks bulk actions performed by admins.

**Key Features:**
- Operation types (Email, SMS, Notification, Status Update, etc.)
- Filter criteria storage
- Success/failure tracking
- Result data storage
- Status workflow

**Use Cases:**
- Send bulk emails
- Mass status updates
- Track operation progress
- Audit bulk changes

---

### 11. **export_logs**
Tracks all data exports.

**Key Features:**
- Export types and formats
- Filter criteria
- File metadata (size, path)
- Download counting
- Auto-expiry support

**Use Cases:**
- Track who exported what data
- Download history
- Compliance and auditing
- Storage management

---

### 12. **profile_change_requests**
Approval workflow for profile changes.

**Key Features:**
- Field-level change tracking
- Old and new values
- Approval workflow
- Review notes

**Use Cases:**
- Students request profile updates
- Admin reviews and approves/rejects
- Audit trail of changes
- Prevent unauthorized modifications

---

## 💡 Usage Examples

### Example 1: Create Company Shortlist

```sql
-- 1. Admin creates shortlist for Google drive
INSERT INTO company_shortlists (company_id, drive_id, student_id, shortlisted_by, status)
VALUES (1, 1, 101, 201, 'Shortlisted');

-- 2. Send notifications to shortlisted students
INSERT INTO notifications (title, message, type, target_audience, created_by)
VALUES ('Shortlisted for Google', 'You have been shortlisted for Google SWE role!', 'Drive', 'Custom', 201);

-- 3. Log the action
INSERT INTO admin_actions (admin_id, action_type, entity_type, description)
VALUES (201, 'Create', 'Shortlist', 'Created shortlist for Google drive');
```

### Example 2: Approve Document

```sql
-- Admin approves a student's resume
UPDATE document_verifications
SET status = 'Approved',
    verified_by = 201,
    verification_notes = 'Resume verified and approved',
    verified_at = NOW()
WHERE id = 5;

-- Log the action
INSERT INTO admin_actions (admin_id, action_type, entity_type, entity_id, description)
VALUES (201, 'Approve', 'Document', 5, 'Approved resume for student');
```

### Example 3: Generate Statistics

```sql
-- Calculate and store daily statistics
INSERT INTO placement_statistics (
    stat_date, total_students, eligible_students, placed_students,
    total_companies, avg_ctc, highest_ctc
)
SELECT
    CURDATE(),
    COUNT(*),
    SUM(CASE WHEN sa.cgpa >= 6.0 THEN 1 ELSE 0 END),
    SUM(u.is_placed),
    (SELECT COUNT(*) FROM companies WHERE is_active = 1),
    AVG(CASE WHEN u.is_placed THEN pd.ctc END),
    MAX(CASE WHEN u.is_placed THEN pd.ctc END)
FROM users u
LEFT JOIN student_academics sa ON u.id = sa.user_id
LEFT JOIN applications a ON u.id = a.user_id
LEFT JOIN placement_drives pd ON a.drive_id = pd.id
WHERE u.role = 'student';
```

### Example 4: Bulk Email Operation

```sql
-- Track bulk email to unplaced CSE students
INSERT INTO bulk_operations (
    operation_type, target_entity, filter_criteria,
    total_count, status, initiated_by
)
VALUES (
    'Email',
    'Students',
    '{"branch": "CSE", "is_placed": false}',
    45,
    'Queued',
    201
);
```

---

## 🎯 Admin Dashboard Integration

These tables power the following admin features:

1. **Dashboard** - Uses `placement_statistics` for quick stats
2. **Companies** - Uses `companies` table
3. **Student Management** - Uses `document_verifications`, `profile_change_requests`
4. **Shortlist Management** - Uses `company_shortlists`
5. **Notifications** - Uses `notifications`, `notification_recipients`
6. **Messages** - Uses `admin_messages`
7. **Reports** - Uses `placement_statistics`, `export_logs`
8. **Activity Log** - Uses `admin_actions`
9. **Settings** - Uses `system_settings`

---

## 🔐 Security Considerations

1. **Access Control**: Only admin/TPO roles can access these tables
2. **Audit Trail**: All actions logged in `admin_actions`
3. **Data Privacy**: Export logs track data access
4. **Approval Workflow**: Profile changes require admin approval

---

## 📈 Performance Tips

1. **Indexes**: All foreign keys are indexed
2. **Statistics**: Pre-calculate daily stats instead of real-time queries
3. **Archiving**: Old export logs can be archived after expiry
4. **Bulk Ops**: Use bulk operations for mass updates instead of individual queries

---

## 🛠️ Maintenance

### Daily Tasks
- Calculate and store placement statistics
- Clean up expired notifications
- Archive old export files

### Weekly Tasks
- Review admin action logs
- Check pending document verifications
- Process profile change requests

### Monthly Tasks
- Generate placement reports
- Archive old bulk operation records
- Review system settings

---

## 📞 Support

For issues or questions:
- Check the main [README.md](../../README.md)
- Review the [database schema](schema.sql)
- Contact: support@placement.edu
