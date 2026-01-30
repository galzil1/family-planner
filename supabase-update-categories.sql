-- Update categories for existing family
-- First, delete all existing categories for your family
DELETE FROM categories;

-- Then insert the new categories
-- (They will be created for all families when users access their dashboard)

-- If you want to insert for a specific family, find your family_id first:
-- SELECT id FROM families;

-- Then run this (replace YOUR_FAMILY_ID with your actual family ID):
-- INSERT INTO categories (family_id, name, color, icon) VALUES
--   ('YOUR_FAMILY_ID', 'ילדים', '#8B5CF6', '👶'),
--   ('YOUR_FAMILY_ID', 'ספורט', '#10B981', '⚽'),
--   ('YOUR_FAMILY_ID', 'מטלות בית', '#F59E0B', '🏠'),
--   ('YOUR_FAMILY_ID', 'אחר', '#6B7280', '📌');

-- OR if you only have one family, use this simpler version:
INSERT INTO categories (family_id, name, color, icon)
SELECT id, 'ילדים', '#8B5CF6', '👶' FROM families
UNION ALL
SELECT id, 'ספורט', '#10B981', '⚽' FROM families
UNION ALL
SELECT id, 'מטלות בית', '#F59E0B', '🏠' FROM families
UNION ALL
SELECT id, 'אחר', '#6B7280', '📌' FROM families;
