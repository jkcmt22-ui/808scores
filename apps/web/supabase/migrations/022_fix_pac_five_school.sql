-- Migration 022: Fix Pac-Five school ID conflict
-- Migration 019 tried to insert Pac-Five with ID 22222222-2222-2222-2222-222222220211
-- but that ID was already used by Hawaiian Mission Academy in migration 006.
-- Since 019 used ON CONFLICT DO NOTHING, Pac-Five was never created.

-- First, check if Pac-Five exists by short_name
DO $$
BEGIN
    -- Only insert if Pac-Five doesn't exist
    IF NOT EXISTS (SELECT 1 FROM schools WHERE short_name = 'Pac-Five') THEN
        INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors)
        VALUES (
            '22222222-2222-2222-2222-222222220230',  -- New unique ID
            'Pac-Five',
            'Pac-Five',
            'Wolfpack',
            'Oahu',
            'ILH',
            'Division I',
            '{"primary": "#000000", "secondary": "#FFD700"}'
        );
        RAISE NOTICE 'Created Pac-Five school with new ID';
    ELSE
        RAISE NOTICE 'Pac-Five school already exists';
    END IF;
END $$;

-- Also ensure Hawaiian Mission Academy exists with correct ID (from migration 019)
-- Migration 006 created it with ID ...0211, and migration 019 tried to create it with ID ...0216
-- The one at ...0211 might have wrong data if it was intended for Pac-Five
DO $$
BEGIN
    -- Check if Hawaiian Mission exists at the newer ID
    IF NOT EXISTS (SELECT 1 FROM schools WHERE id = '22222222-2222-2222-2222-222222220216') THEN
        -- Check if it exists at the old conflicting ID
        IF EXISTS (SELECT 1 FROM schools WHERE id = '22222222-2222-2222-2222-222222220211' AND short_name = 'Hawaiian Mission') THEN
            RAISE NOTICE 'Hawaiian Mission exists at old ID ...0211';
        ELSE
            -- Create Hawaiian Mission at new ID
            INSERT INTO schools (id, name, short_name, mascot, island, league, division, colors)
            VALUES (
                '22222222-2222-2222-2222-222222220216',
                'Hawaiian Mission Academy',
                'Hawaiian Mission',
                'Knights',
                'Oahu',
                'ILH',
                'Division III',
                '{"primary": "#800000", "secondary": "#FFFFFF"}'
            )
            ON CONFLICT (id) DO NOTHING;
            RAISE NOTICE 'Created Hawaiian Mission Academy with ID ...0216';
        END IF;
    END IF;
END $$;
