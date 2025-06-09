-- Create a table for meditation form submissions
CREATE TABLE IF NOT EXISTS meditation_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  limiting_beliefs TEXT,
  conscious_struggles TEXT,
  specific_objective TEXT,
  meditation_purpose TEXT,
  meditation_style TEXT,
  voice_gender TEXT,
  voice_tonality TEXT,
  custom_voice_url TEXT,
  dream_life_visualization TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for the meditation_submissions table
ALTER TABLE meditation_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows inserting data
CREATE POLICY "Allow anonymous inserts to meditation_submissions"
  ON meditation_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a policy that allows users to view only their own submissions
CREATE POLICY "Users can view their own submissions"
  ON meditation_submissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND email = auth.email());

-- Create a storage bucket for voice samples
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-samples', 'voice-samples', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow anonymous uploads to voice-samples"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'voice-samples');

CREATE POLICY "Allow public access to voice-samples"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'voice-samples');
