"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export type FormData = {
  limitingBeliefs: string
  consciousStruggles: string
  specificObjective: string
  meditationPurpose: string
  meditationStyle: string
  voiceGender: string
  voiceTonality: string
  customVoice: File | null
  dreamLifeVisualization: string
  name: string
  email: string
  additionalInfo: string
}

export async function submitForm(formData: FormData) {
  try {
    console.log("Form submission started with data:", {
      ...formData,
      customVoice: formData.customVoice ? `${formData.customVoice.name} (${formData.customVoice.size} bytes)` : null,
    })

    // Validate required fields
    if (!formData.name || !formData.email) {
      return {
        success: false,
        error: "Name and email are required fields",
      }
    }

    // Generate a unique session identifier for this form submission
    const sessionIdentifier = uuidv4()

    // Handle file upload if a custom voice file is provided
    let customVoiceUrl = null

    if (formData.customVoice) {
      console.log("Processing file upload:", formData.customVoice.name)
      const file = formData.customVoice
      const fileExt = file.name.split(".").pop()

      // Create a unique filename with timestamp and UUID
      const fileName = `${Date.now()}_${uuidv4()}.${fileExt}`
      console.log("Generated filename:", fileName)

      try {
        // Upload file to Supabase Storage using admin client
        console.log("Attempting to upload file to Supabase...")
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("voice-samples")
          .upload(fileName, file)

        if (uploadError) {
          console.error("Upload error details:", uploadError)
          throw new Error(`Error uploading file: ${uploadError.message}`)
        }

        console.log("Upload successful:", uploadData)

        // Get public URL for the uploaded file
        const { data: urlData } = await supabaseAdmin.storage.from("voice-samples").getPublicUrl(fileName)
        customVoiceUrl = urlData?.publicUrl || null
        console.log("Generated public URL:", customVoiceUrl)
      } catch (uploadErr) {
        console.error("Exception during upload:", uploadErr)
        throw uploadErr
      }
    }

    // Prepare data for insertion
    const submissionData = {
      session_identifier: sessionIdentifier, // Add unique session identifier
      limiting_beliefs: formData.limitingBeliefs,
      conscious_struggles: formData.consciousStruggles,
      specific_objective: formData.specificObjective,
      meditation_purpose: formData.meditationPurpose,
      meditation_style: formData.meditationStyle,
      voice_gender: formData.voiceGender,
      voice_tonality: formData.voiceTonality,
      custom_voice_url: customVoiceUrl,
      dream_life_visualization: formData.dreamLifeVisualization,
      name: formData.name,
      email: formData.email,
      additional_info: formData.additionalInfo,
      payment_status: "pending", // Set initial status
    }

    console.log("Attempting to insert data into database:", submissionData)

    // Insert form data into the database using admin client
    const { data, error } = await supabaseAdmin.from("meditation_submissions").insert([submissionData]).select()

    if (error) {
      console.error("Database insert error:", error)
      throw new Error(`Error inserting data: ${error.message}`)
    }

    console.log("Database insert successful:", data)
    revalidatePath("/")
    return {
      success: true,
      data,
      sessionIdentifier, // Return the session identifier to use in Stripe
    }
  } catch (error) {
    console.error("Form submission error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
