"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPaymentPage() {
  const [sessionIdentifier, setSessionIdentifier] = useState("")
  const [paymentId, setPaymentId] = useState("cs_test_1234567890")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testDatabaseUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionIdentifier,
          paymentId,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to test database update", details: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Database Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionId">Session Identifier</Label>
              <Input
                id="sessionId"
                value={sessionIdentifier}
                onChange={(e) => setSessionIdentifier(e.target.value)}
                placeholder="Enter session identifier from Supabase"
              />
            </div>
            <div>
              <Label htmlFor="paymentId">Payment ID</Label>
              <Input
                id="paymentId"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="cs_test_1234567890"
              />
            </div>
            <Button onClick={testDatabaseUpdate} disabled={loading || !sessionIdentifier}>
              {loading ? "Testing..." : "Test Database Update"}
            </Button>

            {result && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Result:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
