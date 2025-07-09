-- Create location_recommendations table for managing next location suggestions
CREATE TABLE IF NOT EXISTS location_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  recommended_location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  priority integer DEFAULT 1, -- Higher number = higher priority
  reason text, -- Reason for recommendation (e.g., "Historical connection", "Popular next stop")
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true,
  UNIQUE(source_location_id, recommended_location_id)
);

-- Enable RLS
ALTER TABLE location_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to active recommendations"
  ON location_recommendations
  FOR SELECT
  TO public
  USING (active = true);

-- Insert some sample recommendations (you can modify these based on your actual locations)
-- Example: After visiting location A, recommend location B with high priority
-- INSERT INTO location_recommendations (source_location_id, recommended_location_id, priority, reason)
-- VALUES 
--   ('location-a-uuid', 'location-b-uuid', 3, 'Historical connection - both were important trading posts'),
--   ('location-a-uuid', 'location-c-uuid', 2, 'Popular next stop for visitors'),
--   ('location-b-uuid', 'location-d-uuid', 3, 'Cultural significance connection'),
--   ('location-c-uuid', 'location-e-uuid', 2, 'Geographic proximity and shared history');

-- Create function to get recommended locations for a source location
CREATE OR REPLACE FUNCTION get_recommended_locations(p_source_location_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  country text,
  description text,
  image_url text,
  facts text[],
  model_url text,
  created_at timestamptz,
  featured boolean,
  latitude float8,
  longitude float8,
  priority integer,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.city,
    l.country,
    l.description,
    l.image_url,
    l.facts,
    l.model_url,
    l.created_at,
    l.featured,
    l.latitude,
    l.longitude,
    lr.priority,
    lr.reason
  FROM location_recommendations lr
  JOIN locations l ON lr.recommended_location_id = l.id
  WHERE lr.source_location_id = p_source_location_id
    AND lr.active = true
  ORDER BY lr.priority DESC, l.featured DESC, l.created_at DESC
  LIMIT 3;
END;
$$; 