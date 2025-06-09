import { NextResponse } from "next/headers"
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

      console.log(`Payment successful for ${customerEmail}, session: ${sessionIdentifier}`)

      let formData = null

      // Find the specific form submission using the session identifier
      if (sessionIdentifier) {
        try {
          const { data, error } = await supabaseAdmin
            .from("meditation_submissions")
            .update({
              payment_status: "paid",
              payment_id: session.id,
              updated_at: new Date().toISOString(),
            })
            .eq("session_identifier", sessionIdentifier)
            .select()

          if (error) {
            console.error("Error updating payment status in Supabase:", error)
          } else {
            console.log("Updated payment status for submission:", data.length)
            // Store form data for admin notification
            if (data && data.length > 0) {
              formData = data[0]
              console.log("Found form data for session:", sessionIdentifier)
            } else {
              console.warn("No form data found for session identifier:", sessionIdentifier)
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
            const { data, error } = await supabaseAdmin
              .from("meditation_submissions")
              .select()
              .eq("email", customerEmail)
              .eq("payment_status", "pending")
              .order("created_at", { ascending: false })
              .limit(1)

            if (error) {
              console.error("Error finding form submission by email:", error)
            } else if (data && data.length > 0) {
              formData = data[0]
              console.log("Found form data using fallback method for email:", customerEmail)

              // Update this record with payment info
              await supabaseAdmin
                .from("meditation_submissions")
                .update({
                  payment_status: "paid",
                  payment_id: session.id,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", formData.id)
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
        }
      }

      // Send notification email to admin
      const adminEmail = process.env.EMAIL_SERVER_USER
      if (adminEmail) {
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
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
