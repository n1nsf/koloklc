-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Create check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  points_earned integer NOT NULL DEFAULT 0,
  UNIQUE(user_id, location_id, mission_id)
);

-- Enable RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to missions"
  ON missions
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "Allow authenticated users to read their check-ins"
  ON check_ins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create check-ins"
  ON check_ins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle check-in
CREATE OR REPLACE FUNCTION handle_check_in(
  p_location_id uuid,
  p_mission_id uuid
) RETURNS check_ins
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points integer;
  v_check_in check_ins;
BEGIN
  -- Get mission points
  SELECT points INTO v_points
  FROM missions
  WHERE id = p_mission_id
  AND active = true;

  -- Insert check-in
  INSERT INTO check_ins (user_id, location_id, mission_id, points_earned)
  VALUES (auth.uid(), p_location_id, p_mission_id, v_points)
  ON CONFLICT (user_id, location_id, mission_id) DO NOTHING
  RETURNING * INTO v_check_in;

  RETURN v_check_in;
END;
$$; 