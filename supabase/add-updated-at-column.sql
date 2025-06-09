-- Add updated_at column to meditation_submissions table
ALTER TABLE meditation_submissions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_meditation_submissions_updated_at ON meditation_submissions;
CREATE TRIGGER update_meditation_submissions_updated_at
    BEFORE UPDATE ON meditation_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to have an updated_at value
UPDATE meditation_submissions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'meditation_submissions' 
AND column_name = 'updated_at';
