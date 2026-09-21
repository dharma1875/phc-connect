CREATE DATABASE IF NOT EXISTS phc_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phc_connect;

-- DEVELOPMENT DATA ONLY
-- This seed file is for local development and demonstration only.
-- It does not claim to represent the complete official facility list for Tamil Nadu.

INSERT INTO roles (name) VALUES
('DDHS'),
('DOCTOR');

INSERT INTO users (username, password_hash, role_id, is_active) VALUES
('ddhs.admin', '$2b$10$Z8IBoDtv1BikMgCHa4IcgOTaDZsnBCvRopiwPapbSMoJPffRKyfEW', 1, TRUE),
('dr.raman', '$2b$10$Z8IBoDtv1BikMgCHa4IcgOTaDZsnBCvRopiwPapbSMoJPffRKyfEW', 2, TRUE),
('dr.saravanan', '$2b$10$Z8IBoDtv1BikMgCHa4IcgOTaDZsnBCvRopiwPapbSMoJPffRKyfEW', 2, TRUE),
('dr.nisha', '$2b$10$Z8IBoDtv1BikMgCHa4IcgOTaDZsnBCvRopiwPapbSMoJPffRKyfEW', 2, TRUE),
('dr.karthik', '$2b$10$Z8IBoDtv1BikMgCHa4IcgOTaDZsnBCvRopiwPapbSMoJPffRKyfEW', 2, TRUE);

INSERT INTO districts (name, state_name, status) VALUES
('Ranipet', 'Tamil Nadu', 'ACTIVE');

INSERT INTO taluks (district_id, name, status) VALUES
(1, 'Arcot', 'ACTIVE'),
(1, 'Walajah', 'ACTIVE'),
(1, 'Kalavai', 'ACTIVE'),
(1, 'Sholinghur', 'ACTIVE'),
(1, 'Arakkonam', 'ACTIVE'),
(1, 'Nemili', 'ACTIVE');

INSERT INTO facilities (name, facility_type, district_id, taluk_id, address, status) VALUES
('Arcot PHC - Demo', 'PHC', 1, 1, 'Arcot, Ranipet', 'ACTIVE'),
('Arcot UPHC - Demo', 'UPHC', 1, 1, 'Arcot, Ranipet', 'ACTIVE'),
('Arcot HSC - 01 - Demo', 'HSC', 1, 1, 'Arcot, Ranipet', 'ACTIVE'),
('Walajah PHC - Demo', 'PHC', 1, 2, 'Walajah, Ranipet', 'ACTIVE'),
('Walajah UPHC - Demo', 'UPHC', 1, 2, 'Walajah, Ranipet', 'ACTIVE'),
('Walajah HSC - 01 - Demo', 'HSC', 1, 2, 'Walajah, Ranipet', 'ACTIVE'),
('Kalavai PHC - Demo', 'PHC', 1, 3, 'Kalavai, Ranipet', 'ACTIVE'),
('Kalavai UPHC - Demo', 'UPHC', 1, 3, 'Kalavai, Ranipet', 'ACTIVE'),
('Kalavai HSC - 01 - Demo', 'HSC', 1, 3, 'Kalavai, Ranipet', 'ACTIVE'),
('Sholinghur PHC - Demo', 'PHC', 1, 4, 'Sholinghur, Ranipet', 'ACTIVE'),
('Sholinghur UPHC - Demo', 'UPHC', 1, 4, 'Sholinghur, Ranipet', 'ACTIVE'),
('Sholinghur HSC - 01 - Demo', 'HSC', 1, 4, 'Sholinghur, Ranipet', 'ACTIVE'),
('Arakkonam PHC - Demo', 'PHC', 1, 5, 'Arakkonam, Ranipet', 'ACTIVE'),
('Arakkonam UPHC - Demo', 'UPHC', 1, 5, 'Arakkonam, Ranipet', 'ACTIVE'),
('Arakkonam HSC - 01 - Demo', 'HSC', 1, 5, 'Arakkonam, Ranipet', 'ACTIVE'),
('Nemili PHC - Demo', 'PHC', 1, 6, 'Nemili, Ranipet', 'ACTIVE'),
('Nemili UPHC - Demo', 'UPHC', 1, 6, 'Nemili, Ranipet', 'ACTIVE'),
('Nemili HSC - 01 - Demo', 'HSC', 1, 6, 'Nemili, Ranipet', 'ACTIVE');

