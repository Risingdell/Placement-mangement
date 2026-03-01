-- =====================================================
-- PLACEMENT MANAGEMENT SYSTEM - DUMMY DATA
-- =====================================================
-- This SQL file creates test data for the student dashboard
--
-- ALL TEST USERS PASSWORD: password123
--
-- Login Credentials:
--   Student 1: student@test.com / password123 (USN: 1MS21CS001)
--   Student 2: priya.sharma@college.edu / password123 (USN: 1MS21CS002)
--   Student 3: amit.patel@college.edu / password123 (USN: 1MS21CS003)
--   TPO Admin: tpo@college.edu / password123 (USN: TPO001)
-- =====================================================

-- Clear existing data (in reverse order of dependencies)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM application_status_history;
DELETE FROM applications;
DELETE FROM inbox_messages;
DELETE FROM events;
DELETE FROM achievements;
DELETE FROM projects;
DELETE FROM skills;
DELETE FROM semester_marks;
DELETE FROM student_academics;
DELETE FROM placement_drives;
DELETE FROM users WHERE role = 'student';
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Password hash for "password123" using bcrypt
-- You may need to regenerate this hash based on your backend's bcrypt salt rounds

INSERT INTO users (id, usn, email, full_name, phone, password_hash, role, is_active, is_placed, created_at, updated_at) VALUES
(101, '1MS21CS001', 'student@test.com', 'Rajesh Kumar', '9876543210', '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi', 'student', 1, 0, NOW(), NOW()),
(102, '1MS21CS002', 'priya.sharma@college.edu', 'Priya Sharma', '9876543211', '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi', 'student', 1, 1, NOW(), NOW()),
(103, '1MS21CS003', 'amit.patel@college.edu', 'Amit Patel', '9876543212', '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi', 'student', 1, 0, NOW(), NOW()),
(201, 'TPO001', 'tpo@college.edu', 'Dr. Anjali Rao', '9999999999', '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi', 'tpo', 1, 0, NOW(), NOW());

-- =====================================================
-- 2. STUDENT ACADEMICS TABLE
-- =====================================================

INSERT INTO student_academics (
    user_id, cgpa, sgpa, current_semester, tenth_percentage, twelfth_percentage,
    branch, batch_year, total_backlogs, active_backlogs,
    photo_url, resume_url, created_at, updated_at
) VALUES
(101, 8.45, 8.60, 6, 92.50, 88.75, 'CSE', 2021, 0, 0,
 'https://ui-avatars.com/api/?name=Rajesh+Kumar&size=200',
 'https://example.com/resumes/rajesh_kumar.pdf',
 NOW(), NOW()),
(102, 9.12, 9.25, 6, 95.00, 91.20, 'CSE', 2021, 0, 0,
 'https://ui-avatars.com/api/?name=Priya+Sharma&size=200',
 'https://example.com/resumes/priya_sharma.pdf',
 NOW(), NOW()),
(103, 7.85, 7.90, 6, 88.00, 85.50, 'ISE', 2021, 1, 0,
 'https://ui-avatars.com/api/?name=Amit+Patel&size=200',
 'https://example.com/resumes/amit_patel.pdf',
 NOW(), NOW());

-- =====================================================
-- 3. SKILLS TABLE
-- =====================================================

INSERT INTO skills (user_id, skill_name, category, proficiency, created_at) VALUES
-- Rajesh Kumar (101) - Full Stack Developer Profile
(101, 'JavaScript', 'programming', 'advanced', NOW()),
(101, 'React.js', 'programming', 'advanced', NOW()),
(101, 'Node.js', 'programming', 'intermediate', NOW()),
(101, 'Python', 'programming', 'intermediate', NOW()),
(101, 'MySQL', 'database', 'intermediate', NOW()),
(101, 'MongoDB', 'database', 'beginner', NOW()),
(101, 'Git', 'tools', 'advanced', NOW()),
(101, 'Docker', 'tools', 'beginner', NOW()),
(101, 'REST API Design', 'other', 'intermediate', NOW()),
(101, 'Agile Methodology', 'other', 'intermediate', NOW()),

