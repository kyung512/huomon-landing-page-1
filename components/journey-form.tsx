"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Lock } from "lucide-react"
import Image from "next/image"
import { submitForm } from "@/app/actions/submit-form"

export function JourneyForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const submittingRef = useRef(false) // Use ref to track submission state across renders
  const [formData, setFormData] = useState({
    limitingBeliefs: "",
    consciousStruggles: "",
    specificObjective: "",
    meditationPurpose: "",
    meditationStyle: "",
    voiceGender: "",
    voiceTonality: "",
    customVoice: null as File | null,
    dreamLifeVisualization: "",
    name: "",
    email: "",
    additionalInfo: "",
  })

  const handleNext = () => {
    if (step < 8) setStep(step + 1)
    else handleSubmit()
  }

  // Use useCallback to memoize the submit handler
  const handleSubmit = useCallback(async () => {
    // Prevent duplicate submissions
    if (submittingRef.current) {
      console.log("Submission already in progress, ignoring duplicate request")
      return
    }

    try {
      setIsSubmitting(true)
      submittingRef.current = true
      setSubmitError(null)

      console.log("Starting form submission with data:", {
        ...formData,
        customVoice: formData.customVoice ? `${formData.customVoice.name} (${formData.customVoice.size} bytes)` : null,
      })

      // Validate required fields
      if (!formData.name || !formData.email) {
        setSubmitError("Name and email are required fields")
        setIsSubmitting(false)
        submittingRef.current = false
        return
      }

      // First submit the form data to Supabase
      const result = await submitForm(formData)
      console.log("Form submission result:", result)

      if (result.success && result.sessionIdentifier) {
        setSubmitSuccess(true)

        // Create Stripe checkout session with the session identifier
        try {
          const response = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              meditationPurpose: formData.meditationPurpose,
              sessionIdentifier: result.sessionIdentifier, // Pass the session identifier
            }),
          })

          const { url, error } = await response.json()

          if (error) {
            throw new Error(error)
          }

          // Redirect to Stripe Checkout
          window.location.href = url
        } catch (stripeError) {
          console.error("Stripe checkout error:", stripeError)
          setSubmitError("Payment processing error. Please try again.")
        }
      } else {
        setSubmitError(result.error || "Failed to submit form. Please try again.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
      // Reset submittingRef after a delay to prevent rapid re-submissions
      setTimeout(() => {
        submittingRef.current = false
      }, 2000)
    }
  }, [formData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log("File selected:", file.name, file.size, file.type)
      setFormData({ ...formData, customVoice: file })
    }
  }

  return (
    <div className="grid gap-4 py-4">
      {step === 1 && (
        <div className="grid gap-2">
          <Label htmlFor="limitingBeliefs" className="text-foreground">
            Tell us some of your limiting beliefs you can recognize.
          </Label>
          <textarea
            id="limitingBeliefs"
            rows={4}
            className="w-full p-3 rounded-md bg-card text-foreground border border-accent/30 resize-none"
            placeholder="E.g., I don't deserve success, Money is hard to come by..."
            value={formData.limitingBeliefs}
            onChange={(e) => setFormData({ ...formData, limitingBeliefs: e.target.value })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-2">
          <Label htmlFor="consciousStruggles" className="text-foreground">
            Any conscious struggles that you want to overcome?
          </Label>
          <textarea
            id="consciousStruggles"
            rows={4}
            className="w-full p-3 rounded-md bg-card text-foreground border border-accent/30 resize-none"
            placeholder="E.g., Procrastination, Fear of rejection, Imposter syndrome..."
            value={formData.consciousStruggles}
            onChange={(e) => setFormData({ ...formData, consciousStruggles: e.target.value })}
          />
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-2">
          <Label htmlFor="specificObjective" className="text-foreground">
            Any specific objective for these meditations?
          </Label>
          <textarea
            id="specificObjective"
            rows={4}
            className="w-full p-3 rounded-md bg-card text-foreground border border-accent/30 resize-none"
            placeholder="E.g., I want to get a 200k job, I want to start my own business..."
            value={formData.specificObjective}
            onChange={(e) => setFormData({ ...formData, specificObjective: e.target.value })}
          />
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-2">
          <Label htmlFor="meditationPurpose" className="text-foreground">
            General purpose of meditation:
          </Label>
          <Select onValueChange={(value) => setFormData({ ...formData, meditationPurpose: value })}>
            <SelectTrigger id="meditationPurpose" className="bg-card text-foreground border-accent/30">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-accent/30">
              <SelectItem value="wealth">Wealth & Abundance</SelectItem>
              <SelectItem value="confidence">Confidence & Self-Esteem</SelectItem>
              <SelectItem value="relationships">Relationships & Love</SelectItem>
              <SelectItem value="health">Health & Vitality</SelectItem>
              <SelectItem value="creativity">Creativity & Inspiration</SelectItem>
              <SelectItem value="peace">Inner Peace & Calm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {step === 5 && (
        <div className="grid gap-2">
          <Label htmlFor="meditationStyle" className="text-foreground">
            Style of meditation:
          </Label>
          <Select onValueChange={(value) => setFormData({ ...formData, meditationStyle: value })}>
            <SelectTrigger id="meditationStyle" className="bg-card text-foreground border-accent/30">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-accent/30">
              <SelectItem value="visualization">Guided Visualization</SelectItem>
              <SelectItem value="affirmation">Positive Affirmations</SelectItem>
              <SelectItem value="hypnotic">Hypnotic Suggestions</SelectItem>
              <SelectItem value="mindfulness">Mindfulness & Presence</SelectItem>
              <SelectItem value="breathwork">Breathwork Focus</SelectItem>
              <SelectItem value="bodyscan">Body Scan Relaxation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {step === 6 && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="voiceGender" className="text-foreground">
              Type of voice:
            </Label>
            <Select onValueChange={(value) => setFormData({ ...formData, voiceGender: value })}>
              <SelectTrigger id="voiceGender" className="bg-card text-foreground border-accent/30">
                <SelectValue placeholder="Select voice gender" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-accent/30">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="neutral">Gender Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="voiceTonality" className="text-foreground">
              Voice tonality:
            </Label>
            <Select onValueChange={(value) => setFormData({ ...formData, voiceTonality: value })}>
              <SelectTrigger id="voiceTonality" className="bg-card text-foreground border-accent/30">
                <SelectValue placeholder="Select voice tonality" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-accent/30">
                <SelectItem value="soothing">Soothing & Calm</SelectItem>
                <SelectItem value="energetic">Energetic & Motivating</SelectItem>
                <SelectItem value="authoritative">Authoritative & Confident</SelectItem>
                <SelectItem value="warm">Warm & Nurturing</SelectItem>
                <SelectItem value="whisper">Soft Whisper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label className="text-foreground">Or upload your own voice sample:</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-card text-foreground border-accent/30"
                onClick={() => document.getElementById("voiceUpload")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Voice
              </Button>
              <span className="text-sm text-muted-foreground">
                {formData.customVoice ? formData.customVoice.name : "No file selected"}
              </span>
              <input id="voiceUpload" type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a clear audio sample of your voice (30 seconds minimum)
            </p>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="grid gap-2">
          <Label htmlFor="dreamLifeVisualization" className="text-foreground">
            Visualization: How does your dream life look like?
          </Label>
          <textarea
            id="dreamLifeVisualization"
            rows={5}
            className="w-full p-3 rounded-md bg-card text-foreground border border-accent/30 resize-none"
            placeholder="Describe in detail how your ideal life would look, feel, and sound like..."
            value={formData.dreamLifeVisualization}
            onChange={(e) => setFormData({ ...formData, dreamLifeVisualization: e.target.value })}
          />
        </div>
      )}

      {step === 8 && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-foreground">
              Your Name (for personalized meditations)
            </Label>
            <Input
              id="name"
              className="bg-card text-foreground border-accent/30"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground">
              Your Email
            </Label>
            <Input
              id="email"
              type="email"
              className="bg-card text-foreground border-accent/30"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="additionalInfo" className="text-foreground">
              Anything else you'd like us to know?
            </Label>
            <textarea
              id="additionalInfo"
              rows={3}
              className="w-full p-3 rounded-md bg-card text-foreground border border-accent/30 resize-none"
              placeholder="Any additional details that would help us personalize your meditations..."
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="bg-card text-foreground border-accent/30"
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        <div className={`${step > 1 ? "ml-auto" : ""} flex gap-2`}>
          {step !== 6 && step < 8 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step + 1)}
              className="text-gray-400 hover:text-gray-300"
              disabled={isSubmitting}
            >
              Skip
            </Button>
          )}
          <button
            onClick={step < 8 ? handleNext : handleSubmit}
            disabled={isSubmitting}
            className={`bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-2 rounded-md transition-all transform hover:scale-[1.02] shadow-md ${
              step === 8 ? "shadow-lg" : ""
            } ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Processing..." : step < 8 ? "Next" : "Buy Now"}
          </button>
        </div>
      </div>

      {submitError && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-200 text-sm">
          Form submitted successfully! Redirecting to payment page...
        </div>
      )}

      <div className="flex justify-center mt-4">
        <div className="flex gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i + 1 === step ? "bg-purple-500" : "bg-gray-600"}`} />
          ))}
        </div>
      </div>

      {step === 8 && (
        <>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            By clicking 'Buy Now', you'll be directed to our secure payment page.
            <br />
            <span className="font-medium text-primary">$29 one-time for lifetime results.</span>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-800/30 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Secure payment powered by</span>
            </div>
            <div className="h-8">
              <Image
                src="/images/stripe-logo.png"
                alt="Stripe secure payments"
                width={70}
                height={30}
                className="h-full w-auto"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your payment information is encrypted and securely processed. We never store your card details.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
