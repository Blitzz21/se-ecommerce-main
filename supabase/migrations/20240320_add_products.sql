-- Insert products that were using dynamic UUIDs
INSERT INTO products (id, name, description, price, stock, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 'AMD Radeon RX 7600', 'Smart choice for 1080p gaming.', 269.99, 30, NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'NVIDIA RTX 6000 Ada Generation', 'Ultimate professional visualization powerhouse.', 6800.99, 3, NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'NVIDIA RTX 5000 Ada Generation', 'Professional visualization and rendering solution.', 4200.99, 6, NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'AMD Radeon PRO W7900X', 'Professional graphics solution for demanding workflows.', 3999.99, 4, NOW()),
  ('550e8400-e29b-41d4-a716-446655440009', 'NVIDIA CMP 170HX', 'Dedicated cryptocurrency mining processor.', 2299.99, 20, NOW()),
  ('550e8400-e29b-41d4-a716-446655440010', 'NVIDIA CMP 50HX', 'Efficient mining solution for smaller operations.', 999.99, 15, NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'NVIDIA A100 80GB', 'Ultimate performance for AI training and inference.', 10999.99, 2, NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'NVIDIA H100 PCIe', 'Next-generation AI compute platform.', 16999.99, 1, NOW()),
  ('550e8400-e29b-41d4-a716-446655440013', 'AMD Instinct MI250X', 'High-performance compute accelerator for AI and HPC.', 12499.99, 3, NOW()),
  ('550e8400-e29b-41d4-a716-446655440014', 'Intel Arc A770', 'Intel''s flagship gaming GPU with ray tracing support.', 349.99, 25, NOW())
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock; 