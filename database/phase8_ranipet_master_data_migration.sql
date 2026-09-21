USE phc_connect;

START TRANSACTION;

-- Reuse an existing district row where possible so dependent records remain valid.
SET @ranipet_id = (SELECT id FROM districts WHERE name = 'Ranipet' ORDER BY id LIMIT 1);
SET @ranipet_id = COALESCE(@ranipet_id, (SELECT id FROM districts ORDER BY id LIMIT 1));

INSERT INTO districts (name, state_name, status)
SELECT 'Ranipet', 'Tamil Nadu', 'ACTIVE'
WHERE @ranipet_id IS NULL;

SET @ranipet_id = COALESCE(@ranipet_id, LAST_INSERT_ID());

UPDATE districts
SET status = CASE WHEN id = @ranipet_id THEN 'ACTIVE' ELSE 'INACTIVE' END,
    name = CASE WHEN id = @ranipet_id THEN 'Ranipet' ELSE name END;

UPDATE taluks SET name = 'Arcot' WHERE name = 'Adayar';
UPDATE taluks SET name = 'Walajah' WHERE name = 'Madhavaram';
UPDATE taluks SET name = 'Kalavai' WHERE name = 'Coimbatore North';
UPDATE taluks SET name = 'Sholinghur' WHERE name = 'Coimbatore South';

INSERT INTO taluks (district_id, name, status)
SELECT @ranipet_id, desired.name, 'ACTIVE'
FROM (
    SELECT 'Arcot' AS name
    UNION ALL SELECT 'Walajah'
    UNION ALL SELECT 'Kalavai'
    UNION ALL SELECT 'Sholinghur'
    UNION ALL SELECT 'Arakkonam'
    UNION ALL SELECT 'Nemili'
) AS desired
WHERE NOT EXISTS (
    SELECT 1 FROM taluks t
    WHERE t.name = desired.name
);

UPDATE taluks
SET district_id = @ranipet_id,
    status = CASE WHEN name IN ('Arcot', 'Walajah', 'Kalavai', 'Sholinghur', 'Arakkonam', 'Nemili')
                  THEN 'ACTIVE' ELSE 'INACTIVE' END;

SET @arcot_id = (SELECT id FROM taluks WHERE district_id = @ranipet_id AND name = 'Arcot' LIMIT 1);
SET @walajah_id = (SELECT id FROM taluks WHERE district_id = @ranipet_id AND name = 'Walajah' LIMIT 1);
SET @kalavai_id = (SELECT id FROM taluks WHERE district_id = @ranipet_id AND name = 'Kalavai' LIMIT 1);
SET @sholinghur_id = (SELECT id FROM taluks WHERE district_id = @ranipet_id AND name = 'Sholinghur' LIMIT 1);
SET @arakkonam_id = (SELECT id FROM taluks WHERE district_id = @ranipet_id AND name = 'Arakkonam' LIMIT 1);
SET @nemili_id = (SELECT id FROM taluks WHERE district_id = @ranipet_id AND name = 'Nemili' LIMIT 1);

-- Consolidate duplicates if this migration is rerun after a partial earlier run.
SET @duplicate_id = (SELECT MAX(id) FROM taluks WHERE district_id = @ranipet_id AND name = 'Kalavai' AND id <> @kalavai_id);
UPDATE facilities SET taluk_id = @kalavai_id WHERE taluk_id = @duplicate_id;
DELETE FROM taluks WHERE id = @duplicate_id;
SET @duplicate_id = (SELECT MAX(id) FROM taluks WHERE district_id = @ranipet_id AND name = 'Sholinghur' AND id <> @sholinghur_id);
UPDATE facilities SET taluk_id = @sholinghur_id WHERE taluk_id = @duplicate_id;
DELETE FROM taluks WHERE id = @duplicate_id;

UPDATE facilities
SET district_id = @ranipet_id;

