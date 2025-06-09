import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      id: session.id,
      customer_email: session.customer_email,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
    })
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return NextResponse.json({ error: "Failed to retrieve checkout session" }, { status: 500 })
  }
}
