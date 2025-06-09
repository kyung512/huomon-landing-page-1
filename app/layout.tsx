import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

// Add these meta tags to expose the Supabase URL and anon key to the client
export const metadata: Metadata = {
  title: "ManifestVault - Personalized Meditations",
  description: "Transform your subconscious mind and manifest the life you desire with personalized meditations.",
  icons: {
    icon: "/manifestvault-favicon.png",
    apple: "/manifestvault-favicon.png",
  },
    generator: 'v0.dev'
}

// Add these environment variables for client-side access
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