INSERT INTO doctors (user_id, doctor_id, full_name, designation, specialization, phone, status) VALUES
(2, 'DOC-001', 'Dr. Raman', 'Medical Officer', 'General Medicine', '9876543210', 'ACTIVE'),
(3, 'DOC-002', 'Dr. Saravanan', 'Medical Officer', 'Pediatrics', '9876543211', 'ACTIVE'),
(4, 'DOC-003', 'Dr. Nisha', 'Medical Officer', 'Obstetrics & Gynecology', '9876543212', 'ACTIVE'),
(5, 'DOC-004', 'Dr. Karthik', 'Medical Officer', 'General Medicine', '9876543213', 'ACTIVE');

INSERT INTO doctor_facility_assignments (doctor_id, facility_id, assigned_from, assigned_to, is_active)
SELECT d.id, f.id, '2024-01-01', NULL, TRUE
FROM doctors d
INNER JOIN facilities f ON f.name = CASE d.doctor_id
	WHEN 'DOC-001' THEN 'Arcot PHC - Demo'
	WHEN 'DOC-002' THEN 'Walajah UPHC - Demo'
	WHEN 'DOC-003' THEN 'Arcot HSC - 01 - Demo'
	WHEN 'DOC-004' THEN 'Kalavai PHC - Demo'
END
WHERE d.doctor_id IN ('DOC-001', 'DOC-002', 'DOC-003', 'DOC-004');

INSERT INTO service_types (name, description, applicable_facility_type, is_active) VALUES
('OPD Patients', 'Number of out-patient consultations provided.', 'PHC', TRUE),
('ANC Check-ups', 'Antenatal care check-ups completed.', 'PHC', TRUE),
('PNC Visits', 'Postnatal care visits completed.', 'UPHC', TRUE),
('Children Vaccinated', 'Children immunized during the reporting period.', 'HSC', TRUE),
('Laboratory Tests', 'Laboratory investigations performed.', 'PHC', TRUE),
('Referral Cases', 'Patients referred to higher care.', 'UPHC', TRUE),
('Emergency Cases', 'Patients treated in emergency conditions.', 'PHC', TRUE),
('Deliveries', 'Number of deliveries conducted.', 'PHC', TRUE),
('Medicine Stock Status', 'Status of essential medicines inventory.', 'HSC', TRUE);

INSERT INTO attendance_records (doctor_id, facility_id, attendance_date, check_in_time, check_out_time, status, marked_by, source)
SELECT d.id, a.facility_id, CURDATE(), data.check_in_time, data.check_out_time, data.status, data.marked_by, data.source
FROM doctors d
INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id AND a.is_active = TRUE
INNER JOIN (
	SELECT 'DOC-001' AS doctor_id, '09:00:00' AS check_in_time, '17:00:00' AS check_out_time, 'PRESENT' AS status, 2 AS marked_by, 'DOCTOR_PORTAL' AS source
	UNION ALL SELECT 'DOC-002', '09:15:00', '17:15:00', 'LATE', 3, 'DOCTOR_PORTAL'
	UNION ALL SELECT 'DOC-003', NULL, NULL, 'ABSENT', 1, 'ADMIN_OVERRIDE'
	UNION ALL SELECT 'DOC-004', '08:45:00', '16:45:00', 'PRESENT', 5, 'DOCTOR_PORTAL'
) AS data ON data.doctor_id = d.doctor_id;

INSERT INTO daily_service_reports (doctor_id, facility_id, service_date, service_type_id, value, notes, submitted_at)
SELECT d.id, a.facility_id, CURDATE(), data.service_type_id, data.value, data.notes, NOW()
FROM doctors d
INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id AND a.is_active = TRUE
INNER JOIN (
	SELECT 'DOC-001' AS doctor_id, 1 AS service_type_id, 38 AS value, 'Routine OPD activity recorded.' AS notes
	UNION ALL SELECT 'DOC-002', 3, 19, 'PNC visits logged for the day.'
	UNION ALL SELECT 'DOC-004', 5, 12, 'Laboratory testing count submitted.'
) AS data ON data.doctor_id = d.doctor_id;

INSERT INTO alert_logs (doctor_id, facility_id, alert_date, alert_type, severity, status, message)
SELECT d.id, a.facility_id, CURDATE(), 'ABSENTEEISM', 'HIGH', 'OPEN', 'Doctor marked absent without valid attendance update.'
FROM doctors d
INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id AND a.is_active = TRUE
WHERE d.doctor_id = 'DOC-003';

INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'CREATE_ROLE', 'roles', 1, '{"message":"Initial roles created."}'),
(1, 'SEED_DISTRICTS', 'districts', 1, '{"message":"Development district seed loaded."}');
