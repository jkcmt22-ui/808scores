-- Reset and Reload Standings with Correct League/Overall Records
-- Run this FIRST, then run the individual sport scripts
-- This deletes existing records so the INSERT statements will work

-- Delete existing Girls Volleyball 2025 standings
DELETE FROM season_standings
WHERE sport_id = (SELECT id FROM sports WHERE code = 'girls-volleyball')
AND season_year = 2025;

-- Delete existing Baseball 2025 standings
DELETE FROM season_standings
WHERE sport_id = (SELECT id FROM sports WHERE code = 'baseball')
AND season_year = 2025;

-- Delete existing Softball 2025 standings
DELETE FROM season_standings
WHERE sport_id = (SELECT id FROM sports WHERE code = 'softball')
AND season_year = 2025;

-- Verify deletions
SELECT 'Deleted records. Now run the individual sport scripts:' as message;
SELECT '1. add-girls-volleyball-2025.sql' as script;
SELECT '2. add-baseball-2025.sql' as script;
SELECT '3. add-softball-2025.sql' as script;
