
-- Create a table for doctor profiles
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  profile_picture_url TEXT,
  specialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own doctor
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own doctor
CREATE POLICY "Users can view their own doctor" 
  ON public.doctors 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own doctor
CREATE POLICY "Users can create their own doctor" 
  ON public.doctors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own doctor
CREATE POLICY "Users can update their own doctor" 
  ON public.doctors 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own doctor
CREATE POLICY "Users can delete their own doctor" 
  ON public.doctors 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create doctor_chats table for direct messaging with doctors
CREATE TABLE public.doctor_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to doctor chats
ALTER TABLE public.doctor_chats ENABLE ROW LEVEL SECURITY;

-- Create policy for doctor chats
CREATE POLICY "Users can view their own doctor chats" 
  ON public.doctor_chats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own doctor chats" 
  ON public.doctor_chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at column for doctors table
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
