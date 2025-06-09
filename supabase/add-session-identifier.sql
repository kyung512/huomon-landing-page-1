-- Add session_identifier column to meditation_submissions table
ALTER TABLE meditation_submissions 
ADD COLUMN IF NOT EXISTS session_identifier TEXT UNIQUE;

-- Create an index on session_identifier for faster lookups
CREATE INDEX IF NOT EXISTS idx_meditation_submissions_session_identifier ON meditation_submissions(session_identifier);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_meditation_submissions_created_at ON meditation_submissions(created_at);
