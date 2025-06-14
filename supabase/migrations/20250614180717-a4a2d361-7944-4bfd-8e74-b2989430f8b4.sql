
-- Add a daily_checkups table to track when users complete their daily check-ups
CREATE TABLE public.daily_checkups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'voice')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_daily_checkups_user_id ON public.daily_checkups(user_id);
CREATE INDEX idx_daily_checkups_completed_at ON public.daily_checkups(completed_at);

-- Enable RLS on daily_checkups
ALTER TABLE public.daily_checkups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_checkups
CREATE POLICY "Users can view their own checkups" ON public.daily_checkups
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own checkups" ON public.daily_checkups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add moderation fields to chat_messages table
ALTER TABLE public.chat_messages ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE public.chat_messages ADD COLUMN flagged_reason TEXT;
ALTER TABLE public.chat_messages ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;

-- Create a function to calculate streak based on daily checkups
CREATE OR REPLACE FUNCTION public.calculate_user_streak(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  current_check_date DATE := CURRENT_DATE;
BEGIN
  -- Check if user has completed today's checkup
  IF NOT EXISTS (
    SELECT 1 FROM public.daily_checkups 
    WHERE user_id = user_uuid 
    AND DATE(completed_at) = CURRENT_DATE
  ) THEN
    -- If no checkup today, check from yesterday
    current_check_date := yesterday;
  END IF;
  
  -- Count consecutive days backwards from current_check_date
  FOR check_date IN 
    SELECT DISTINCT DATE(completed_at) 
    FROM public.daily_checkups 
    WHERE user_id = user_uuid 
    ORDER BY DATE(completed_at) DESC
  LOOP
    -- If this date matches our expected date, increment streak
    IF check_date = current_check_date THEN
      current_streak := current_streak + 1;
      current_check_date := current_check_date - INTERVAL '1 day';
    ELSE
      -- Gap found, break the streak
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$;

-- Update streaks table when daily checkup is completed
CREATE OR REPLACE FUNCTION public.update_streak_on_checkup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_streak INTEGER;
BEGIN
  -- Calculate the new streak
  new_streak := public.calculate_user_streak(NEW.user_id);
  
  -- Update or insert the streak record
  INSERT INTO public.streaks (user_id, streak_count, last_login)
  VALUES (NEW.user_id, new_streak, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    streak_count = new_streak,
    last_login = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger to update streak when checkup is completed
CREATE TRIGGER on_daily_checkup_completed
  AFTER INSERT ON public.daily_checkups
  FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_checkup();

-- Enable realtime for chat_messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
