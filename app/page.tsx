"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Sparkles, Moon, ChevronRight, Instagram, Mail, Volume2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GridBackground } from "@/components/grid-background"
import { MeditationFormDialog } from "@/components/meditation-form-dialog"
import { RebelButton } from "@/components/rebel-button"
import type React from "react"

import { Upload, Lock, FileText, Headphones } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { submitForm } from "./actions/submit-form"

// TikTok Icon Component
const TikTokIcon = ({ className = "" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  )
}

function JourneyForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const result = await submitForm(formData)

      if (result.success) {
        // Redirect to Stripe checkout after successful submission
        window.location.href = "https://buy.stripe.com/7sIeYQ3qq6eO4eceUW"
      } else {
        setSubmitError(result.error || "Failed to submit form. Please try again.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, customVoice: e.target.files[0] })
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
                onClick={() => document.getElementById("voiceUpload").click()}
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

// Floating element component for the How It Works section
function FloatingElement({ children, className = "", style = {} }) {
  const [position, setPosition] = useState({ x: 0, y: 0, rotate: 0 })

  useEffect(() => {
    // Random initial position
    setPosition({
      x: Math.random() * 40 - 20, // -20 to 20
      y: Math.random() * 40 - 20, // -20 to 20
      rotate: Math.random() * 20 - 10, // -10 to 10 degrees
    })

    // Animation interval
    const interval = setInterval(() => {
      setPosition((prev) => ({
        x: prev.x + (Math.random() * 2 - 1), // Small random movement
        y: prev.y + (Math.random() * 2 - 1),
        rotate: prev.rotate + (Math.random() * 2 - 1),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`absolute transition-all duration-[2000ms] ease-in-out ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// Audio Player Component
function AudioPlayer({ src, className = "" }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/30 transition-colors"
      >
        {isPlaying ? (
          <span className="w-3 h-3 bg-purple-400 rounded-sm"></span>
        ) : (
          <Volume2 className="w-5 h-5 text-purple-400" />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-0 audio-progress"></div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        className="hidden"
        onTimeUpdate={(e) => {
          const progress = (e.currentTarget.currentTime / e.currentTarget.duration) * 100
          document.querySelector(".audio-progress").style.width = `${progress}%`
        }}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  )
}

// Contact Dialog Component
function ContactDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-gray-400 hover:text-gray-300 transition-colors">Contact Us</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>Have questions or need assistance? Reach out to us directly.</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex items-center justify-center gap-3 text-lg">
            <Mail className="h-5 w-5 text-purple-400" />
            <a href="mailto:contact@manifestvault.com" className="text-white hover:text-purple-400 transition-colors">
              contact@manifestvault.com
            </a>
          </div>
          <p className="text-center text-gray-400 mt-4 text-sm">We typically respond within 24-48 hours.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function Home() {
  // Define experts array outside the JSX for reuse
  const experts = [
    {
      name: "Dr. Joe Dispenza",
      role: "Neuroscience & Manifestation",
      image: "/images/joe-dispenza.jpeg",
    },
    {
      name: "Bob Proctor",
      role: "Law of Attraction & Wealth Mindset",
      image: "/images/bob-proctor.jpeg",
    },
    { name: "Bruce Lipton", role: "The Biology of Belief", image: "/images/bruce-lipton.jpeg" },
    { name: "Brian Tracy", role: "Success & Goal Setting", image: "/images/brian-tracy.jpeg" },
    {
      name: "Vishen Lakhiani",
      role: "Mind Hacking & Spiritual Growth",
      image: "/images/vishen-lakhiani.jpeg",
    },
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Grid Background with particles - similar to Cobalt website */}
      <GridBackground />

      {/* Content with relative positioning to appear above the canvas */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto py-6 px-4 rounded-lg mt-4">
          {/* Logo Row with Social Icons for Mobile */}
          <div className="flex justify-between items-center mb-6 md:mb-0">
            <div className="h-10 flex items-center">
              <h1 className="text-amber-500 font-bold text-2xl">ManifestVault</h1>
            </div>

            {/* Social Icons - Visible on mobile and desktop */}
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/manifest.vault/?utm_source=ig_web_button_share_sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-purple-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@manifest.vault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-purple-400 transition-colors"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Mobile Navigation - Hidden on desktop */}
          <nav className="flex md:hidden space-x-6 overflow-x-auto py-2 pr-4 scrollbar-hide">
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("resources")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Resources
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Pricing
            </button>
          </nav>

          {/* Desktop Navigation - Hidden on mobile, centered */}
          <nav className="hidden md:flex md:justify-center space-x-8 py-0 w-full">
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("resources")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              Resources
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-gray-300 hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
            >
              Pricing
            </button>
          </nav>
        </header>

        {/* Notification Banner */}
        <div className="flex justify-center mt-6 md:mt-8 px-4 md:px-0">
          <MeditationFormDialog>
            <button className="flex items-center gap-2 bg-black/50 text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-black/60 transition-colors text-sm md:text-base w-full md:w-auto justify-center">
              Limited Time Offer: First 48 hours - Only $29 <ChevronRight className="h-4 w-4" />
            </button>
          </MeditationFormDialog>
        </div>

        {/* Hero Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500">
                Your Mind, Rewired for Success & Health
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-2xl mx-auto">
                We create tailor-made meditations for your custom situation. Transform your subconscious mind and your
                life in just 4 weeks.
              </p>

              <div className="flex justify-center mb-16">
                <MeditationFormDialog>
                  <RebelButton className="text-lg">Create My Meditations</RebelButton>
                </MeditationFormDialog>
              </div>

              {/* 3D Visual Element - Fixed Brain Image */}
              <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
                <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-transparent">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5 rounded-3xl blur-xl"></div>
                  <Image
                    src="/images/brain-rewired-processed.png"
                    alt="Colorful visualization of neural connections in the brain"
                    width={700}
                    height={400}
                    className="relative z-10 object-contain max-h-full"
                    priority
                    style={{
                      objectFit: "contain",
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* As Featured In Section */}
        <section id="resources" className="py-16 border-y border-gray-800/30">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">As Featured In</h2>

              {/* Featured Logos */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 mb-16">
                <Link
                  href="https://www.nytimes.com/2007/07/31/health/psychology/31subl.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-24 md:h-32 flex items-center justify-center"
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/new_york_times_logo_white-f5mSXCULJHf19Lb2La5kJw9TJWY1vI.png"
                    alt="The New York Times"
                    width={1500}
                    height={200}
                    className="h-32 md:h-48 w-auto object-contain"
                  />
                </Link>
                <Link
                  href="https://www.psychologytoday.com/us/blog/imagery-coaching/202401/using-science-to-manifest-success"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-24 md:h-32 flex items-center justify-center"
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/psychology_today_logo_no_bg-YoVX8Xw3a6fdeuVFPVY5YvyCeI8Jpd.png"
                    alt="Psychology Today"
                    width={1500}
                    height={200}
                    className="h-32 md:h-48 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* Testimonials/Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-[#151515] p-8 rounded-xl shadow-xl border border-purple-500/20">
                  <h3 className="text-xl font-bold mb-6 text-purple-400">Successful People Insights</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-500/30">
                        <Image
                          src="/images/james-clear.png"
                          alt="James Clear"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium mb-2">James Clear, Author of Atomic Habits</div>
                        <p className="text-gray-300">
                          "The most successful people I know all have some form of daily meditation practice. It's not
                          just about relaxation—it's about training your mind to focus on what matters."
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-500/30">
                        <Image
                          src="/images/ariana-huffington.png"
                          alt="Arianna Huffington"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium mb-2">Arianna Huffington, Founder of Thrive Global</div>
                        <p className="text-gray-300">
                          "Meditation is a crucial part of my daily routine. It helps me stay centered and make better
                          decisions, especially during challenging times."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#151515] p-8 rounded-xl shadow-xl border border-indigo-500/20">
                  <h3 className="text-xl font-bold mb-6 text-purple-400">Expert Insights</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500/30">
                        <Image
                          src="/images/sarah-mckay.png"
                          alt="Dr. Sarah McKay"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium mb-2">Dr. Sarah McKay, Neuroscientist</div>
                        <p className="text-gray-300">
                          "Personalized meditation has shown remarkable results in neuroplasticity studies. The brain
                          literally rewires itself when we engage in consistent, targeted meditation practices."
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500/30">
                        <Image
                          src="/images/michael-singer.png"
                          alt="Michael Singer"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium mb-2">Michael Singer, Author of The Untethered Soul</div>
                        <p className="text-gray-300">
                          "The practice of meditation is really about letting go of the blockages that prevent you from
                          experiencing your true nature of abundance and joy."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* YouTube Videos */}
              <h3 className="text-xl font-bold text-center mb-8 text-white">Inspiration from Thought Leaders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-video bg-[#151515] rounded-xl overflow-hidden border border-purple-500/20">
                  <div className="relative w-full h-full">
                    <iframe
                      src="https://www.youtube.com/embed/-B31lqyINDI"
                      title="Jim Carrey on Manifestation"
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center">
                    <p className="text-white font-medium"></p>
                  </div>
                </div>
                <div className="aspect-video bg-[#151515] rounded-xl overflow-hidden border border-indigo-500/20">
                  <div className="relative w-full h-full">
                    <iframe
                      src="https://www.youtube.com/embed/lg4NOGe1D08"
                      title="Eckhart Tolle on Consciousness"
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center">
                    <p className="text-white font-medium"></p>
                  </div>
                </div>
              </div>

              {/* Based on proven techniques section */}
              <div className="mt-16">
                <h3 className="text-xl font-bold text-center mb-8 text-white">Based on proven techniques from:</h3>
                <div className="overflow-x-auto py-4 -mx-4 px-4">
                  <div className="flex space-x-8 md:space-x-12 min-w-max">
                    {experts.map((expert, index) => (
                      <div key={index} className="flex flex-col items-center w-[110px] md:w-auto flex-shrink-0">
                        <div className="w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-purple-500/30 mb-2 md:mb-3">
                          <Image
                            src={expert.image || "/placeholder.svg"}
                            alt={expert.name}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-white font-medium text-center text-xs md:text-base">{expert.name}</h4>
                        <p className="text-xs text-gray-400 text-center hidden md:block">{expert.role}</p>
                        <p className="text-[10px] text-gray-400 text-center md:hidden">{expert.role.split(" & ")[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                Transform Your Life Through Audio Visualizations
              </h2>
              <p className="text-lg text-gray-300">
                Manifest Vault provides personalized meditation experiences that speak directly to your subconscious
                mind, helping you break through limitations and create the life you truly want.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="bg-[#151515] border-none shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-full bg-purple-500/20">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Tailored for You</h3>
                  <p className="text-gray-400">
                    Our AI-powered system creates custom meditations based on your unique goals and preferences.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#151515] border-none shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Manifest Your Dreams</h3>
                  <p className="text-gray-400">
                    Harness the power of your subconscious to create the reality you desire through consistent practice.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#151515] border-none shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center rounded-full bg-violet-500/20">
                    <Moon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Rapid Transformation</h3>
                  <p className="text-gray-400">
                    Just 15 minutes a day can create profound shifts in your consciousness, accelerating your success,
                    wealth, and health.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section - Updated with Modern Flow Chart Style */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px] relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                How It Works
              </h2>
              <p className="text-lg text-gray-300">
                See how Manifest Vault creates personalized meditations tailored to your specific goals and needs.
              </p>
            </div>

            {/* Modern Flow Chart Diagram */}
            <div className="max-w-5xl mx-auto relative">
              {/* Desktop version - hidden on mobile, visible on md screens and up */}
              <div className="hidden md:block relative w-full h-[700px] bg-[#0c0c14] rounded-xl p-6 border border-purple-500/20">
                {/* Central Node */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center z-20">
                  <div className="w-28 h-28 rounded-full bg-[#0c0c14] flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="w-10 h-10 text-amber-500 mx-auto mb-1" />
                      <span className="text-white font-bold text-sm">ManifestVault</span>
                    </div>
                  </div>
                </div>

                {/* Input Nodes - Left Side */}
                <div className="absolute top-[10%] left-[10%] w-64 z-10">
                  <div className="bg-[#151515] p-4 rounded-lg border border-amber-500/30 mb-14">
                    <div className="flex items-center mb-2">
                      <FileText className="w-5 h-5 text-amber-500 mr-2" />
                      <span className="text-amber-500 font-medium">Personal Goals</span>
                    </div>
                    <p className="text-sm text-gray-300">Your specific objectives and desires for transformation</p>
                  </div>

                  <div className="bg-[#151515] p-4 rounded-lg border border-amber-500/30 mb-14">
                    <div className="flex items-center mb-2">
                      <Brain className="w-5 h-5 text-amber-500 mr-2" />
                      <span className="text-amber-500 font-medium">Limiting Beliefs</span>
                    </div>
                    <p className="text-sm text-gray-300">Subconscious blocks that are holding you back</p>
                  </div>

                  <div className="bg-[#151515] p-4 rounded-lg border border-amber-500/30">
                    <div className="flex items-center mb-2">
                      <Headphones className="w-5 h-5 text-amber-500 mr-2" />
                      <span className="text-amber-500 font-medium">Voice Preferences</span>
                    </div>
                    <p className="text-sm text-gray-300">Your preferred meditation style and voice type</p>
                  </div>
                </div>

                {/* Output Nodes - Right Side */}
                <div className="absolute top-[10%] right-[10%] w-64 z-10">
                  <div className="bg-[#151515] p-4 rounded-lg border border-indigo-500/30 mb-14">
                    <div className="flex items-center mb-2">
                      <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
                      <span className="text-indigo-500 font-medium">Abundance Meditation</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Personalized audio frequencies to manifest wealth and abundance
                    </p>
                  </div>

                  <div className="bg-[#151515] p-4 rounded-lg border border-indigo-500/30 mb-14">
                    <div className="flex items-center mb-2">
                      <Brain className="w-5 h-5 text-indigo-500 mr-2" />
                      <span className="text-indigo-500 font-medium">Confidence Booster</span>
                    </div>
                    <p className="text-sm text-gray-300">Guided visualizations to build unshakable self-belief</p>
                  </div>

                  <div className="bg-[#151515] p-4 rounded-lg border border-indigo-500/30">
                    <div className="flex items-center mb-2">
                      <Moon className="w-5 h-5 text-indigo-500 mr-2" />
                      <span className="text-indigo-500 font-medium">Subconscious Rewiring</span>
                    </div>
                    <p className="text-sm text-gray-300">Deep mental reprogramming while you sleep</p>
                  </div>
                </div>

                {/* Connection Lines - Using pseudo-elements in CSS would be better, but for simplicity */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/20 via-purple-500/40 to-indigo-500/20 z-10"></div>

                {/* Process Steps - Bottom */}
                <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 w-full max-w-xl z-10">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#151515] p-4 rounded-lg border border-purple-500/20 text-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-400 font-bold">1</span>
                      </div>
                      <h4 className="text-white text-sm font-medium mb-1">Complete Form</h4>
                      <p className="text-xs text-gray-400">Share your goals and preferences</p>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-purple-500/20 text-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-400 font-bold">2</span>
                      </div>
                      <h4 className="text-white text-sm font-medium mb-1">AI Processing</h4>
                      <p className="text-xs text-gray-400">We create your custom package</p>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-purple-500/20 text-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-400 font-bold">3</span>
                      </div>
                      <h4 className="text-white text-sm font-medium mb-1">Transform</h4>
                      <p className="text-xs text-gray-400">Listen daily for 4 weeks</p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements for Visual Interest */}
                <FloatingElement className="top-[30%] left-[30%]">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 backdrop-blur-sm"></div>
                </FloatingElement>

                <FloatingElement className="bottom-[40%] right-[25%]">
                  <div className="w-4 h-4 rounded-full bg-indigo-500/30 backdrop-blur-sm"></div>
                </FloatingElement>

                <FloatingElement className="top-[60%] right-[35%]">
                  <div className="w-5 h-5 rounded-full bg-amber-500/30 backdrop-blur-sm"></div>
                </FloatingElement>
              </div>

              {/* Mobile version - visible on mobile, hidden on md screens and up */}
              <div className="md:hidden bg-[#0c0c14] rounded-xl p-6 border border-purple-500/20">
                {/* Central Node */}
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#0c0c14] flex items-center justify-center">
                      <div className="text-center">
                        <Brain className="w-8 h-8 text-amber-500 mx-auto mb-1" />
                        <span className="text-white font-bold text-xs">ManifestVault</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Section */}
                <div className="mb-8">
                  <h4 className="text-amber-500 font-medium text-center mb-4">What You Provide</h4>
                  <div className="space-y-4">
                    <div className="bg-[#151515] p-4 rounded-lg border border-amber-500/30">
                      <div className="flex items-center mb-2">
                        <FileText className="w-5 h-5 text-amber-500 mr-2" />
                        <span className="text-amber-500 font-medium">Personal Goals</span>
                      </div>
                      <p className="text-sm text-gray-300">Your specific objectives and desires for transformation</p>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-amber-500/30">
                      <div className="flex items-center mb-2">
                        <Brain className="w-5 h-5 text-amber-500 mr-2" />
                        <span className="text-amber-500 font-medium">Limiting Beliefs</span>
                      </div>
                      <p className="text-sm text-gray-300">Subconscious blocks that are holding you back</p>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-amber-500/30">
                      <div className="flex items-center mb-2">
                        <Headphones className="w-5 h-5 text-amber-500 mr-2" />
                        <span className="text-amber-500 font-medium">Voice Preferences</span>
                      </div>
                      <p className="text-sm text-gray-300">Your preferred meditation style and voice type</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-0.5 bg-gradient-to-r from-amber-500/20 via-purple-500/40 to-indigo-500/20 my-8"></div>

                {/* Output Section */}
                <div className="mb-8">
                  <h4 className="text-indigo-500 font-medium text-center mb-4">What You Receive</h4>
                  <div className="space-y-4">
                    <div className="bg-[#151515] p-4 rounded-lg border border-indigo-500/30">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
                        <span className="text-indigo-500 font-medium">Abundance Meditation</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Personalized audio frequencies to manifest wealth and abundance
                      </p>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-indigo-500/30">
                      <div className="flex items-center mb-2">
                        <Brain className="w-5 h-5 text-indigo-500 mr-2" />
                        <span className="text-indigo-500 font-medium">Confidence Booster</span>
                      </div>
                      <p className="text-sm text-gray-300">Guided visualizations to build unshakable self-belief</p>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-indigo-500/30">
                      <div className="flex items-center mb-2">
                        <Moon className="w-5 h-5 text-indigo-500 mr-2" />
                        <span className="text-indigo-500 font-medium">Subconscious Rewiring</span>
                      </div>
                      <p className="text-sm text-gray-300">Deep mental reprogramming while you sleep</p>
                    </div>
                  </div>
                </div>

                {/* Process Steps */}
                <div className="mt-8">
                  <h4 className="text-purple-400 font-medium text-center mb-4">The Process</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#151515] p-4 rounded-lg border border-purple-500/20">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                          <span className="text-purple-400 font-bold">1</span>
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">Complete Form</h4>
                          <p className="text-xs text-gray-400">Share your goals and preferences</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-purple-500/20">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                          <span className="text-purple-400 font-bold">2</span>
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">AI Processing</h4>
                          <p className="text-xs text-gray-400">We create your custom package</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#151515] p-4 rounded-lg border border-purple-500/20">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                          <span className="text-purple-400 font-bold">3</span>
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">Transform</h4>
                          <p className="text-xs text-gray-400">Listen daily for 4 weeks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emma T Review and Audio Demo */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="bg-[#151515] p-6 md:p-8 rounded-xl shadow-xl border border-purple-500/20 mb-16 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-500/30 mb-4 md:mb-0">
                  <Image
                    src="/images/emma-t.png"
                    alt="Emma T."
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-white font-medium mb-2 text-xl">Emma T., Confidence Meditation User</div>
                  <p className="text-gray-300 mb-4">
                    "I've tried many meditation apps before, but nothing compares to the personalized experience from
                    ManifestVault. After just 3 weeks of using my custom confidence meditation, I finally had the
                    courage to ask for a promotion at work—and I got it! The way they incorporate your specific goals
                    and challenges makes all the difference."
                  </p>

                  <div className="mt-4">
                    <p className="text-sm text-purple-400 mb-2">Listen to a sample of Emma's confidence meditation:</p>
                    <AudioPlayer
                      src="https://axfoyptgkqbhrysntiif.supabase.co/storage/v1/object/public/meditations-samples//emma-meditation.mp3"
                      className="max-w-full md:max-w-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meditation Types Section */}
        <section className="py-16 bg-[#0c0c14]">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                Our Meditation Programs
              </h2>
              <p className="text-lg text-gray-300 text-center mb-12 max-w-3xl mx-auto">
                Choose from our specialized meditation programs designed to transform different areas of your life
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Abundance Meditation */}
                <div className="bg-[#151515] rounded-xl overflow-hidden border border-amber-500/20 shadow-xl transition-transform hover:scale-[1.02]">
                  <div className="h-48 relative">
                    <Image src="/images/brain-science.png" alt="Abundance Meditation" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-amber-500">Abundance Meditation</h3>
                    <p className="text-gray-300 mb-4">
                      Reprogram your subconscious mind to attract wealth, success, and opportunities into your life.
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                      <span>15-20 minutes daily</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Booster */}
                <div className="bg-[#151515] rounded-xl overflow-hidden border border-purple-500/20 shadow-xl transition-transform hover:scale-[1.02]">
                  <div className="h-48 relative">
                    <Image
                      src="/images/confidence-meditation.jpg"
                      alt="Confidence Meditation"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-purple-500">Confidence Booster</h3>
                    <p className="text-gray-300 mb-4">
                      Build unshakable self-belief and overcome imposter syndrome with guided visualizations.
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Brain className="w-4 h-4 mr-2 text-purple-500" />
                      <span>10-15 minutes daily</span>
                    </div>
                  </div>
                </div>

                {/* Deep Sleep Rewiring */}
                <div className="bg-[#151515] rounded-xl overflow-hidden border border-indigo-500/20 shadow-xl transition-transform hover:scale-[1.02]">
                  <div className="h-48 relative">
                    <Image src="/images/brain-rewired.webp" alt="Sleep Meditation" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-indigo-500">Deep Sleep Rewiring</h3>
                    <p className="text-gray-300 mb-4">
                      Transform your subconscious mind while you sleep with powerful affirmations and binaural beats.
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Moon className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>30-45 minutes before sleep</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <MeditationFormDialog>
                  <RebelButton>Create My Custom Meditation</RebelButton>
                </MeditationFormDialog>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                Unlock Your Full Potential
              </h2>
              <p className="text-lg text-gray-300">
                Invest in yourself and experience the life-changing benefits of personalized meditation.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="max-w-md mx-auto bg-[#151515] rounded-xl shadow-xl border border-purple-500/20">
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-white">Lifetime Access</h3>
                <p className="text-gray-400 mb-6">
                  Get unlimited access to your personalized meditation package, including all future updates and
                  improvements.
                </p>

                <div className="flex items-center justify-center mb-8">
                  <span className="text-5xl font-bold text-primary">$29</span>
                  <span className="text-gray-400 ml-2">one-time payment</span>
                </div>

                <MeditationFormDialog>
                  <RebelButton className="w-full text-lg">Open your Vault</RebelButton>
                </MeditationFormDialog>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-800/30">
          <div className="container mx-auto px-4 max-w-full md:max-w-[90%] lg:max-w-[1200px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="mb-4 md:mb-0">
                <h3 className="text-amber-500 font-bold text-xl mb-2">ManifestVault</h3>
                <p className="text-gray-400 text-sm max-w-md">
                  Personalized meditations to transform your subconscious mind and manifest the life you desire.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-end">
                <div className="flex space-x-4 mb-4">
                  <a
                    href="https://www.instagram.com/manifest.vault/?utm_source=ig_web_button_share_sheet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-purple-400 transition-colorsnoreferrer"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@manifest.vault"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    <TikTokIcon className="w-6 h-6" />
                  </a>
                </div>
                <ContactDialog />
              </div>
            </div>

            <div className="text-center border-t border-gray-800/30 pt-6">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} ManifestVault. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                <Link href="/terms" className="hover:text-gray-400">
                  Terms of Service
                </Link>{" "}
                |{" "}
                <Link href="/privacy" className="hover:text-gray-400">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
