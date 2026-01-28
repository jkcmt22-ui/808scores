import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin, is_super_admin')
      .eq('id', user.id)
      .single()

    if (!(profile as any)?.is_admin && !(profile as any)?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get existing school to check if it exists and get current logo
    const { data: existingSchoolData, error: fetchError } = await supabase
      .from('schools')
      .select('id, logo_url')
      .eq('id', id)
      .single()

    if (fetchError || !existingSchoolData) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const existingSchool = existingSchoolData as any

    // Parse form data
    const formData = await request.formData()

    // Extract school data
    const name = formData.get('name') as string
    const short_name = formData.get('short_name') as string
    const mascot = formData.get('mascot') as string | null
    const island = formData.get('island') as string
    const league = formData.get('league') as string | null
    const division = formData.get('division') as string | null
    const colorsJson = formData.get('colors') as string | null
    const logoFile = formData.get('logo') as File | null

    // Validate required fields
    if (!name || !short_name || !island) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Name, short name, and island are required' },
        { status: 400 }
      )
    }

    // Parse colors JSON
    let colors = null
    if (colorsJson) {
      try {
        colors = JSON.parse(colorsJson)
      } catch {
        return NextResponse.json(
          { error: 'Invalid colors format', message: 'Colors must be valid JSON' },
          { status: 400 }
        )
      }
    }

    // Handle logo upload if provided
    let logo_url = existingSchool.logo_url // Keep existing logo by default
    if (logoFile && logoFile.size > 0) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json(
          { error: 'Invalid file type', message: 'Logo must be PNG, JPG, WEBP, or SVG' },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large', message: 'Logo must be smaller than 5MB' },
          { status: 400 }
        )
      }

      // Generate unique filename
      const fileExt = logoFile.name.split('.').pop()
      const timestamp = Date.now()
      const sanitizedName = short_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const fileName = `${sanitizedName}_${timestamp}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(fileName, logoFile, {
          contentType: logoFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Logo upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload logo', message: uploadError.message },
          { status: 500 }
        )
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('school-logos')
        .getPublicUrl(uploadData.path)

      logo_url = publicUrl

      // Delete old logo if it exists
      if (existingSchool.logo_url) {
        try {
          const oldFileName = existingSchool.logo_url.split('/').pop()
          if (oldFileName) {
            await supabase.storage.from('school-logos').remove([oldFileName])
          }
        } catch (e) {
          // Don't fail if old logo deletion fails
          console.error('Error deleting old logo:', e)
        }
      }
    }

    // Update school record
    const { data: school, error: schoolError } = await (supabase as any)
      .from('schools')
      .update({
        name,
        short_name,
        mascot: mascot || null,
        island,
        league: league || null,
        division: division || null,
        colors,
        logo_url,
      })
      .eq('id', id)
      .select()
      .single()

    if (schoolError) {
      console.error('School update error:', schoolError)

      // If school update failed and we uploaded a new logo, clean it up
      if (logoFile && logo_url !== existingSchool.logo_url) {
        const fileName = logo_url?.split('/').pop()
        if (fileName) {
          await supabase.storage.from('school-logos').remove([fileName])
        }
      }

      return NextResponse.json(
        { error: 'Failed to update school', message: schoolError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      school,
      message: 'School updated successfully',
    })
  } catch (error) {
    console.error('School update error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update school',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
