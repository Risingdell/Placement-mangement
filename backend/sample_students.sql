-- Sample Students Data for Placement Management System
-- This script creates 20 sample students with varying academic profiles

-- Insert students into users table
INSERT INTO users (usn, email, password_hash, full_name, phone, role, is_active, is_placed) VALUES
('1CR21CS001', 'arjun.sharma@college.edu', '$2a$10$YourHashedPasswordHere', 'Arjun Sharma', '9876543210', 'student', 1, 0),
('1CR21CS002', 'priya.patel@college.edu', '$2a$10$YourHashedPasswordHere', 'Priya Patel', '9876543211', 'student', 1, 0),
('1CR21CS003', 'rahul.kumar@college.edu', '$2a$10$YourHashedPasswordHere', 'Rahul Kumar', '9876543212', 'student', 1, 0),
('1CR21ISE004', 'sneha.reddy@college.edu', '$2a$10$YourHashedPasswordHere', 'Sneha Reddy', '9876543213', 'student', 1, 0),
('1CR21ISE005', 'amit.verma@college.edu', '$2a$10$YourHashedPasswordHere', 'Amit Verma', '9876543214', 'student', 1, 0),
('1CR21ECE006', 'neha.singh@college.edu', '$2a$10$YourHashedPasswordHere', 'Neha Singh', '9876543215', 'student', 1, 0),
('1CR21ECE007', 'vikram.joshi@college.edu', '$2a$10$YourHashedPasswordHere', 'Vikram Joshi', '9876543216', 'student', 1, 0),
('1CR21MECH008', 'ananya.gupta@college.edu', '$2a$10$YourHashedPasswordHere', 'Ananya Gupta', '9876543217', 'student', 1, 0),
('1CR21CS009', 'karthik.rao@college.edu', '$2a$10$YourHashedPasswordHere', 'Karthik Rao', '9876543218', 'student', 1, 0),
('1CR21CS010', 'divya.nair@college.edu', '$2a$10$YourHashedPasswordHere', 'Divya Nair', '9876543219', 'student', 1, 0),
('1CR21ISE011', 'rohan.mehta@college.edu', '$2a$10$YourHashedPasswordHere', 'Rohan Mehta', '9876543220', 'student', 1, 0),
('1CR21CS012', 'pooja.iyer@college.edu', '$2a$10$YourHashedPasswordHere', 'Pooja Iyer', '9876543221', 'student', 1, 0),
('1CR21ECE013', 'sanjay.pillai@college.edu', '$2a$10$YourHashedPasswordHere', 'Sanjay Pillai', '9876543222', 'student', 1, 0),
('1CR21CS014', 'kavya.desai@college.edu', '$2a$10$YourHashedPasswordHere', 'Kavya Desai', '9876543223', 'student', 1, 0),
('1CR21ISE015', 'aditya.bhat@college.edu', '$2a$10$YourHashedPasswordHere', 'Aditya Bhat', '9876543224', 'student', 1, 0),
('1CR21CS016', 'shreya.menon@college.edu', '$2a$10$YourHashedPasswordHere', 'Shreya Menon', '9876543225', 'student', 1, 0),
('1CR21CIVIL017', 'manish.shetty@college.edu', '$2a$10$YourHashedPasswordHere', 'Manish Shetty', '9876543226', 'student', 1, 0),
('1CR21CS018', 'ritu.agarwal@college.edu', '$2a$10$YourHashedPasswordHere', 'Ritu Agarwal', '9876543227', 'student', 1, 0),
('1CR21EEE019', 'deepak.krishnan@college.edu', '$2a$10$YourHashedPasswordHere', 'Deepak Krishnan', '9876543228', 'student', 1, 0),
('1CR21CS020', 'tanvi.shah@college.edu', '$2a$10$YourHashedPasswordHere', 'Tanvi Shah', '9876543229', 'student', 1, 0);

-- Insert academic information for students
-- Note: Replace LAST_INSERT_ID() approach with actual user IDs after insertion
-- For this script to work, we'll use the USN to find user_id

