-- Add color column to children table with default electric blue
ALTER TABLE children ADD COLUMN color TEXT DEFAULT 'hsl(211, 100%, 50%)';