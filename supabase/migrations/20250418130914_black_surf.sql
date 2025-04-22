/*
  # Create locations table

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the landmark
      - `city` (text) - City where the landmark is located
      - `country` (text) - Country where the landmark is located
      - `description` (text) - Detailed description of the landmark
      - `image_url` (text) - URL of the landmark image
      - `facts` (text[]) - Array of historical facts
      - `model_url` (text) - URL of the 3D model for AR view
      - `created_at` (timestamptz) - Creation timestamp
      - `featured` (boolean) - Whether the location is featured
      - `latitude` (float8) - Geographic latitude
      - `longitude` (float8) - Geographic longitude

  2. Security
    - Enable RLS on `locations` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  facts text[] NOT NULL DEFAULT '{}',
  model_url text,
  created_at timestamptz DEFAULT now(),
  featured boolean DEFAULT false,
  latitude float8,
  longitude float8
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON locations
  FOR SELECT
  TO public
  USING (true);