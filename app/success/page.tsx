"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Mail } from "lucide-react"
import { GridBackground } from "@/components/grid-background"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessionDetails() {
      if (!sessionId) return

      try {
        const response = await fetch(`/api/checkout-session?session_id=${sessionId}`)
        const data = await response.json()

        if (data.customer_email) {
          setCustomerEmail(data.customer_email)
        }
      } catch (error) {
        console.error("Error fetching session details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionDetails()
  }, [sessionId])

  return (
    <div className="min-h-screen text-white relative">
      <GridBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-[#151515] p-8 rounded-xl shadow-xl border border-purple-500/20">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Payment Successful!</h1>

            <p className="text-gray-300 mb-6">
              Thank you for your purchase. Your custom meditation package is now being created.
            </p>

            {customerEmail && (
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 mb-6 w-full">
                <div className="flex items-center justify-center mb-2">
                  <Mail className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="text-lg font-medium text-purple-400">Confirmation Email Sent</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  We've sent a confirmation email to{" "}
                  <span className="text-purple-400 font-medium">{customerEmail}</span> with your order details.
                </p>
              </div>
            )}

            <div className="space-y-4 text-left w-full mb-8">
              <h3 className="text-lg font-medium text-center">What happens next:</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                <li>
                  Our team is now creating your personalized meditation package based on the information you provided.
                </li>
                <li>Within the next 48 hours, you'll receive another email with access to your custom meditations.</li>
                <li>You'll have lifetime access to your meditation package, including any future updates.</li>
              </ol>
            </div>

            <Link
              href="/"
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-3 rounded-md transition-all transform hover:scale-[1.02] shadow-md"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
