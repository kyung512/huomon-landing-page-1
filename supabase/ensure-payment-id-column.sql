-- Ensure payment_id column exists in meditation_submissions table
ALTER TABLE meditation_submissions 
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Create an index on payment_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_meditation_submissions_payment_id ON meditation_submissions(payment_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'meditation_submissions' 
AND column_name IN ('payment_id', 'payment_status', 'session_identifier');
