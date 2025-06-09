import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Add debugging
console.log("Admin client initialization - URL available:", !!supabaseUrl)
console.log("Admin client initialization - Service role key available:", !!supabaseServiceRoleKey)

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables for admin client")
}

// Create admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

// Test the connection without using aggregate functions
;(async () => {
  try {
    // Just fetch a single row to test the connection
    const { data, error } = await supabaseAdmin.from("meditation_submissions").select("id").limit(1)

    if (error) {
      console.error("Supabase admin client test failed:", error)
    } else {
      console.log("Supabase admin client test successful. Connection verified.")
    }
  } catch (err) {
    console.error("Error testing Supabase admin client:", err)
  }
})()
