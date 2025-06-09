import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    const voiceSamplesBucket = buckets.find((bucket) => bucket.name === "voice-samples")

    if (!voiceSamplesBucket) {
      return NextResponse.json({ error: "voice-samples bucket does not exist" }, { status: 404 })
    }

    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage.from("voice-samples").list()

    if (filesError) {
      return NextResponse.json({ error: filesError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      bucketExists: true,
      bucketDetails: voiceSamplesBucket,
      fileCount: files.length,
      sampleFiles: files.slice(0, 5), // Show up to 5 files
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