UPDATE facilities
SET name = 'Arcot PHC - Demo', address = 'Arcot, Ranipet', taluk_id = @arcot_id
WHERE name = 'Primary Health Centre - Velachery';
UPDATE facilities
SET name = 'Walajah UPHC - Demo', address = 'Walajah, Ranipet', taluk_id = @walajah_id
WHERE name = 'UPHC - Tambaram';
UPDATE facilities
SET name = 'Arcot HSC - 01 - Demo', address = 'Arcot, Ranipet', taluk_id = @arcot_id
WHERE name = 'Health Sub Centre - Thiruvanmiyur';
UPDATE facilities
SET name = 'Kalavai PHC - Demo', address = 'Kalavai, Ranipet', taluk_id = @kalavai_id
WHERE name = 'Primary Health Centre - Kovaipudur';
UPDATE facilities
SET name = 'Sholinghur UPHC - Demo', address = 'Sholinghur, Ranipet', taluk_id = @sholinghur_id
WHERE name = 'UPHC - Peelamedu';

INSERT INTO facilities (name, facility_type, district_id, taluk_id, address, status)
SELECT desired.name, desired.facility_type, @ranipet_id, desired.taluk_id, desired.address, 'ACTIVE'
FROM (
    SELECT 'Arcot UPHC - Demo' AS name, 'UPHC' AS facility_type, @arcot_id AS taluk_id, 'Arcot, Ranipet' AS address
    UNION ALL SELECT 'Walajah PHC - Demo', 'PHC', @walajah_id, 'Walajah, Ranipet'
    UNION ALL SELECT 'Walajah HSC - 01 - Demo', 'HSC', @walajah_id, 'Walajah, Ranipet'
    UNION ALL SELECT 'Kalavai UPHC - Demo', 'UPHC', @kalavai_id, 'Kalavai, Ranipet'
    UNION ALL SELECT 'Kalavai HSC - 01 - Demo', 'HSC', @kalavai_id, 'Kalavai, Ranipet'
    UNION ALL SELECT 'Sholinghur PHC - Demo', 'PHC', @sholinghur_id, 'Sholinghur, Ranipet'
    UNION ALL SELECT 'Sholinghur HSC - 01 - Demo', 'HSC', @sholinghur_id, 'Sholinghur, Ranipet'
    UNION ALL SELECT 'Arakkonam PHC - Demo', 'PHC', @arakkonam_id, 'Arakkonam, Ranipet'
    UNION ALL SELECT 'Arakkonam UPHC - Demo', 'UPHC', @arakkonam_id, 'Arakkonam, Ranipet'
    UNION ALL SELECT 'Arakkonam HSC - 01 - Demo', 'HSC', @arakkonam_id, 'Arakkonam, Ranipet'
    UNION ALL SELECT 'Nemili PHC - Demo', 'PHC', @nemili_id, 'Nemili, Ranipet'
    UNION ALL SELECT 'Nemili UPHC - Demo', 'UPHC', @nemili_id, 'Nemili, Ranipet'
    UNION ALL SELECT 'Nemili HSC - 01 - Demo', 'HSC', @nemili_id, 'Nemili, Ranipet'
) AS desired
WHERE NOT EXISTS (SELECT 1 FROM facilities f WHERE f.name = desired.name);

COMMIT;

-- Verification queries:
SELECT id, name, status FROM districts ORDER BY id;
SELECT t.id, t.name, d.name AS district_name, t.status
FROM taluks t INNER JOIN districts d ON d.id = t.district_id
ORDER BY t.id;
SELECT f.id, f.name, f.facility_type, t.name AS taluk_name, d.name AS district_name, f.status
FROM facilities f
INNER JOIN taluks t ON t.id = f.taluk_id
INNER JOIN districts d ON d.id = f.district_id
ORDER BY f.id;
SELECT COUNT(*) AS orphan_taluks
FROM taluks t LEFT JOIN districts d ON d.id = t.district_id
WHERE d.id IS NULL;
SELECT COUNT(*) AS orphan_facilities
FROM facilities f
LEFT JOIN taluks t ON t.id = f.taluk_id
WHERE t.id IS NULL;