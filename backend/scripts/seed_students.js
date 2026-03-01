/**
 * Seed script — adds 25 diverse student records
 * Run: node backend/scripts/seed_students.js
 *
 * Password for all seed students: password123
 */

const { promisePool } = require('../config/database');

// bcrypt hash of "password123"
const PASS_HASH = '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi';

const students = [
  // CSE — batch 2024
  { full_name: 'Arjun Sharma',     email: 'arjun.sharma@student.edu',   usn: '1MS21CS010', branch: 'CSE',   batch_year: 2024, cgpa: 9.2, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Priya Nair',       email: 'priya.nair@student.edu',     usn: '1MS21CS022', branch: 'CSE',   batch_year: 2024, cgpa: 8.7, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Rohit Verma',      email: 'rohit.verma@student.edu',    usn: '1MS21CS045', branch: 'CSE',   batch_year: 2024, cgpa: 7.4, active_backlogs: 1, total_backlogs: 2, is_placed: 0 },
  { full_name: 'Sneha Patil',      email: 'sneha.patil@student.edu',    usn: '1MS21CS061', branch: 'CSE',   batch_year: 2024, cgpa: 9.6, active_backlogs: 0, total_backlogs: 0, is_placed: 1 },

  // ISE — batch 2024
  { full_name: 'Aditya Kumar',     email: 'aditya.kumar@student.edu',   usn: '1MS21IS008', branch: 'ISE',   batch_year: 2024, cgpa: 8.1, active_backlogs: 0, total_backlogs: 1, is_placed: 0 },
  { full_name: 'Kavitha Reddy',    email: 'kavitha.reddy@student.edu',  usn: '1MS21IS019', branch: 'ISE',   batch_year: 2024, cgpa: 9.0, active_backlogs: 0, total_backlogs: 0, is_placed: 1 },
  { full_name: 'Nikhil Joshi',     email: 'nikhil.joshi@student.edu',   usn: '1MS21IS033', branch: 'ISE',   batch_year: 2024, cgpa: 6.8, active_backlogs: 2, total_backlogs: 3, is_placed: 0 },

  // ECE — batch 2023
  { full_name: 'Pooja Menon',      email: 'pooja.menon@student.edu',    usn: '1MS22EC014', branch: 'ECE',   batch_year: 2023, cgpa: 8.5, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Rahul Singh',      email: 'rahul.singh@student.edu',    usn: '1MS22EC027', branch: 'ECE',   batch_year: 2023, cgpa: 7.9, active_backlogs: 0, total_backlogs: 1, is_placed: 0 },
  { full_name: 'Ananya Iyer',      email: 'ananya.iyer@student.edu',    usn: '1MS22EC041', branch: 'ECE',   batch_year: 2023, cgpa: 9.3, active_backlogs: 0, total_backlogs: 0, is_placed: 1 },

  // MECH — batch 2023
  { full_name: 'Vikram Rao',       email: 'vikram.rao@student.edu',     usn: '1MS22ME005', branch: 'MECH',  batch_year: 2023, cgpa: 7.2, active_backlogs: 1, total_backlogs: 2, is_placed: 0 },
  { full_name: 'Divya Krishnan',   email: 'divya.krishnan@student.edu', usn: '1MS22ME018', branch: 'MECH',  batch_year: 2023, cgpa: 8.0, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },

  // CIVIL — batch 2022
  { full_name: 'Siddharth Bhat',   email: 'siddharth.bhat@student.edu', usn: '1MS23CV007', branch: 'CIVIL', batch_year: 2022, cgpa: 6.5, active_backlogs: 3, total_backlogs: 4, is_placed: 0 },
  { full_name: 'Meera Subramaniam',email: 'meera.sub@student.edu',      usn: '1MS23CV021', branch: 'CIVIL', batch_year: 2022, cgpa: 7.6, active_backlogs: 0, total_backlogs: 1, is_placed: 0 },

  // EEE — batch 2022
  { full_name: 'Karthik Pillai',   email: 'karthik.pillai@student.edu', usn: '1MS23EE012', branch: 'EEE',   batch_year: 2022, cgpa: 8.4, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Lakshmi Devi',     email: 'lakshmi.devi@student.edu',   usn: '1MS23EE029', branch: 'EEE',   batch_year: 2022, cgpa: 9.1, active_backlogs: 0, total_backlogs: 0, is_placed: 1 },

  // AI&ML — batch 2024
  { full_name: 'Yash Gupta',       email: 'yash.gupta@student.edu',     usn: '1MS21AM003', branch: 'AI&ML', batch_year: 2024, cgpa: 9.5, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Tanvi Shah',       email: 'tanvi.shah@student.edu',     usn: '1MS21AM016', branch: 'AI&ML', batch_year: 2024, cgpa: 8.8, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Manish Tiwari',    email: 'manish.tiwari@student.edu',  usn: '1MS21AM031', branch: 'AI&ML', batch_year: 2024, cgpa: 7.3, active_backlogs: 1, total_backlogs: 1, is_placed: 0 },

  // AIDS — batch 2024
  { full_name: 'Riya Choudhary',   email: 'riya.choudhary@student.edu', usn: '1MS21AD009', branch: 'AIDS',  batch_year: 2024, cgpa: 9.0, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
  { full_name: 'Akash Banerjee',   email: 'akash.banerjee@student.edu', usn: '1MS21AD024', branch: 'AIDS',  batch_year: 2024, cgpa: 8.2, active_backlogs: 0, total_backlogs: 1, is_placed: 0 },

  // DS — batch 2023
  { full_name: 'Neha Agarwal',     email: 'neha.agarwal@student.edu',   usn: '1MS22DS011', branch: 'DS',    batch_year: 2023, cgpa: 9.4, active_backlogs: 0, total_backlogs: 0, is_placed: 1 },
  { full_name: 'Suresh Babu',      email: 'suresh.babu@student.edu',    usn: '1MS22DS025', branch: 'DS',    batch_year: 2023, cgpa: 7.8, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },

  // CSE — batch 2022 (older batch, unplaced)
  { full_name: 'Harish Nanda',     email: 'harish.nanda@student.edu',   usn: '1MS23CS038', branch: 'CSE',   batch_year: 2022, cgpa: 6.9, active_backlogs: 2, total_backlogs: 3, is_placed: 0 },
  { full_name: 'Simran Kaur',      email: 'simran.kaur@student.edu',    usn: '1MS23CS052', branch: 'CSE',   batch_year: 2022, cgpa: 8.6, active_backlogs: 0, total_backlogs: 0, is_placed: 0 },
];

async function seed() {
  console.log(`Seeding ${students.length} students…\n`);
  let inserted = 0;
  let skipped  = 0;

  for (const s of students) {
    // Check if USN or email already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM users WHERE email = ? OR usn = ?',
      [s.email, s.usn]
    );

    if (existing.length > 0) {
      console.log(`  SKIP  ${s.usn}  (${s.full_name}) — already exists`);
      skipped++;
      continue;
    }

    // Insert user
    const [userResult] = await promisePool.query(
      `INSERT INTO users
         (full_name, email, usn, password_hash, role, is_active, is_placed, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'student', 1, ?, NOW(), NOW())`,
      [s.full_name, s.email, s.usn, PASS_HASH, s.is_placed]
    );
    const userId = userResult.insertId;

    // Insert academics
    await promisePool.query(
      `INSERT INTO student_academics
         (user_id, branch, batch_year, cgpa, active_backlogs, total_backlogs, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, s.branch, s.batch_year, s.cgpa, s.active_backlogs, s.total_backlogs]
    );

    console.log(`  OK    ${s.usn}  ${s.full_name.padEnd(22)} ${s.branch.padEnd(6)} ${s.batch_year}  CGPA ${s.cgpa}  backlogs:${s.active_backlogs}  placed:${s.is_placed}`);
    inserted++;
  }

  console.log(`\nDone — inserted ${inserted}, skipped ${skipped}.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
