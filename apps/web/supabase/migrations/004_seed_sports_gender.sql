-- Hawaii Sports Center Sports Gender Separation Seed Data
-- Replaces generic sports with gender-specific versions

-- ============================================
-- 1. DEACTIVATE OLD GENERIC SPORTS
-- ============================================
UPDATE sports SET active = false WHERE code IN ('basketball', 'volleyball', 'soccer');

-- ============================================
-- 2. UPDATE EXISTING SPORTS WITH GENDER INFO
-- ============================================

-- Football (Boys only in Hawaii HS)
UPDATE sports SET
  gender = 'boys',
  display_name = 'Football',
  sort_order = 1,
  periods_config = '{
    "count": 4,
    "names": ["Q1", "Q2", "Q3", "Q4"],
    "type": "timed",
    "period_length_minutes": 12,
    "overtime": {
      "type": "kansas",
      "description": "Kansas Plan - teams alternate from 10-yard line"
    },
    "mercy_rule": {
      "enabled": true,
      "point_difference": 35,
      "effect": "running_clock"
    }
  }'::jsonb
WHERE code = 'football';

-- Baseball (Boys only)
UPDATE sports SET
  gender = 'boys',
  display_name = 'Baseball',
  sort_order = 7,
  periods_config = '{
    "count": 7,
    "names": ["1", "2", "3", "4", "5", "6", "7"],
    "type": "innings",
    "overtime": {
      "type": "extra_innings",
      "description": "Continue until winner decided"
    },
    "mercy_rule": {
      "enabled": true,
      "rules": [
        {"after_inning": 5, "point_difference": 10}
      ]
    }
  }'::jsonb
WHERE code = 'baseball';

-- Softball (Girls only)
UPDATE sports SET
  gender = 'girls',
  display_name = 'Softball',
  sort_order = 8,
  periods_config = '{
    "count": 7,
    "names": ["1", "2", "3", "4", "5", "6", "7"],
    "type": "innings",
    "overtime": {
      "type": "extra_innings",
      "extra_runner": {
        "starts_from_inning": 10,
        "position": "second_base"
      },
      "description": "Extra innings with runner on 2nd starting in 10th"
    },
    "mercy_rule": {
      "enabled": true,
      "rules": [
        {"after_inning": 3, "point_difference": 15},
        {"after_inning": 5, "point_difference": 10}
      ]
    }
  }'::jsonb
WHERE code = 'softball';

-- ============================================
-- 3. INSERT NEW GENDER-SEPARATED SPORTS
-- ============================================

-- Girls Volleyball (Fall)
INSERT INTO sports (id, name, code, display_name, gender, season, active, sort_order, periods_config) VALUES
('11111111-1111-1111-1111-111111111201', 'Volleyball', 'girls-volleyball', 'Girls Volleyball', 'girls', 'fall', true, 2, '{
  "count": 5,
  "names": ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"],
  "type": "sets",
  "points_to_win": 25,
  "points_to_win_final": 15,
  "win_by": 2,
  "sets_to_win": 3,
  "overtime": null,
  "mercy_rule": null
}'::jsonb);

-- Boys Basketball (Winter)
INSERT INTO sports (id, name, code, display_name, gender, season, active, sort_order, periods_config) VALUES
('11111111-1111-1111-1111-111111111202', 'Basketball', 'boys-basketball', 'Boys Basketball', 'boys', 'winter', true, 3, '{
  "count": 4,
  "names": ["Q1", "Q2", "Q3", "Q4"],
  "type": "timed",
  "period_length_minutes": 8,
  "overtime": {
    "type": "periods",
    "period_length_minutes": 4,
    "unlimited": true,
    "description": "4-minute OT periods until winner"
  },
  "mercy_rule": null
}'::jsonb);

-- Girls Basketball (Winter)
INSERT INTO sports (id, name, code, display_name, gender, season, active, sort_order, periods_config) VALUES
('11111111-1111-1111-1111-111111111203', 'Basketball', 'girls-basketball', 'Girls Basketball', 'girls', 'winter', true, 4, '{
  "count": 4,
  "names": ["Q1", "Q2", "Q3", "Q4"],
  "type": "timed",
  "period_length_minutes": 8,
  "overtime": {
    "type": "periods",
    "period_length_minutes": 4,
    "unlimited": true,
    "description": "4-minute OT periods until winner"
  },
  "mercy_rule": null
}'::jsonb);

-- Boys Soccer (Winter)
INSERT INTO sports (id, name, code, display_name, gender, season, active, sort_order, periods_config) VALUES
('11111111-1111-1111-1111-111111111204', 'Soccer', 'boys-soccer', 'Boys Soccer', 'boys', 'winter', true, 5, '{
  "count": 2,
  "names": ["1st Half", "2nd Half"],
  "type": "timed",
  "period_length_minutes": 40,
  "overtime": {
    "type": "golden_goal",
    "periods": 2,
    "period_length_minutes": 10,
    "penalty_kicks_after": true,
    "playoff_only": true,
    "description": "2x10min OT (playoffs), then PKs if still tied"
  },
  "mercy_rule": null
}'::jsonb);

-- Girls Soccer (Winter)
INSERT INTO sports (id, name, code, display_name, gender, season, active, sort_order, periods_config) VALUES
('11111111-1111-1111-1111-111111111205', 'Soccer', 'girls-soccer', 'Girls Soccer', 'girls', 'winter', true, 6, '{
  "count": 2,
  "names": ["1st Half", "2nd Half"],
  "type": "timed",
  "period_length_minutes": 40,
  "overtime": {
    "type": "golden_goal",
    "periods": 2,
    "period_length_minutes": 10,
    "penalty_kicks_after": true,
    "playoff_only": true,
    "description": "2x10min OT (playoffs), then PKs if still tied"
  },
  "mercy_rule": null
}'::jsonb);

-- Boys Volleyball (Spring)
INSERT INTO sports (id, name, code, display_name, gender, season, active, sort_order, periods_config) VALUES
('11111111-1111-1111-1111-111111111206', 'Volleyball', 'boys-volleyball', 'Boys Volleyball', 'boys', 'spring', true, 9, '{
  "count": 5,
  "names": ["Set 1", "Set 2", "Set 3", "Set 4", "Set 5"],
  "type": "sets",
  "points_to_win": 25,
  "points_to_win_final": 15,
  "win_by": 2,
  "sets_to_win": 3,
  "overtime": null,
  "mercy_rule": null
}'::jsonb);

-- ============================================
-- 4. ADD OVERTIME PERIOD NAMES
-- ============================================
-- These can be used when overtime_count > 0

-- Note: The application will dynamically generate OT period names like:
-- Football: "OT", "2OT", "3OT" (Kansas Plan possessions)
-- Basketball: "OT", "2OT", "3OT" (4-min periods)
-- Soccer: "OT1", "OT2", "PKs" (golden goal periods + penalty kicks)
-- Baseball/Softball: "8", "9", "10" (extra innings)
