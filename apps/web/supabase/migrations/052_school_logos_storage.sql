-- Migration 052: School Logos Storage Setup
-- Creates storage bucket and RLS policies for school logo uploads

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create school-logos bucket if it doesn't exist
-- This needs to be done manually in Supabase Dashboard or via SQL
-- Bucket configuration:
--   - Name: school-logos
--   - Public: true (for displaying logos on public pages)
--   - Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp, image/svg+xml
--   - Max file size: 5MB

-- Note: Storage buckets must be created via Supabase Dashboard Storage settings
-- or using the Supabase API. This migration only sets up the RLS policies.

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

-- Allow public read access to school logos
CREATE POLICY "Public read access to school logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-logos');

-- Allow admins to upload logos
CREATE POLICY "Admins can upload school logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_admin = true OR is_super_admin = true)
    )
  )
);

-- Allow admins to update logos
CREATE POLICY "Admins can update school logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_admin = true OR is_super_admin = true)
    )
  )
);

-- Allow admins to delete logos
CREATE POLICY "Admins can delete school logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND (is_admin = true OR is_super_admin = true)
    )
  )
);
