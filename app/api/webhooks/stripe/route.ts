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

      console.log(`Payment successful for ${customerEmail}, session: ${sessionIdentifier}, payment_id: ${session.id}`)

      let formData = null

      // Find the specific form submission using the session identifier
      if (sessionIdentifier) {
        try {
          // First, get the current data
          const { data: currentData, error: selectError } = await supabaseAdmin
            .from("meditation_submissions")
            .select("*")
            .eq("session_identifier", sessionIdentifier)
            .single()

          if (selectError) {
            console.error("Error finding form submission:", selectError)
          } else if (currentData) {
            formData = currentData
            console.log("Found form data for session:", sessionIdentifier)

            // Now update with payment information
            const { data: updateData, error: updateError } = await supabaseAdmin
              .from("meditation_submissions")
              .update({
                payment_status: "paid",
                payment_id: session.id,
                updated_at: new Date().toISOString(),
              })
              .eq("session_identifier", sessionIdentifier)
              .select()

            if (updateError) {
              console.error("Error updating payment status:", updateError)
            } else {
              console.log("Successfully updated payment status for session:", sessionIdentifier)
              console.log("Payment ID set to:", session.id)
            }
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
        }
      } else {
        console.warn("No session identifier found in Stripe metadata")

        // Fallback: try to find by email and most recent submission
        if (customerEmail) {
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

              // Update this record with payment info
              const { error: updateError } = await supabaseAdmin
                .from("meditation_submissions")
                .update({
                  payment_status: "paid",
                  payment_id: session.id,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", formData.id)

              if (updateError) {
                console.error("Error updating payment status (fallback):", updateError)
              } else {
                console.log("Successfully updated payment status (fallback), payment_id:", session.id)
              }
            }
          } catch (dbError) {
            console.error("Fallback database error:", dbError)
          }
        }
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
        console.log("Sending admin notification with form data:", {
          limiting_beliefs: formData.limiting_beliefs,
          conscious_struggles: formData.conscious_struggles,
          specific_objective: formData.specific_objective,
        })

        const { subject, text, html } = generateAdminOrderNotificationEmail(
          customerName,
          customerEmail || "Unknown",
          meditationPurpose,
          session.id,
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
