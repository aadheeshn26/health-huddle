
-- Create reports table for storing generated reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_email TEXT NOT NULL,
  time_range INTEGER NOT NULL, -- days (7, 30, etc.)
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' -- pending, completed, failed
);

-- Create trends_analysis table for caching analysis results
CREATE TABLE public.trends_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_period INTEGER NOT NULL DEFAULT 30, -- days
  claude_patterns JSONB,
  vision_insights JSONB,
  gpt_summary TEXT,
  key_metrics JSONB, -- for chart data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies for reports
CREATE POLICY "Users can view their own reports" 
  ON public.reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
  ON public.reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
  ON public.reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for trends_analysis
CREATE POLICY "Users can view their own trends analysis" 
  ON public.trends_analysis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trends analysis" 
  ON public.trends_analysis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trends analysis" 
  ON public.trends_analysis 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updating updated_at
CREATE TRIGGER update_trends_analysis_updated_at
  BEFORE UPDATE ON public.trends_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