-- Priya Sharma (102) - Already Placed
(102, 'Java', 'programming', 'advanced', NOW()),
(102, 'Spring Boot', 'programming', 'advanced', NOW()),
(102, 'Microservices', 'programming', 'advanced', NOW()),
(102, 'PostgreSQL', 'database', 'advanced', NOW()),
(102, 'AWS', 'tools', 'intermediate', NOW()),

-- Amit Patel (103)
(103, 'C++', 'programming', 'advanced', NOW()),
(103, 'Python', 'programming', 'intermediate', NOW()),
(103, 'Machine Learning', 'programming', 'beginner', NOW());

-- =====================================================
-- 4. PROJECTS TABLE
-- =====================================================

INSERT INTO projects (
    user_id, title, description, tech_stack, start_date, end_date,
    github_url, project_url, is_ongoing, status, created_at, updated_at
) VALUES
-- Rajesh Kumar's Projects
(101, 'E-Commerce Platform',
 'A full-stack e-commerce web application with user authentication, product catalog, shopping cart, and payment integration using Stripe API.',
 'React.js, Node.js, Express, MongoDB, Redux, Stripe API',
 '2024-06-01', '2024-12-15',
 'https://github.com/rajeshkumar/ecommerce-platform',
 'https://ecommerce-demo.rajeshkumar.dev',
 0, 'Completed',
 '2024-06-01', NOW()),

(101, 'Task Management System',
 'A collaborative task management application with real-time updates, team collaboration features, and analytics dashboard.',
 'React.js, Firebase, Material-UI, WebSockets',
 '2025-01-10', NULL,
 'https://github.com/rajeshkumar/task-manager',
 NULL,
 1, 'Ongoing',
 '2025-01-10', NOW()),

(101, 'Weather Forecast App',
 'A responsive weather application that provides real-time weather data, 7-day forecasts, and location-based weather alerts.',
 'React.js, OpenWeather API, Chart.js, Tailwind CSS',
 '2024-03-15', '2024-05-20',
 'https://github.com/rajeshkumar/weather-app',
 'https://weather.rajeshkumar.dev',
 0, 'Completed',
 '2024-03-15', NOW()),

-- Priya Sharma's Projects
(102, 'Microservices Architecture Demo',
 'Enterprise-level microservices application demonstrating service discovery, API gateway, and distributed tracing.',
 'Spring Boot, Spring Cloud, Netflix Eureka, Docker, Kubernetes',
 '2024-08-01', '2024-11-30',
 'https://github.com/priyasharma/microservices-demo',
 NULL,
 0, 'Completed',
 '2024-08-01', NOW()),

-- Amit Patel's Projects
(103, 'ML-Based Sentiment Analysis',
 'Machine learning project for sentiment analysis of social media posts using NLP techniques.',
 'Python, TensorFlow, NLTK, Pandas, Flask',
 '2024-09-01', NULL,
 'https://github.com/amitpatel/sentiment-analysis',
 NULL,
 1, 'Ongoing',
 '2024-09-01', NOW());

-- =====================================================
-- 5. ACHIEVEMENTS TABLE
-- =====================================================

INSERT INTO achievements (
    user_id, title, description, type, issuer, date_achieved, certificate_url, created_at
) VALUES
-- Rajesh Kumar's Achievements
(101, 'AWS Certified Cloud Practitioner',
 'Successfully completed AWS Cloud Practitioner certification demonstrating foundational cloud computing knowledge.',
 'certification', 'Amazon Web Services', '2024-08-15',
 'https://aws.amazon.com/verification/AWSCP12345',
 NOW()),

(101, 'First Prize - State Level Hackathon',
 'Won first prize in Karnataka State Level Hackathon 2024 for developing an innovative healthcare solution.',
 'competition', 'Government of Karnataka', '2024-10-05',
 'https://example.com/certificates/hackathon_2024.pdf',
 NOW()),

(101, 'MongoDB Certified Developer',
 'MongoDB Certified Developer Associate certification focusing on database design and optimization.',
 'certification', 'MongoDB University', '2024-12-01',
 'https://university.mongodb.com/certification/MONGO12345',
 NOW()),

(101, 'Smart India Hackathon Finalist',
 'Selected as finalist in Smart India Hackathon 2024 among 10,000+ teams nationwide.',
 'competition', 'Ministry of Education, Govt. of India', '2024-09-20',
 'https://example.com/certificates/sih_2024.pdf',
 NOW()),

