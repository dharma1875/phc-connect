CREATE DATABASE IF NOT EXISTS phc_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phc_connect;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS alert_logs;
DROP TABLE IF EXISTS daily_service_reports;
DROP TABLE IF EXISTS service_types;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS doctor_facility_assignments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS facilities;
DROP TABLE IF EXISTS taluks;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    state_name VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_district_name (name)
);

CREATE TABLE taluks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_taluks_district FOREIGN KEY (district_id) REFERENCES districts(id),
    INDEX idx_taluks_district_id (district_id),
    INDEX idx_taluks_name (name)
);

CREATE TABLE facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    facility_type ENUM('PHC', 'UPHC', 'HSC') NOT NULL,
    district_id INT NOT NULL,
    taluk_id INT NOT NULL,
    address VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_facilities_district FOREIGN KEY (district_id) REFERENCES districts(id),
    CONSTRAINT fk_facilities_taluk FOREIGN KEY (taluk_id) REFERENCES taluks(id),
    INDEX idx_facilities_district_id (district_id),
    INDEX idx_facilities_taluk_id (taluk_id),
    INDEX idx_facilities_type (facility_type)
);

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    doctor_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100),
    specialization VARCHAR(100),
    phone VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_doctors_user_id (user_id),
    INDEX idx_doctors_status (status)
);

CREATE TABLE doctor_facility_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    facility_id INT NOT NULL,
    assigned_from DATE NOT NULL,
    assigned_to DATE NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_assignment_facility FOREIGN KEY (facility_id) REFERENCES facilities(id),
    INDEX idx_assignment_doctor_id (doctor_id),
    INDEX idx_assignment_facility_id (facility_id),
    INDEX idx_assignment_active (is_active)
);

CREATE TABLE attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    facility_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'LEAVE') NOT NULL,
    marked_by INT NULL,
    source ENUM('DOCTOR_PORTAL', 'ADMIN_OVERRIDE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_attendance_facility FOREIGN KEY (facility_id) REFERENCES facilities(id),
    CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users(id),
    INDEX idx_attendance_doctor_id (doctor_id),
    INDEX idx_attendance_facility_id (facility_id),
    INDEX idx_attendance_date (attendance_date),
    UNIQUE KEY uq_attendance_doctor_date (doctor_id, attendance_date)
);

CREATE TABLE service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    applicable_facility_type ENUM('PHC', 'UPHC', 'HSC') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_types_type (applicable_facility_type)
);

CREATE TABLE daily_service_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    facility_id INT NOT NULL,
    service_date DATE NOT NULL,
    service_type_id INT NOT NULL,
    value INT NOT NULL,
    notes TEXT,
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_report_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_service_report_facility FOREIGN KEY (facility_id) REFERENCES facilities(id),
    CONSTRAINT fk_service_report_type FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    INDEX idx_service_report_doctor_id (doctor_id),
    INDEX idx_service_report_facility_id (facility_id),
    INDEX idx_service_report_date (service_date),
    UNIQUE KEY uq_daily_service_report (doctor_id, facility_id, service_date, service_type_id)
);

CREATE TABLE alert_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NULL,
    facility_id INT NOT NULL,
    alert_date DATE NOT NULL,
    alert_type ENUM('ABSENTEEISM', 'ABSENT', 'LATE') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    status ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    acknowledged_by INT NULL,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    CONSTRAINT fk_alert_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    CONSTRAINT fk_alert_facility FOREIGN KEY (facility_id) REFERENCES facilities(id),
    CONSTRAINT fk_alert_acknowledged_by FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    CONSTRAINT fk_alert_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id),
    INDEX idx_alert_facility_id (facility_id),
    INDEX idx_alert_doctor_id (doctor_id),
    INDEX idx_alert_date (alert_date),
    UNIQUE KEY uq_alert_doctor_facility_date_type (doctor_id, facility_id, alert_date, alert_type)
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_entity_type (entity_type),
    INDEX idx_audit_created_at (created_at)
);
