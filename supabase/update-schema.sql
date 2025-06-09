-- Add payment_status and payment_id columns to meditation_submissions table
ALTER TABLE meditation_submissions 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_meditation_submissions_email ON meditation_submissions(email);
