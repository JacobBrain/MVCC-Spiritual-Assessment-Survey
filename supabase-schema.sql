-- Spiritual Gifts Assessment Database Schema
-- Run this in your Supabase SQL Editor

-- Assessments table (main record for each submission)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Calculated gift scores (each ranges 4-20, or 0 if not answered)
  administration_score INTEGER DEFAULT 0,
  evangelism_score INTEGER DEFAULT 0,
  exhortation_score INTEGER DEFAULT 0,
  giving_score INTEGER DEFAULT 0,
  hospitality_score INTEGER DEFAULT 0,
  leadership_score INTEGER DEFAULT 0,
  mercy_score INTEGER DEFAULT 0,
  pastoring_score INTEGER DEFAULT 0,
  serving_score INTEGER DEFAULT 0,
  teaching_score INTEGER DEFAULT 0,
  wisdom_score INTEGER DEFAULT 0,

  -- Top 3 gifts (computed and stored for easy querying)
  top_gift_1 TEXT,
  top_gift_2 TEXT,
  top_gift_3 TEXT
);

-- Responses table (one row per question answered)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_value INTEGER NOT NULL CHECK (answer_value >= 1 AND answer_value <= 5),
  gift_category TEXT NOT NULL
);

-- Team interests table (selected checkboxes)
CREATE TABLE team_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL
);

-- Passions table (selected checkboxes)
CREATE TABLE passions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  passion_name TEXT NOT NULL
);

-- Skills table (selected checkboxes)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL
);

-- Recommendations table (generated results)
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_description TEXT,
  team_link TEXT,
  is_gift_based BOOLEAN DEFAULT TRUE,
  gift_match TEXT,
  priority INTEGER DEFAULT 1
);

-- Create indexes for common queries
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_email ON assessments(email);
CREATE INDEX idx_assessments_top_gift_1 ON assessments(top_gift_1);
CREATE INDEX idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX idx_team_interests_assessment_id ON team_interests(assessment_id);
CREATE INDEX idx_passions_assessment_id ON passions(assessment_id);
CREATE INDEX idx_skills_assessment_id ON skills(assessment_id);
CREATE INDEX idx_recommendations_assessment_id ON recommendations(assessment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE passions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- For V1, allow all operations with service role key
-- In V2, add proper policies for admin authentication
CREATE POLICY "Allow all for service role" ON assessments FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON responses FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON team_interests FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON passions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON skills FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON recommendations FOR ALL USING (true);