-- Priya Sharma's Achievements
(102, 'Google Cloud Professional',
 'Google Cloud Professional Cloud Architect certification.',
 'certification', 'Google Cloud', '2024-07-10',
 'https://cloud.google.com/certification/verify/GCP123',
 NOW()),

(102, 'Best Research Paper Award',
 'Best paper award at International Conference on Cloud Computing 2024.',
 'publication', 'IEEE', '2024-11-15',
 'https://ieeexplore.ieee.org/document/123456',
 NOW());

-- =====================================================
-- 6. PLACEMENT DRIVES TABLE
-- =====================================================

INSERT INTO placement_drives (
    id, company_name, company_type, role, job_description, ctc,
    min_cgpa, max_backlogs, allowed_branches, eligibility_criteria,
    drive_date, registration_deadline, status, created_by, created_at, updated_at
) VALUES
-- Drive 1: Google (Active - Upcoming)
(1, 'Google', 'tech_giant', 'Software Engineer',
 'Join Google as a Software Engineer and work on products used by billions of users worldwide. You will design, develop, test, deploy, maintain, and enhance software solutions.',
 1800000.00, 7.5, 0,
 '["CSE", "ISE", "ECE"]',
 '{"min_cgpa": 7.5, "max_backlogs": 0, "required_branches": ["CSE", "ISE", "ECE"], "min_tenth": 75, "min_twelfth": 75}',
 '2026-02-15 10:00:00', '2026-02-05 23:59:59', 'active', 201, NOW(), NOW()),

-- Drive 2: Microsoft (Active - Upcoming)
(2, 'Microsoft', 'tech_giant', 'Software Development Engineer',
 'As an SDE at Microsoft, you will be part of a team that builds cutting-edge solutions empowering every person and organization on the planet to achieve more.',
 2200000.00, 8.0, 0,
 '["CSE", "ISE"]',
 '{"min_cgpa": 8.0, "max_backlogs": 0, "required_branches": ["CSE", "ISE"], "min_tenth": 80, "min_twelfth": 80}',
 '2026-02-20 09:00:00', '2026-02-08 23:59:59', 'active', 201, NOW(), NOW()),

-- Drive 3: Amazon (Active - Deadline Soon)
(3, 'Amazon', 'tech_giant', 'SDE - 1',
 'Amazon is looking for talented Software Development Engineers to join our innovative team. Work on highly scalable distributed systems.',
 1600000.00, 7.0, 1,
 '["CSE", "ISE", "ECE", "EEE"]',
 '{"min_cgpa": 7.0, "max_backlogs": 1, "required_branches": ["CSE", "ISE", "ECE", "EEE"], "min_tenth": 70, "min_twelfth": 70}',
 '2026-02-10 10:00:00', '2026-02-02 23:59:59', 'active', 201, NOW(), NOW()),

-- Drive 4: Infosys (Active)
(4, 'Infosys', 'service_based', 'Systems Engineer',
 'Infosys is hiring Systems Engineers for various projects across domains. Great opportunity to start your career with a global IT leader.',
 450000.00, 6.5, 2,
 '["CSE", "ISE", "ECE", "EEE", "ME", "CV"]',
 '{"min_cgpa": 6.5, "max_backlogs": 2, "required_branches": ["CSE", "ISE", "ECE", "EEE", "ME", "CV"], "min_tenth": 60, "min_twelfth": 60}',
 '2026-02-12 14:00:00', '2026-02-06 23:59:59', 'active', 201, NOW(), NOW()),

-- Drive 5: TCS (Active)
(5, 'Tata Consultancy Services', 'service_based', 'Assistant Systems Engineer',
 'TCS Digital hiring for fresh graduates. Join India\'s largest IT services company and work with Fortune 500 clients.',
 380000.00, 6.0, 2,
 '["CSE", "ISE", "ECE", "EEE", "ME", "CV", "CHE"]',
 '{"min_cgpa": 6.0, "max_backlogs": 2, "required_branches": ["CSE", "ISE", "ECE", "EEE", "ME", "CV", "CHE"], "min_tenth": 60, "min_twelfth": 60}',
 '2026-02-18 10:00:00', '2026-02-10 23:59:59', 'active', 201, NOW(), NOW()),