INSERT INTO student_academics (user_id, branch, batch_year, current_semester, cgpa, sgpa, tenth_percentage, twelfth_percentage, total_backlogs, active_backlogs)
SELECT id, 'CSE', 2025, 6, 8.5, 8.6, 92.5, 88.0, 0, 0 FROM users WHERE usn = '1CR21CS001'
UNION ALL
SELECT id, 'CSE', 2025, 6, 9.2, 9.3, 95.0, 92.0, 0, 0 FROM users WHERE usn = '1CR21CS002'
UNION ALL
SELECT id, 'CSE', 2025, 6, 7.8, 7.9, 85.0, 82.0, 1, 0 FROM users WHERE usn = '1CR21CS003'
UNION ALL
SELECT id, 'ISE', 2025, 6, 8.9, 9.0, 90.0, 87.5, 0, 0 FROM users WHERE usn = '1CR21ISE004'
UNION ALL
SELECT id, 'ISE', 2025, 6, 7.5, 7.6, 82.0, 79.0, 2, 1 FROM users WHERE usn = '1CR21ISE005'
UNION ALL
SELECT id, 'ECE', 2025, 6, 8.2, 8.3, 88.0, 85.0, 0, 0 FROM users WHERE usn = '1CR21ECE006'
UNION ALL
SELECT id, 'ECE', 2025, 6, 7.9, 8.0, 86.5, 83.0, 1, 0 FROM users WHERE usn = '1CR21ECE007'
UNION ALL
SELECT id, 'MECH', 2024, 8, 7.2, 7.3, 80.0, 75.0, 3, 2 FROM users WHERE usn = '1CR21MECH008'
UNION ALL
SELECT id, 'CSE', 2025, 6, 9.0, 9.1, 93.0, 90.0, 0, 0 FROM users WHERE usn = '1CR21CS009'
UNION ALL
SELECT id, 'CSE', 2025, 6, 8.7, 8.8, 91.0, 89.0, 0, 0 FROM users WHERE usn = '1CR21CS010'
UNION ALL
SELECT id, 'ISE', 2026, 4, 8.4, 8.5, 89.0, 86.0, 0, 0 FROM users WHERE usn = '1CR21ISE011'
UNION ALL
SELECT id, 'CSE', 2025, 6, 7.6, 7.7, 84.0, 81.0, 1, 1 FROM users WHERE usn = '1CR21CS012'
UNION ALL
SELECT id, 'ECE', 2026, 4, 8.0, 8.1, 87.0, 84.0, 0, 0 FROM users WHERE usn = '1CR21ECE013'
UNION ALL
SELECT id, 'CSE', 2025, 6, 9.5, 9.6, 96.0, 94.0, 0, 0 FROM users WHERE usn = '1CR21CS014'
UNION ALL
SELECT id, 'ISE', 2026, 4, 8.1, 8.2, 88.5, 85.5, 0, 0 FROM users WHERE usn = '1CR21ISE015'
UNION ALL
SELECT id, 'CSE', 2027, 2, 8.8, 8.9, 92.0, 90.5, 0, 0 FROM users WHERE usn = '1CR21CS016'
UNION ALL
SELECT id, 'CIVIL', 2024, 8, 7.0, 7.1, 78.0, 74.0, 4, 2 FROM users WHERE usn = '1CR21CIVIL017'
UNION ALL
SELECT id, 'CSE', 2025, 6, 8.3, 8.4, 89.5, 87.0, 0, 0 FROM users WHERE usn = '1CR21CS018'
UNION ALL
SELECT id, 'EEE', 2026, 4, 7.7, 7.8, 85.5, 82.5, 1, 0 FROM users WHERE usn = '1CR21EEE019'
UNION ALL
SELECT id, 'CSE', 2025, 6, 9.3, 9.4, 94.5, 92.5, 0, 0 FROM users WHERE usn = '1CR21CS020';

-- Verify the data
SELECT 
    u.usn, 
    u.full_name, 
    u.email,
    sa.branch, 
    sa.batch_year,
    sa.cgpa, 
    sa.active_backlogs,
    u.is_placed
FROM users u
JOIN student_academics sa ON u.id = sa.user_id
WHERE u.role = 'student'
ORDER BY sa.cgpa DESC;
