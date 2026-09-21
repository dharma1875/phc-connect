USE phc_connect;

ALTER TABLE alert_logs
    MODIFY alert_type ENUM('ABSENTEEISM', 'ABSENT', 'LATE') NOT NULL,
    MODIFY status ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    ADD COLUMN acknowledged_at TIMESTAMP NULL AFTER created_at,
    ADD COLUMN acknowledged_by INT NULL AFTER acknowledged_at,
    ADD COLUMN resolved_by INT NULL AFTER resolved_at,
    ADD CONSTRAINT fk_alert_acknowledged_by FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    ADD CONSTRAINT fk_alert_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id),
    ADD UNIQUE KEY uq_alert_doctor_facility_date_type (doctor_id, facility_id, alert_date, alert_type);