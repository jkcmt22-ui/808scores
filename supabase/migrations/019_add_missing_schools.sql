-- Migration 019: Add missing schools
-- These schools exist in Hawaii high school sports but were missing from seed data

-- OIA Schools missing
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220120', 'Kaiser High School', 'Kaiser', 'Cougars', 'Oahu', 'OIA', 'Division I', '{"primary": "#0000FF", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220121', 'Kaimuki High School', 'Kaimuki', 'Bulldogs', 'Oahu', 'OIA', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220122', 'Waialua High School', 'Waialua', 'Bulldogs', 'Oahu', 'OIA', 'Division II', '{"primary": "#008000", "secondary": "#FFFFFF"}')
ON CONFLICT (id) DO NOTHING;

-- ILH Schools missing
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220211', 'Pac-Five', 'Pac-Five', 'Wolfpack', 'Oahu', 'ILH', 'Division I', '{"primary": "#000000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220212', 'Le Jardin Academy', 'Le Jardin', 'Bulldogs', 'Oahu', 'ILH', 'Division II', '{"primary": "#006400", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220213', 'Assets School', 'Assets', 'Owls', 'Oahu', 'ILH', 'Division III', '{"primary": "#4169E1", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220214', 'Christian Academy', 'Christian Academy', 'Eagles', 'Oahu', 'ILH', 'Division III', '{"primary": "#000080", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220215', 'Hanalani Schools', 'Hanalani', 'Royals', 'Oahu', 'ILH', 'Division III', '{"primary": "#4B0082", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220216', 'Hawaiian Mission Academy', 'Hawaiian Mission', 'Knights', 'Oahu', 'ILH', 'Division III', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220217', 'St. Francis School', 'St. Francis', 'Saints', 'Oahu', 'ILH', 'Division II', '{"primary": "#FF0000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220218', 'La Pietra Hawaii School for Girls', 'La Pietra', 'Cardinals', 'Oahu', 'ILH', 'Division II', '{"primary": "#CC0000", "secondary": "#FFFFFF"}')
ON CONFLICT (id) DO NOTHING;

-- BIIF Schools missing
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220411', 'Kau High School', 'Kau', 'Trojans', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#800000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220412', 'Kohala High School', 'Kohala', 'Cowboys', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#0000FF", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220413', 'Laupahoehoe High School', 'Laupahoehoe', 'Seasiders', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#FF0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220414', 'St. Joseph High School', 'St. Joseph', 'Cardinals', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#CC0000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220415', 'Makua Lani Christian Academy', 'Makua Lani', 'Lions', 'Hawaii', 'BIIF', 'Division II', '{"primary": "#FFD700", "secondary": "#000000"}')
ON CONFLICT (id) DO NOTHING;

-- MIL Schools missing
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220310', 'Maui Prep Academy', 'Maui Prep', 'Warriors', 'Maui', 'MIL', 'Division II', '{"primary": "#000080", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220311', 'St. Anthony High School', 'St. Anthony', 'Trojans', 'Maui', 'MIL', 'Division II', '{"primary": "#0000FF", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220312', 'Kihei Charter School', 'Kihei Charter', 'Na Koa', 'Maui', 'MIL', 'Division II', '{"primary": "#008000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220313', 'Kulanihakoi High School', 'Kulanihakoi', 'Warriors', 'Maui', 'MIL', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}')
ON CONFLICT (id) DO NOTHING;

-- Additional ILH Schools
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220219', 'Island Pacific Academy', 'Island Pacific', 'Navigators', 'Oahu', 'ILH', 'Division II', '{"primary": "#000080", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220220', "St. Andrew's Priory", 'St. Andrews', 'Priory', 'Oahu', 'ILH', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}')
ON CONFLICT (id) DO NOTHING;
