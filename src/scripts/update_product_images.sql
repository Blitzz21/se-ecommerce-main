-- SQL script to update product images in the database to use local assets
-- This script maps product names to their corresponding image files in the src/assets/gpu directory

-- Update NVIDIA products
UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-4090.png' 
WHERE "name" LIKE '%RTX 4090%' OR "model" LIKE '%RTX 4090%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-4080-super.png' 
WHERE "name" LIKE '%RTX 4080 SUPER%' OR "model" LIKE '%RTX 4080 SUPER%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-4080.png' 
WHERE "name" LIKE '%RTX 4080%' OR "model" LIKE '%RTX 4080%' AND "name" NOT LIKE '%SUPER%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-4070-ti.png' 
WHERE "name" LIKE '%RTX 4070%' OR "model" LIKE '%RTX 4070%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-6000-ada.png' 
WHERE ("name" LIKE '%RTX 6000%' OR "model" LIKE '%RTX 6000%') AND ("name" LIKE '%Ada%' OR "model" LIKE '%Ada%');

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-6000.png' 
WHERE "name" LIKE '%RTX 6000%' OR "model" LIKE '%RTX 6000%' AND "name" NOT LIKE '%Ada%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-5000.png' 
WHERE "name" LIKE '%RTX 5000%' OR "model" LIKE '%RTX 5000%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/a100.png' 
WHERE "name" LIKE '%A100%' OR "model" LIKE '%A100%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/h100.png' 
WHERE "name" LIKE '%H100%' OR "model" LIKE '%H100%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/cmp-170hx.png' 
WHERE "name" LIKE '%CMP 170HX%' OR "model" LIKE '%CMP 170HX%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/cmp-50hx.png' 
WHERE "name" LIKE '%CMP 50HX%' OR "model" LIKE '%CMP 50HX%';

-- Update AMD products
UPDATE "public"."products" 
SET "image" = '../assets/gpu/rx-7900-xtx.png' 
WHERE "name" LIKE '%RX 7900 XTX%' OR "model" LIKE '%RX 7900 XTX%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rx-7800-xt.png' 
WHERE "name" LIKE '%RX 7800 XT%' OR "model" LIKE '%RX 7800 XT%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rx-7600.png' 
WHERE "name" LIKE '%RX 7600%' OR "model" LIKE '%RX 7600%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/radeon-pro-w7900.png' 
WHERE "name" LIKE '%Radeon PRO W7900%' OR "model" LIKE '%Radeon PRO W7900%' AND "name" NOT LIKE '%X%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/w7900x.png' 
WHERE "name" LIKE '%W7900X%' OR "model" LIKE '%W7900X%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/mi250x.png' 
WHERE "name" LIKE '%MI250X%' OR "model" LIKE '%MI250X%';

-- Update Intel products
UPDATE "public"."products" 
SET "image" = '../assets/gpu/arc-a770.png' 
WHERE "name" LIKE '%Arc A770%' OR "model" LIKE '%Arc A770%' AND "name" NOT LIKE '%Limited Edition%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/intel-arc-a770.png' 
WHERE "name" LIKE '%Arc A770%' AND "name" LIKE '%Limited Edition%';

-- Update any remaining products by brand as a fallback
UPDATE "public"."products" 
SET "image" = '../assets/gpu/rtx-4090.png' 
WHERE "brand" = 'NVIDIA' AND "image" NOT LIKE '../assets/gpu/%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/rx-7900-xtx.png' 
WHERE "brand" = 'AMD' AND "image" NOT LIKE '../assets/gpu/%';

UPDATE "public"."products" 
SET "image" = '../assets/gpu/arc-a770.png' 
WHERE "brand" = 'Intel' AND "image" NOT LIKE '../assets/gpu/%'; 