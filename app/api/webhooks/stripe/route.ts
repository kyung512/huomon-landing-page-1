import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendEmail, generateOrderConfirmationEmail, generateAdminOrderNotificationEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get("stripe-signature") as string

    let event: Stripe.Event

    // Verify the webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret!)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Get customer email and name
      const customerEmail = session.customer_email
      const customerName = session.client_reference_id || "Valued Customer"
      const meditationPurpose = session.metadata?.meditationPurpose || ""
      const sessionIdentifier = session.metadata?.sessionIdentifier
      const paymentId = session.id

      console.log("=== WEBHOOK PROCESSING START ===")
      console.log(`Payment successful for: ${customerEmail}`)
      console.log(`Session identifier: ${sessionIdentifier}`)
      console.log(`Payment ID: ${paymentId}`)
      console.log(`Event ID: ${event.id}`)

      let formData = null
      let updateSuccess = false
      const updateAttempts = []

      // Test database connection first
      try {
        console.log("Testing database connection...")
        const { data: testData, error: testError } = await supabaseAdmin
          .from("meditation_submissions")
          .select("count")
          .limit(1)

        if (testError) {
          console.error("❌ Database connection test failed:", testError)
          updateAttempts.push({ method: "connection_test", success: false, error: testError.message })
        } else {
          console.log("✅ Database connection test successful")
          updateAttempts.push({ method: "connection_test", success: true })
        }
      } catch (connError) {
        console.error("❌ Database connection exception:", connError)
        updateAttempts.push({ method: "connection_test", success: false, error: connError.message })
      }

      // Method 1: Find and update using session identifier
      if (sessionIdentifier) {
        try {
          console.log(`\n--- METHOD 1: Session Identifier Lookup ---`)
          console.log(`Looking for session_identifier: ${sessionIdentifier}`)

          // First, get the current data
          const { data: currentData, error: selectError } = await supabaseAdmin
            .from("meditation_submissions")
            .select("*")
            .eq("session_identifier", sessionIdentifier)

          console.log("Select query result:", { data: currentData, error: selectError })

          if (selectError) {
            console.error("❌ Error finding form submission by session_identifier:", selectError)
            updateAttempts.push({
              method: "session_identifier_select",
              success: false,
              error: selectError.message,
            })
          } else if (currentData && currentData.length > 0) {
            formData = currentData[0]
            console.log("✅ Found form data for session:", sessionIdentifier)
            console.log("Record details:", {
              id: formData.id,
              email: formData.email,
              current_payment_status: formData.payment_status,
              current_payment_id: formData.payment_id,
            })

            // Now update with payment information
            const updateData = {
              payment_status: "paid",
              payment_id: paymentId,
              updated_at: new Date().toISOString(),
            }

            console.log("Attempting update with data:", updateData)

            const { data: updatedData, error: updateError } = await supabaseAdmin
              .from("meditation_submissions")
              .update(updateData)
              .eq("session_identifier", sessionIdentifier)
              .select()

            console.log("Update query result:", { data: updatedData, error: updateError })

            if (updateError) {
              console.error("❌ Error updating payment status:", updateError)
              console.error("Update error details:", JSON.stringify(updateError, null, 2))
              updateAttempts.push({
                method: "session_identifier_update",
                success: false,
                error: updateError.message,
                details: updateError,
              })
            } else {
              console.log("✅ Successfully updated payment status for session:", sessionIdentifier)
              console.log("Updated data:", updatedData)
              updateSuccess = true
              updateAttempts.push({
                method: "session_identifier_update",
                success: true,
                recordsUpdated: updatedData?.length || 0,
              })

              // Update formData with the new information
              if (updatedData && updatedData.length > 0) {
                formData = updatedData[0]
                console.log("✅ Updated payment_id in formData:", formData.payment_id)
              }
            }
          } else {
            console.warn("⚠️ No form submission found with session_identifier:", sessionIdentifier)
            updateAttempts.push({
              method: "session_identifier_select",
              success: false,
              error: "No records found",
            })
          }
        } catch (dbError) {
          console.error("❌ Database error during session_identifier lookup:", dbError)
          updateAttempts.push({
            method: "session_identifier_exception",
            success: false,
            error: dbError.message,
          })
        }
      } else {
        console.warn("⚠️ No session identifier provided in Stripe metadata")
        updateAttempts.push({
          method: "session_identifier_missing",
          success: false,
          error: "No session identifier in metadata",
        })
      }

      // Method 2: Fallback using email if session identifier method failed
      if (!updateSuccess && customerEmail) {
        try {
          console.log(`\n--- METHOD 2: Email Fallback ---`)
          console.log(`Attempting fallback method using email: ${customerEmail}`)

          const { data: fallbackData, error: fallbackError } = await supabaseAdmin
            .from("meditation_submissions")
            .select("*")
            .eq("email", customerEmail)
            .eq("payment_status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)

          console.log("Fallback select result:", { data: fallbackData, error: fallbackError })

          if (fallbackError) {
            console.error("❌ Error finding form submission by email:", fallbackError)
            updateAttempts.push({
              method: "email_fallback_select",
              success: false,
              error: fallbackError.message,
            })
          } else if (fallbackData && fallbackData.length > 0) {
            formData = fallbackData[0]
            console.log("✅ Found form data using fallback method for email:", customerEmail)
            console.log("Fallback record details:", {
              id: formData.id,
              session_identifier: formData.session_identifier,
              current_payment_status: formData.payment_status,
              current_payment_id: formData.payment_id,
            })

            // Update this record with payment info
            const updateData = {
              payment_status: "paid",
              payment_id: paymentId,
              updated_at: new Date().toISOString(),
            }

            console.log("Fallback update with data:", updateData)

            const { data: updatedFallbackData, error: updateError } = await supabaseAdmin
              .from("meditation_submissions")
              .update(updateData)
              .eq("id", formData.id)
              .select()

            console.log("Fallback update result:", { data: updatedFallbackData, error: updateError })

            if (updateError) {
              console.error("❌ Error updating payment status (fallback):", updateError)
              console.error("Fallback update error details:", JSON.stringify(updateError, null, 2))
              updateAttempts.push({
                method: "email_fallback_update",
                success: false,
                error: updateError.message,
                details: updateError,
              })
            } else {
              console.log("✅ Successfully updated payment status (fallback)")
              console.log("Fallback updated data:", updatedFallbackData)
              updateSuccess = true
              updateAttempts.push({
                method: "email_fallback_update",
                success: true,
                recordsUpdated: updatedFallbackData?.length || 0,
              })

              // Update formData with the new information
              if (updatedFallbackData && updatedFallbackData.length > 0) {
                formData = updatedFallbackData[0]
                console.log("✅ Fallback updated payment_id in formData:", formData.payment_id)
              }
            }
          } else {
            console.warn("⚠️ No pending form submission found for email:", customerEmail)
            updateAttempts.push({
              method: "email_fallback_select",
              success: false,
              error: "No pending records found for email",
            })
          }
        } catch (dbError) {
          console.error("❌ Fallback database error:", dbError)
          updateAttempts.push({
            method: "email_fallback_exception",
            success: false,
            error: dbError.message,
          })
        }
      }

      // Method 3: Direct update by payment_id if we have it
      if (!updateSuccess && paymentId) {
        try {
          console.log(`\n--- METHOD 3: Direct Payment ID Update ---`)
          console.log(`Attempting direct update for any record that might match criteria`)

          // Try to find any record that could be this payment
          const { data: directData, error: directError } = await supabaseAdmin
            .from("meditation_submissions")
            .select("*")
            .is("payment_id", null)
            .eq("payment_status", "pending")
            .order("created_at", { ascending: false })
            .limit(5) // Get last 5 pending records

          console.log("Direct search result:", { data: directData, error: directError })

          if (directData && directData.length > 0) {
            // Try to match by email if available
            let targetRecord = null
            if (customerEmail) {
              targetRecord = directData.find((record) => record.email === customerEmail)
            }

            // If no email match, take the most recent
            if (!targetRecord) {
              targetRecord = directData[0]
            }

            if (targetRecord) {
              console.log("Found target record for direct update:", targetRecord.id)

              const updateData = {
                payment_status: "paid",
                payment_id: paymentId,
                updated_at: new Date().toISOString(),
              }

              const { data: directUpdatedData, error: directUpdateError } = await supabaseAdmin
                .from("meditation_submissions")
                .update(updateData)
                .eq("id", targetRecord.id)
                .select()

              if (directUpdateError) {
                console.error("❌ Direct update failed:", directUpdateError)
                updateAttempts.push({
                  method: "direct_update",
                  success: false,
                  error: directUpdateError.message,
                })
              } else {
                console.log("✅ Direct update successful")
                updateSuccess = true
                formData = directUpdatedData[0]
                updateAttempts.push({
                  method: "direct_update",
                  success: true,
                  recordsUpdated: directUpdatedData?.length || 0,
                })
              }
            }
          }
        } catch (directError) {
          console.error("❌ Direct update exception:", directError)
          updateAttempts.push({
            method: "direct_update_exception",
            success: false,
            error: directError.message,
          })
        }
      }

      // Log final status
      console.log("\n=== FINAL UPDATE STATUS ===")
      console.log("Update success:", updateSuccess)
      console.log("Update attempts:", updateAttempts)
      if (updateSuccess) {
        console.log("✅ Payment ID successfully updated in database")
        console.log("Final payment_id:", formData?.payment_id)
        console.log("Final record ID:", formData?.id)
      } else {
        console.error("❌ Failed to update payment ID in database")
        console.error("All attempts failed:", updateAttempts)
      }

      // Send confirmation email to customer
      if (customerEmail) {
        const { subject, text, html } = generateOrderConfirmationEmail(
          customerName,
          meditationPurpose,
          paymentId,
          sessionIdentifier,
        )

        const emailResult = await sendEmail({
          to: customerEmail,
          subject,
          text,
          html,
        })

        if (!emailResult.success) {
          console.error("Failed to send confirmation email:", emailResult.error)
        } else {
          console.log("✅ Customer confirmation email sent successfully")
        }
      }

      // Send notification email to admin
      const adminEmail = process.env.EMAIL_SERVER_USER
      if (adminEmail) {
        console.log("Sending admin notification")

        // Include debug information in admin email
        const debugInfo = {
          updateSuccess,
          updateAttempts,
          webhookEventId: event.id,
          stripeSessionId: session.id,
          formDataFound: !!formData,
          formDataId: formData?.id,
        }

        const { subject, text, html } = generateAdminOrderNotificationEmail(
          customerName,
          customerEmail || "Unknown",
          meditationPurpose,
          paymentId,
          formData,
        )

        // Add debug info to admin email
        const enhancedHtml = html.replace(
          "</div>",
          `
          <div class="technical-details">
            <h3>🔍 Debug Information:</h3>
            <div class="tech-field"><strong>Update Success:</strong> ${updateSuccess ? "✅ Yes" : "❌ No"}</div>
            <div class="tech-field"><strong>Webhook Event ID:</strong> ${event.id}</div>
            <div class="tech-field"><strong>Update Attempts:</strong> ${updateAttempts.length}</div>
            <div class="tech-field"><strong>Form Data Found:</strong> ${formData ? "✅ Yes" : "❌ No"}</div>
            ${formData ? `<div class="tech-field"><strong>Database Record ID:</strong> ${formData.id}</div>` : ""}
            <details>
              <summary>Detailed Update Attempts</summary>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 11px;">${JSON.stringify(updateAttempts, null, 2)}</pre>
            </details>
          </div>
          </div>`,
        )

        const adminEmailResult = await sendEmail({
          to: adminEmail,
          subject: updateSuccess ? subject : `[UPDATE FAILED] ${subject}`,
          text,
          html: enhancedHtml,
        })

        if (!adminEmailResult.success) {
          console.error("Failed to send admin notification email:", adminEmailResult.error)
        } else {
          console.log("✅ Admin notification email sent successfully")
        }
      }

      console.log("=== WEBHOOK PROCESSING END ===\n")
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
