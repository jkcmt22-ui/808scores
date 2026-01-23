-- Migration 020: Add Division II varsity team entries
-- In Hawaii high school sports, some larger schools (especially ILH) have
-- both Division I and Division II varsity teams. These are separate competitive teams,
-- not JV teams. ScoringLive lists them as "School II" (e.g., "Iolani II").

-- ILH Division II varsity teams
INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors) VALUES
  ('22222222-2222-2222-2222-222222220301', '''Iolani II', '''Iolani II', 'Raiders', 'Oahu', 'ILH', 'Division II', '{"primary": "#CC0000", "secondary": "#000000"}'),
  ('22222222-2222-2222-2222-222222220302', 'Punahou II', 'Punahou II', 'Buffanblu', 'Oahu', 'ILH', 'Division II', '{"primary": "#003366", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220303', 'Kamehameha II', 'Kamehameha II', 'Warriors', 'Oahu', 'ILH', 'Division II', '{"primary": "#0033A0", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220304', 'Saint Louis II', 'Saint Louis II', 'Crusaders', 'Oahu', 'ILH', 'Division II', '{"primary": "#003087", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220305', 'Maryknoll II', 'Maryknoll II', 'Spartans', 'Oahu', 'ILH', 'Division II', '{"primary": "#800000", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220306', 'Mid-Pacific II', 'Mid-Pacific II', 'Owls', 'Oahu', 'ILH', 'Division II', '{"primary": "#003366", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220307', 'Damien II', 'Damien II', 'Monarchs', 'Oahu', 'ILH', 'Division II', '{"primary": "#CC0000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220308', 'HBA II', 'HBA II', 'Eagles', 'Oahu', 'ILH', 'Division II', '{"primary": "#003087", "secondary": "#FFD700"}'),
  ('22222222-2222-2222-2222-222222220309', 'Sacred Hearts II', 'Sacred Hearts II', 'Lancers', 'Oahu', 'ILH', 'Division II', '{"primary": "#800000", "secondary": "#FFFFFF"}'),
  ('22222222-2222-2222-2222-222222220310', 'University Lab II', 'University Lab II', 'Jr. Rainbows', 'Oahu', 'ILH', 'Division II', '{"primary": "#024731", "secondary": "#FFFFFF"}')
ON CONFLICT (id) DO NOTHING;
