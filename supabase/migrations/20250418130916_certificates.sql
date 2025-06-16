-- Create certificates table
CREATE TABLE certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    certificate_url TEXT,
    is_master BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, location_id)
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own certificates"
    ON certificates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates"
    ON certificates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to generate certificate
CREATE OR REPLACE FUNCTION generate_certificate(
    p_user_id UUID,
    p_location_id UUID,
    p_points_earned INTEGER
)
RETURNS certificates
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_certificate certificates;
    v_user_email TEXT;
    v_location_name TEXT;
    v_certificate_url TEXT;
    v_is_master BOOLEAN;
BEGIN
    -- Get user email
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = p_user_id;

    -- Check if this is a master certificate
    v_is_master := p_location_id IS NULL;

    if v_is_master then
        -- For master certificate, get total points and create a special name
        v_location_name := 'Master Certificate';
    else
        -- For location certificate, get location name
        SELECT name INTO v_location_name
        FROM locations
        WHERE id = p_location_id;
    end if;

    -- Generate a unique certificate URL
    -- In a real implementation, this would generate an actual certificate
    v_certificate_url := 'https://koloklc.com/certificates/' || gen_random_uuid()::text;

    -- Insert the certificate
    INSERT INTO certificates (
        user_id,
        location_id,
        points_earned,
        certificate_url,
        is_master
    )
    VALUES (
        p_user_id,
        p_location_id,
        p_points_earned,
        v_certificate_url,
        v_is_master
    )
    RETURNING * INTO v_certificate;

    -- TODO: Send email notification
    -- This would be implemented with your email service
    -- For now, we'll just log it
    RAISE NOTICE 'Certificate generated for user % at location % with % points',
        v_user_email,
        v_location_name,
        p_points_earned;

    RETURN v_certificate;
END;
$$; 