-- Drive 6: Adobe (Upcoming)
(6, 'Adobe', 'tech_giant', 'Software Engineer',
 'Adobe is looking for creative problem solvers to join our engineering team. Work on products that empower creativity worldwide.',
 2000000.00, 8.5, 0,
 '["CSE", "ISE"]',
 '{"min_cgpa": 8.5, "max_backlogs": 0, "required_branches": ["CSE", "ISE"], "min_tenth": 85, "min_twelfth": 85}',
 '2026-02-25 10:00:00', '2026-02-15 23:59:59', 'upcoming', 201, NOW(), NOW()),

-- Drive 7: Wipro (Active)
(7, 'Wipro', 'service_based', 'Project Engineer',
 'Wipro is hiring Project Engineers for client-facing roles in digital transformation projects.',
 400000.00, 6.5, 2,
 '["CSE", "ISE", "ECE", "EEE", "ME"]',
 '{"min_cgpa": 6.5, "max_backlogs": 2, "required_branches": ["CSE", "ISE", "ECE", "EEE", "ME"], "min_tenth": 60, "min_twelfth": 60}',
 '2026-02-08 14:00:00', '2026-02-03 23:59:59', 'active', 201, NOW(), NOW()),

-- Drive 8: Cisco (Completed - for history)
(8, 'Cisco Systems', 'product_based', 'Software Engineer',
 'Cisco completed campus drive for network software engineering roles.',
 1200000.00, 7.5, 0,
 '["CSE", "ISE", "ECE"]',
 '{"min_cgpa": 7.5, "max_backlogs": 0, "required_branches": ["CSE", "ISE", "ECE"], "min_tenth": 75, "min_twelfth": 75}',
 '2026-01-15 10:00:00', '2026-01-05 23:59:59', 'completed', 201, '2025-12-20', NOW());

-- =====================================================
-- 7. APPLICATIONS TABLE
-- =====================================================

INSERT INTO applications (user_id, drive_id, status, applied_at, updated_at) VALUES
-- Rajesh Kumar's Applications
(101, 3, 'Applied', '2026-01-28 14:30:00', '2026-01-28 14:30:00'),      -- Amazon (Active)
(101, 4, 'Shortlisted', '2026-01-25 10:15:00', '2026-01-29 16:45:00'),  -- Infosys (Shortlisted)
(101, 5, 'Applied', '2026-01-26 11:00:00', '2026-01-26 11:00:00'),      -- TCS (Applied)
(101, 7, 'Selected', '2026-01-20 09:30:00', '2026-01-30 12:00:00'),     -- Wipro (Selected!)
(101, 8, 'Rejected', '2026-01-10 15:20:00', '2026-01-20 10:00:00'),     -- Cisco (Rejected)

-- Priya Sharma's Applications (Already Placed)
(102, 2, 'Selected', '2026-01-18 10:00:00', '2026-01-25 14:30:00'),     -- Microsoft (Selected - Placed)
(102, 8, 'Shortlisted', '2026-01-10 11:30:00', '2026-01-15 16:00:00'),  -- Cisco (Shortlisted before selection)

-- Amit Patel's Applications
(103, 3, 'Applied', '2026-01-27 16:45:00', '2026-01-27 16:45:00'),      -- Amazon
(103, 4, 'Applied', '2026-01-28 09:20:00', '2026-01-28 09:20:00'),      -- Infosys
(103, 5, 'Shortlisted', '2026-01-24 13:15:00', '2026-01-29 11:30:00');  -- TCS (Shortlisted)

-- =====================================================
-- 8. APPLICATION STATUS HISTORY TABLE
-- =====================================================

INSERT INTO application_status_history (application_id, status, changed_at, remarks) VALUES
-- Rajesh's Amazon Application (ID 1)
(1, 'Applied', '2026-01-28 14:30:00', 'Application submitted successfully'),

-- Rajesh's Infosys Application (ID 2) - Progressive updates
(2, 'Applied', '2026-01-25 10:15:00', 'Application submitted successfully'),
(2, 'Shortlisted', '2026-01-29 16:45:00', 'Shortlisted for technical interview. Interview scheduled on Feb 5, 2026 at 2:00 PM'),

