-- Add context and custom date fields to bits table
ALTER TABLE public.bits 
ADD COLUMN context TEXT,
ADD COLUMN bit_date DATE NOT NULL DEFAULT CURRENT_DATE;