-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Public Read Access',
  '{"version":"1","statement":[{"effect":"allow","principal":"*","action":"s3:GetObject","resource":"product-images/*"}]}',
  'product-images'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Create policy for authenticated users to upload/delete
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Authenticated Upload Access',
  '{"version":"1","statement":[{"effect":"allow","principal":{"authenticated":true},"action":["s3:PutObject","s3:DeleteObject"],"resource":"product-images/*"}]}',
  'product-images'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Enable storage RLS
UPDATE storage.buckets
SET owner = NULL,
    public = true,
    avif_autodetection = false,
    file_size_limit = 5242880,  -- 5MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'product-images'; 