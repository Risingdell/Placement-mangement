# Placement Management System - Backend

Node.js + Express + MySQL backend for the Placement Management System.

## Prerequisites

- Node.js (v14 or higher)
- XAMPP (for MySQL database)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure XAMPP MySQL

1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create a new database named `placement_management`
5. Import the database schema:
   - Go to the SQL tab
   - Copy and paste the contents of `config/database.sql`
   - Click "Go" to execute

### 3. Environment Configuration

The `.env` file is already created with default XAMPP settings:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=placement_management
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

FRONTEND_URL=http://localhost:5173
```

**IMPORTANT:** Change the `JWT_SECRET` to a strong random string before deploying to production.

### 4. Database Setup

Execute the SQL schema file in MySQL:

**Option 1: Using phpMyAdmin**
1. Open http://localhost/phpmyadmin
2. Select the `placement_management` database
3. Go to SQL tab
4. Copy contents from `config/database.sql` and execute

**Option 2: Using MySQL command line**
```bash
mysql -u root -p placement_management < config/database.sql
```

### 5. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user (Protected)

### Profile
- `GET /api/profile` - Get full profile (Protected)
- `GET /api/profile/eligibility` - Get eligibility status (Protected)
- `PUT /api/profile/academics` - Update academic info (Protected)
- `POST /api/profile/photo` - Upload profile photo (Protected)
- `POST /api/profile/resume` - Upload resume (Protected)
- `POST /api/profile/skills` - Add skill (Protected)
- `DELETE /api/profile/skills/:id` - Delete skill (Protected)
- `POST /api/profile/projects` - Add project (Protected)
- `PUT /api/profile/projects/:id` - Update project (Protected)
- `DELETE /api/profile/projects/:id` - Delete project (Protected)
- `POST /api/profile/achievements` - Add achievement (Protected)
- `DELETE /api/profile/achievements/:id` - Delete achievement (Protected)

### Placement Drives (Coming Soon)
- To be implemented

### Applications (Coming Soon)
- To be implemented

### Inbox (Coming Soon)
- To be implemented

### Events (Coming Soon)
- To be implemented

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MySQL connection configuration
│   └── database.sql         # Database schema
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── profileController.js # Profile management logic
├── middlewares/
│   ├── authMiddleware.js    # JWT verification
│   └── uploadMiddleware.js  # File upload handling
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── profileRoutes.js     # Profile endpoints
│   ├── driveRoutes.js       # Drive endpoints (placeholder)
│   ├── applicationRoutes.js # Application endpoints (placeholder)
│   ├── inboxRoutes.js       # Inbox endpoints (placeholder)
│   └── eventRoutes.js       # Event endpoints (placeholder)
├── uploads/                 # File uploads directory
│   ├── photos/              # Profile photos
│   ├── documents/           # Documents and certificates
│   └── resumes/             # Resume files
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── server.js               # Main server file
└── README.md               # This file
```

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "usn": "1MS21CS001",
    "email": "student@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phone": "9876543210",
    "branch": "Computer Science",
    "batchYear": 2021
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes with token verification
- File upload validation
- CORS configuration
- Input sanitization

## Database Schema

The system includes the following tables:
- `users` - User accounts
- `student_academics` - Academic information
- `semester_marks` - Semester-wise marks
- `skills` - Student skills
- `projects` - Student projects
- `internships` - Internship details
- `achievements` - Achievements and certifications
- `placement_drives` - Company placement drives
- `applications` - Student applications to drives
- `application_status_history` - Application status tracking
- `inbox_messages` - Communication system
- `events` - Placement events
- `password_reset_tokens` - Password reset tokens
- `activity_logs` - System activity logs

## Next Steps

1. Implement placement drives management
2. Implement application tracking system
3. Implement inbox/messaging system
4. Implement events management
5. Add email functionality for password reset
6. Add admin panel routes
7. Implement additional validation
8. Add comprehensive logging

## Support

For issues or questions, please contact the development team.
