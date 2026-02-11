/*
  # Food Scan System Tables

  1. New Tables
    - `food_scans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `food_name` (text)
      - `image_url` (text, optional)
      - `calories` (numeric)
      - `protein` (numeric)
      - `carbs` (numeric)
      - `fats` (numeric)
      - `fiber` (numeric)
      - `confidence_score` (numeric)
      - `health_score` (numeric)
      - `portion_size` (text)
      - `food_category` (text)
      - `meal_type` (text - morning, afternoon, evening, night)
      - `added_to_meal` (boolean, default false)
      - `ai_recommendation` (text)
      - `created_at` (timestamptz)
    
    - `scan_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_scans` (integer, default 0)
      - `avg_confidence` (numeric, default 0)
      - `most_scanned_food` (text)
      - `total_calories_scanned` (numeric, default 0)
      - `last_scan_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own scan data
    - Users can only update their own analytics
*/

-- Create food_scans table
CREATE TABLE IF NOT EXISTS food_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name text NOT NULL,
  image_url text,
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fats numeric NOT NULL DEFAULT 0,
  fiber numeric NOT NULL DEFAULT 0,
  confidence_score numeric NOT NULL DEFAULT 0,
  health_score numeric NOT NULL DEFAULT 0,
  portion_size text,
  food_category text,
  meal_type text,
  added_to_meal boolean DEFAULT false,
  ai_recommendation text,
  created_at timestamptz DEFAULT now()
);

-- Create scan_analytics table
CREATE TABLE IF NOT EXISTS scan_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_scans integer DEFAULT 0,
  avg_confidence numeric DEFAULT 0,
  most_scanned_food text,
  total_calories_scanned numeric DEFAULT 0,
  last_scan_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for food_scans
CREATE POLICY "Users can view own scans"
  ON food_scans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON food_scans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON food_scans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON food_scans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for scan_analytics
CREATE POLICY "Users can view own analytics"
  ON scan_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON scan_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON scan_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_food_scans_user_id ON food_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_food_scans_created_at ON food_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_user_id ON scan_analytics(user_id);
