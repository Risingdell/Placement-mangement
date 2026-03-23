-- Add application_link column to placement_drives table
ALTER TABLE placement_drives
ADD COLUMN application_link VARCHAR(500) AFTER registration_deadline;
