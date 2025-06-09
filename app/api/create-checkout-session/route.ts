import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const { email, name, meditationPurpose, sessionIdentifier } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!sessionIdentifier) {
      return NextResponse.json({ error: "Session identifier is required" }, { status: 400 })
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Custom Meditation Package",
              description: meditationPurpose
                ? `Personalized meditation for ${meditationPurpose}`
                : "Personalized meditation package",
              images: [
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brain%20rewired%20_processed.webp-mgKFpXFkZ8IvvO6XiC79Ixiit4CURf.png",
              ],
            },
            unit_amount: 2900, // $29.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}?canceled=true`,
      customer_email: email,
      client_reference_id: name,
      metadata: {
        meditationPurpose: meditationPurpose || "Not specified",
        customerName: name,
        sessionIdentifier: sessionIdentifier, // Include the session identifier
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
