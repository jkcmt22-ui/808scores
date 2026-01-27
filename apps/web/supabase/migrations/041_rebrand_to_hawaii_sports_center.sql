-- Migration 041: Rebrand from 808scores to Hawaii Sports Center
-- Updates user-facing text in database

-- Update badge description
UPDATE badges
SET description = 'Joined Hawaii Sports Center in the first year'
WHERE code = 'early_adopter';

-- Update scholarship name and description
UPDATE scholarships
SET
  name = 'Hawaii Sports Center Sportsman of the Year',
  description = 'A $10,000 scholarship awarded to the Hawaii high school athlete who best exemplifies sportsmanship, leadership, and athletic excellence. Vote for your favorite athlete!'
WHERE name LIKE '%808scores%' OR name LIKE '%Sportsman of the Year%';
