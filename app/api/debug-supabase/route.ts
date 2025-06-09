import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    // Test database connection without using aggregate functions
    const dbTest = await supabaseAdmin.from("meditation_submissions").select("id").limit(10)

    // Test storage connection
    const storageTest = await supabaseAdmin.storage.from("voice-samples").list()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environmentVariables: envCheck,
      databaseConnection: {
        success: !dbTest.error,
        error: dbTest.error,
        recordsReturned: dbTest.data?.length || 0,
      },
      storageConnection: {
        success: !storageTest.error,
        error: storageTest.error,
        fileCount: storageTest.data?.length || 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