-- Rajesh's TCS Application (ID 3)
(3, 'Applied', '2026-01-26 11:00:00', 'Application submitted successfully'),

-- Rajesh's Wipro Application (ID 4) - Full Journey
(4, 'Applied', '2026-01-20 09:30:00', 'Application submitted successfully'),
(4, 'Shortlisted', '2026-01-22 14:00:00', 'Shortlisted for online assessment'),
(4, 'Shortlisted', '2026-01-24 16:30:00', 'Cleared online assessment. Technical interview scheduled'),
(4, 'Selected', '2026-01-30 12:00:00', 'Congratulations! You have been selected for Project Engineer role at Wipro with CTC of 4 LPA'),

-- Rajesh's Cisco Application (ID 5) - Rejected
(5, 'Applied', '2026-01-10 15:20:00', 'Application submitted successfully'),
(5, 'Rejected', '2026-01-20 10:00:00', 'Thank you for your interest. We are proceeding with other candidates'),

-- Priya's Microsoft Application (ID 6) - Selected
(6, 'Applied', '2026-01-18 10:00:00', 'Application submitted successfully'),
(6, 'Shortlisted', '2026-01-20 15:30:00', 'Shortlisted for coding round'),
(6, 'Shortlisted', '2026-01-22 11:00:00', 'Cleared coding round. Technical interviews scheduled'),
(6, 'Selected', '2026-01-25 14:30:00', 'Congratulations! Selected for SDE role at Microsoft with CTC of 22 LPA'),

-- Priya's Cisco Application (ID 7)
(7, 'Applied', '2026-01-10 11:30:00', 'Application submitted successfully'),
(7, 'Shortlisted', '2026-01-15 16:00:00', 'Shortlisted for technical round'),

-- Amit's Amazon Application (ID 8)
(8, 'Applied', '2026-01-27 16:45:00', 'Application submitted successfully'),

-- Amit's Infosys Application (ID 9)
(9, 'Applied', '2026-01-28 09:20:00', 'Application submitted successfully'),

-- Amit's TCS Application (ID 10) - Shortlisted
(10, 'Applied', '2026-01-24 13:15:00', 'Application submitted successfully'),
(10, 'Shortlisted', '2026-01-29 11:30:00', 'Shortlisted for online assessment. Link sent to email');

-- =====================================================
-- 9. EVENTS TABLE
-- =====================================================

INSERT INTO events (
    title, description, event_type, event_date, location,
    related_drive_id, created_by, created_at, updated_at
) VALUES
-- Upcoming Events
('Pre-Placement Talk - Google',
 'Google recruitment team will present about company culture, roles, and career opportunities. All eligible students are encouraged to attend.',
 'Drive', '2026-02-10 14:00:00', 'Seminar Hall A',
 1, 201, NOW(), NOW()),

('Microsoft Coding Workshop',
 'Hands-on workshop on Data Structures and Algorithms conducted by Microsoft engineers. Topics: Trees, Graphs, Dynamic Programming.',
 'Workshop', '2026-02-12 10:00:00', 'Computer Lab 1',
 2, 201, NOW(), NOW()),

('Amazon Online Assessment',
 'Online coding assessment for shortlisted candidates. Duration: 90 minutes. 2 coding questions.',
 'Drive', '2026-02-03 15:00:00', 'Online (HackerRank)',
 3, 201, NOW(), NOW()),

('Resume Building Seminar',
 'Expert session on creating impactful resumes for tech roles. Tips on highlighting projects and skills effectively.',
 'Seminar', '2026-02-05 16:00:00', 'Auditorium',
 NULL, 201, NOW(), NOW()),

('Mock Interview Series - Week 1',
 'Mock technical interviews conducted by industry professionals. Register via placement portal.',
 'Workshop', '2026-02-07 09:00:00', 'Interview Rooms 1-5',
 NULL, 201, NOW(), NOW()),

('Adobe Pre-Placement Talk',
 'Learn about Adobe products, engineering culture, and interview process. Q&A session included.',
 'Drive', '2026-02-18 11:00:00', 'Seminar Hall B',
 6, 201, NOW(), NOW()),

