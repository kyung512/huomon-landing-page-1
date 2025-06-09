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

      console.log(`Payment successful for ${customerEmail}`)
      console.log(`Session identifier: ${sessionIdentifier}`)
      console.log(`Payment ID: ${paymentId}`)

      let formData = null
      let updateSuccess = false

      // Find and update the specific form submission using the session identifier
      if (sessionIdentifier) {
        try {
          console.log(`Looking for form submission with session_identifier: ${sessionIdentifier}`)

          // First, get the current data
          const { data: currentData, error: selectError } = await supabaseAdmin
            .from("meditation_submissions")
            .select("*")
            .eq("session_identifier", sessionIdentifier)
            .single()

          if (selectError) {
            console.error("Error finding form submission by session_identifier:", selectError)
          } else if (currentData) {
            formData = currentData
            console.log("Found form data for session:", sessionIdentifier)
            console.log("Current payment_status:", currentData.payment_status)
            console.log("Current payment_id:", currentData.payment_id)

            // Now update with payment information
            const updateData = {
              payment_status: "paid",
              payment_id: paymentId,
              updated_at: new Date().toISOString(),
            }

            console.log("Updating with data:", updateData)

            const { data: updatedData, error: updateError } = await supabaseAdmin
              .from("meditation_submissions")
              .update(updateData)
              .eq("session_identifier", sessionIdentifier)
              .select()

            if (updateError) {
              console.error("Error updating payment status:", updateError)
              console.error("Update error details:", JSON.stringify(updateError, null, 2))
            } else {
              console.log("Successfully updated payment status for session:", sessionIdentifier)
              console.log("Updated data:", updatedData)
              updateSuccess = true

              // Update formData with the new information
              if (updatedData && updatedData.length > 0) {
                formData = updatedData[0]
                console.log("Updated payment_id in formData:", formData.payment_id)
              }
            }
          } else {
            console.warn("No form submission found with session_identifier:", sessionIdentifier)
          }
        } catch (dbError) {
          console.error("Database error during session_identifier lookup:", dbError)
        }
      }

      // Fallback: try to find by email if session identifier method failed
      if (!updateSuccess && customerEmail) {
        console.log("Attempting fallback method using email:", customerEmail)

        try {
          const { data: fallbackData, error: fallbackError } = await supabaseAdmin
            .from("meditation_submissions")
            .select("*")
            .eq("email", customerEmail)
            .eq("payment_status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)

          if (fallbackError) {
            console.error("Error finding form submission by email:", fallbackError)
          } else if (fallbackData && fallbackData.length > 0) {
            formData = fallbackData[0]
            console.log("Found form data using fallback method for email:", customerEmail)
            console.log("Fallback record ID:", formData.id)

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

            if (updateError) {
              console.error("Error updating payment status (fallback):", updateError)
              console.error("Fallback update error details:", JSON.stringify(updateError, null, 2))
            } else {
              console.log("Successfully updated payment status (fallback)")
              console.log("Fallback updated data:", updatedFallbackData)
              updateSuccess = true

              // Update formData with the new information
              if (updatedFallbackData && updatedFallbackData.length > 0) {
                formData = updatedFallbackData[0]
                console.log("Fallback updated payment_id in formData:", formData.payment_id)
              }
            }
          } else {
            console.warn("No pending form submission found for email:", customerEmail)
          }
        } catch (dbError) {
          console.error("Fallback database error:", dbError)
        }
      }

      // Log final status
      if (updateSuccess) {
        console.log("✅ Payment ID successfully updated in database")
        console.log("Final payment_id:", formData?.payment_id)
      } else {
        console.error("❌ Failed to update payment ID in database")
      }

      // Send confirmation email to customer
      if (customerEmail) {
        const { subject, text, html } = generateOrderConfirmationEmail(customerName, meditationPurpose)

        const emailResult = await sendEmail({
          to: customerEmail,
          subject,
          text,
          html,
        })

        if (!emailResult.success) {
          console.error("Failed to send confirmation email:", emailResult.error)
        } else {
          console.log("Customer confirmation email sent successfully")
        }
      }

      // Send notification email to admin
      const adminEmail = process.env.EMAIL_SERVER_USER
      if (adminEmail && formData) {
        console.log("Sending admin notification with form data")
        console.log("Form data payment_id for admin email:", formData.payment_id)

        const { subject, text, html } = generateAdminOrderNotificationEmail(
          customerName,
          customerEmail || "Unknown",
          meditationPurpose,
          paymentId, // Use the payment ID from Stripe session
          formData,
        )

        const adminEmailResult = await sendEmail({
          to: adminEmail,
          subject,
          text,
          html,
        })

        if (!adminEmailResult.success) {
          console.error("Failed to send admin notification email:", adminEmailResult.error)
        } else {
          console.log("Admin notification email sent successfully")
        }
      } else {
        console.warn("Admin email not sent - missing admin email or form data", {
          adminEmail: !!adminEmail,
          formData: !!formData,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
