import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const sessionId = searchParams.get("session_id")

    let query = supabaseAdmin
      .from("meditation_submissions")
      .select("id, email, name, payment_status, payment_id, session_identifier, created_at, updated_at")

    if (email) {
      query = query.eq("email", email)
    }

    if (sessionId) {
      query = query.eq("session_identifier", sessionId)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also check table structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "meditation_submissions")
      .in("column_name", ["payment_id", "payment_status", "session_identifier"])

    return NextResponse.json({
      submissions: data,
      tableStructure: tableInfo,
      tableError: tableError,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
