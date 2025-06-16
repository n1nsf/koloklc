-- Create email templates table
create table if not exists public.email_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  subject text not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert master certificate email template
insert into public.email_templates (name, subject, body)
values 
  (
    'master_certificate',
    'Your Kolok Learning City Master Certificate',
    'Dear {{user_name}},

Congratulations on completing all missions across all locations! You have earned a total of {{points}} points.

You can view and download your master certificate here: {{certificate_url}}

Thank you for being an active explorer in Kolok Learning City!

Best regards,
The Kolok Team'
  );

-- Create function to send email
create or replace function public.send_certificate_email(
  p_user_id uuid,
  p_certificate_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_email text;
  v_user_name text;
  v_points integer;
  v_certificate_url text;
  v_subject text;
  v_body text;
begin
  -- Get certificate details
  select 
    points_earned,
    certificate_url
  into 
    v_points,
    v_certificate_url
  from public.certificates
  where id = p_certificate_id;

  -- Get user details
  select 
    email,
    raw_user_meta_data->>'full_name'
  into 
    v_user_email,
    v_user_name
  from auth.users
  where id = p_user_id;

  -- Get email template
  select 
    subject,
    body
  into 
    v_subject,
    v_body
  from public.email_templates
  where name = 'master_certificate';

  -- Replace template variables
  v_subject := replace(v_subject, '{{user_name}}', coalesce(v_user_name, 'Explorer'));
  v_subject := replace(v_subject, '{{points}}', v_points::text);
  v_subject := replace(v_subject, '{{certificate_url}}', v_certificate_url);

  v_body := replace(v_body, '{{user_name}}', coalesce(v_user_name, 'Explorer'));
  v_body := replace(v_body, '{{points}}', v_points::text);
  v_body := replace(v_body, '{{certificate_url}}', v_certificate_url);

  -- Send email using Supabase Edge Function
  perform
    net.http_post(
      url := current_setting('app.settings.email_service_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.email_service_key')
      ),
      body := jsonb_build_object(
        'to', v_user_email,
        'subject', v_subject,
        'html', v_body
      )
    );
end;
$$;

-- Update generate_certificate function to only handle master certificates
create or replace function public.generate_certificate(
  p_user_id uuid,
  p_points_earned integer
)
returns public.certificates
language plpgsql
security definer
as $$
declare
  v_certificate public.certificates;
  v_user_email text;
  v_certificate_url text;
begin
  -- Get user email
  select email into v_user_email
  from auth.users
  where id = p_user_id;

  -- Generate a unique certificate URL
  -- In a real implementation, this would generate an actual certificate
  v_certificate_url := 'https://koloklc.com/certificates/' || gen_random_uuid();

  -- Insert the certificate
  insert into public.certificates (
    user_id,
    location_id,
    points_earned,
    certificate_url,
    is_master
  )
  values (
    p_user_id,
    null,
    p_points_earned,
    v_certificate_url,
    true
  )
  returning * into v_certificate;

  -- Send email notification
  perform public.send_certificate_email(p_user_id, v_certificate.id);

  return v_certificate;
end;
$$; 