('Communication Skills Workshop',
 'Improve your communication skills for technical and HR interviews. Includes group discussions.',
 'Workshop', '2026-02-14 14:30:00', 'Conference Room',
 NULL, 201, NOW(), NOW()),

('Industry Expert Talk - AI/ML Career Paths',
 'Guest lecture by AI researcher from IIT. Discussion on career opportunities in AI/ML domain.',
 'Seminar', '2026-02-20 15:00:00', 'Auditorium',
 NULL, 201, NOW(), NOW());

-- =====================================================
-- 10. INBOX MESSAGES TABLE
-- =====================================================

INSERT INTO inbox_messages (
    recipient_id, sender_id, subject, message, message_type,
    related_drive_id, action_url, is_read, read_at, sent_at
) VALUES
-- Messages for Rajesh Kumar (101)

-- Recent Unread Messages
(101, 201, 'Wipro Selection Offer Letter',
 'Dear Rajesh Kumar,\n\nCongratulations! We are pleased to inform you that you have been selected for the position of Project Engineer at Wipro Limited.\n\nYour CTC: INR 4,00,000 per annum\nJoining Date: July 2026\n\nPlease download your offer letter from the link below and submit the signed copy within 7 days.\n\nBest regards,\nPlacement Cell',
 'offer', 7, '/applications', 0, NULL, '2026-01-30 14:30:00'),

(101, 201, 'Infosys Technical Interview Scheduled',
 'Dear Rajesh,\n\nYou have been shortlisted for the technical interview round for Systems Engineer position at Infosys.\n\nInterview Details:\nDate: February 5, 2026\nTime: 2:00 PM - 3:00 PM\nMode: Online (MS Teams)\nRound: Technical Interview (DSA + System Design)\n\nPlease be prepared with your projects and ensure stable internet connection.\n\nAll the best!',
 'interview', 4, '/applications', 0, NULL, '2026-01-29 17:00:00'),

(101, 201, 'Reminder: Amazon Online Assessment - Tomorrow',
 'Hi Rajesh,\n\nThis is a reminder that your Amazon online assessment is scheduled for tomorrow.\n\nDate: February 3, 2026\nTime: 3:00 PM - 4:30 PM\nPlatform: HackerRank\n\nAssessment link has been sent to your registered email. Please check spam folder if not received.\n\nImportant: Join 10 minutes before the scheduled time.\n\nGood luck!',
 'reminder', 3, '/applications', 0, NULL, '2026-02-02 10:00:00'),

-- Read Messages
(101, 201, 'Google Drive - Registration Confirmed',
 'Dear Student,\n\nYour registration for Google Software Engineer drive has been confirmed.\n\nDrive Date: February 15, 2026\nPre-placement Talk: February 10, 2026 at 2:00 PM (Seminar Hall A)\n\nPlease ensure:\n1. Your resume is updated\n2. Profile is 100% complete\n3. All documents are uploaded\n\nStay tuned for further updates.',
 'general', 1, '/drives/1', 1, '2026-01-28 11:20:00', '2026-01-28 10:30:00'),

(101, 201, 'TCS Application Submitted Successfully',
 'Hi Rajesh Kumar,\n\nYour application for Assistant Systems Engineer role at Tata Consultancy Services has been submitted successfully.\n\nApplication ID: APP2026TCS00101\nApplied on: January 26, 2026\n\nYou will be notified about shortlisting status within 7 working days.\n\nTrack your application status in the Applications section.',
 'application', 5, '/applications', 1, '2026-01-26 11:15:00', '2026-01-26 11:05:00'),

(101, 201, 'Upcoming Event: Resume Building Seminar',
 'Dear Students,\n\nWe are organizing a Resume Building Seminar on February 5, 2026 at 4:00 PM in the Auditorium.\n\nTopics Covered:\n- ATS-friendly resume format\n- Highlighting projects and skills\n- Action verbs and quantifiable achievements\n- Common mistakes to avoid\n\nExpert Speaker: Mr. Suresh Kumar (Ex-Google Recruiter)\n\nAttendance is mandatory for all final year students.\n\nRegards,\nPlacement Cell',
 'general', NULL, '/events', 1, '2026-01-27 14:00:00', '2026-01-27 09:00:00'),

