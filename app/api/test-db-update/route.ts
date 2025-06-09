import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const { sessionIdentifier, paymentId } = await request.json()

    if (!sessionIdentifier || !paymentId) {
      return NextResponse.json({ error: "Missing sessionIdentifier or paymentId" }, { status: 400 })
    }

    console.log("Testing database update with:", { sessionIdentifier, paymentId })

    // Test 1: Find the record
    const { data: findData, error: findError } = await supabaseAdmin
      .from("meditation_submissions")
      .select("*")
      .eq("session_identifier", sessionIdentifier)

    console.log("Find result:", { data: findData, error: findError })

    if (findError) {
      return NextResponse.json({ error: "Find failed", details: findError }, { status: 500 })
    }

    if (!findData || findData.length === 0) {
      return NextResponse.json({ error: "No record found with that session identifier" }, { status: 404 })
    }

    // Test 2: Update the record
    const updateData = {
      payment_status: "paid",
      payment_id: paymentId,
      updated_at: new Date().toISOString(),
    }

    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from("meditation_submissions")
      .update(updateData)
      .eq("session_identifier", sessionIdentifier)
      .select()

    console.log("Update result:", { data: updateResult, error: updateError })

    if (updateError) {
      return NextResponse.json({ error: "Update failed", details: updateError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      originalRecord: findData[0],
      updatedRecord: updateResult[0],
      message: "Database update test successful",
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ error: "Test failed", details: error.message }, { status: 500 })
  }
}
