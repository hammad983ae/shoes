-- Add type column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'contacting';

-- Add check constraint for type values
ALTER TABLE public.messages 
ADD CONSTRAINT messages_type_check 
CHECK (type IN ('contacting', 'request'));