(101, 201, 'Cisco Drive - Application Status Update',
 'Dear Rajesh,\n\nThank you for your interest in the Software Engineer position at Cisco Systems.\n\nAfter careful review of all applications, we regret to inform you that we are proceeding with other candidates whose profiles more closely match our current requirements.\n\nWe appreciate the time and effort you invested in the application process and encourage you to apply for future opportunities.\n\nWish you all the best in your career!\n\nRegards,\nCisco Recruitment Team',
 'application', 8, '/applications', 1, '2026-01-20 15:30:00', '2026-01-20 10:15:00'),

(101, 201, 'Important: Complete Your Profile',
 'Dear Student,\n\nWe noticed that your profile is incomplete. Please update the following:\n\n1. Upload your latest resume (PDF format)\n2. Add at least 3 technical skills\n3. Fill academic details (10th, 12th marks)\n\nComplete profile increases your visibility to recruiters by 80%.\n\nUpdate your profile now!',
 'reminder', NULL, '/profile', 1, '2026-01-15 10:00:00', '2026-01-15 09:00:00'),

-- Additional Messages for Dashboard Preview
(101, 201, 'Mock Interview Series - Register Now',
 'Hi Students,\n\nMock Interview Series starting from February 7, 2026.\n\nWeek 1: Technical Interviews (DSA, System Design)\nWeek 2: HR Interviews\n\nLimited slots available. First come, first served.\n\nRegister via placement portal by February 5.\n\nThis is a great opportunity to prepare for actual interviews!',
 'general', NULL, '/events', 1, '2026-01-25 16:00:00', '2026-01-25 12:00:00'),

-- Messages for other students (for TPO dashboard testing)
(102, 201, 'Microsoft Selection - Congratulations!',
 'Dear Priya Sharma,\n\nWe are delighted to inform you that you have been selected for Software Development Engineer position at Microsoft India.\n\nCTC: INR 22,00,000 per annum\nLocation: Bangalore/Hyderabad\nJoining: August 2026\n\nHR will contact you within 48 hours for offer letter formalities.\n\nHeartiest congratulations!',
 'offer', 2, '/applications', 1, '2026-01-25 15:00:00', '2026-01-25 14:45:00'),

(103, 201, 'TCS Online Assessment Scheduled',
 'Dear Amit Patel,\n\nYou have been shortlisted for TCS online assessment.\n\nDate: February 2, 2026\nTime: 10:00 AM - 12:00 PM\nSections: Aptitude, Technical MCQ, Coding (2 questions)\n\nLink will be sent to your email 1 hour before the test.\n\nPrepare well!',
 'interview', 5, '/applications', 0, NULL, '2026-01-29 12:00:00');

-- =====================================================
-- SUMMARY OF TEST DATA
-- =====================================================
-- Users Created: 4 (3 students + 1 TPO)
--   - Rajesh Kumar (101): CGPA 8.45, Active, Not Placed
--   - Priya Sharma (102): CGPA 9.12, Active, Placed at Microsoft
--   - Amit Patel (103): CGPA 7.85, Active, Not Placed
--   - TPO User (201): Admin access
--
-- Placement Drives: 8
--   - Active: 6 (Google, Microsoft, Amazon, Infosys, TCS, Wipro)
--   - Upcoming: 1 (Adobe)
--   - Completed: 1 (Cisco)
--
-- Applications (Rajesh): 5
--   - Selected: 1 (Wipro)
--   - Shortlisted: 1 (Infosys)
--   - Applied: 2 (Amazon, TCS)
--   - Rejected: 1 (Cisco)
--
-- Skills (Rajesh): 10 skills across 4 categories
-- Projects (Rajesh): 3 (2 Completed, 1 Ongoing)
-- Achievements (Rajesh): 4 (2 Certifications, 2 Competition Awards)
-- Events: 8 upcoming events
-- Inbox Messages (Rajesh): 10 messages (3 unread, 7 read)
-- =====================================================

-- NOTE: Password hash has been generated using bcryptjs with 10 salt rounds
-- Hash: $2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi
-- Plaintext Password: password123
--
-- To regenerate or create new password hashes, use:
-- node backend/scripts/generatePasswordHash.js
--
-- Or use this quick command:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(h => console.log(h));"
-- =====================================================
