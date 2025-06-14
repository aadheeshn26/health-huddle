
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AnalysisData, KeyMetrics, MetricsStats } from '@/types/trends';

export const useTrendsAnalysis = (userId: string | undefined, period: number) => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalysis = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // First check if we have cached analysis
      const { data: cached } = await supabase
        .from('trends_analysis')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_period', period)
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Cache for 24 hours
        .maybeSingle();

      if (cached) {
        setAnalysis(cached);
        setLoading(false);
        return;
      }

      // Generate new analysis
      const response = await supabase.functions.invoke('analyze-trends', {
        body: { userId, period }
      });

      if (response.error) throw response.error;

      setAnalysis(response.data);
      toast({
        title: "Analysis Complete",
        description: "Your health trends have been analyzed successfully.",
      });

    } catch (error) {
      console.error('Error loading analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load trends analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getKeyMetricsStats = (): MetricsStats => {
    if (!analysis?.key_metrics) return { activeDays: 0, totalEntries: 0, glucoseReadings: 0 };
    
    const keyMetrics = analysis.key_metrics as KeyMetrics;
    const activeDays = keyMetrics.dailyEntries ? Object.keys(keyMetrics.dailyEntries).length : 0;
    const totalEntries = keyMetrics.dailyEntries ? Object.values(keyMetrics.dailyEntries).reduce((a: number, b: number) => a + b, 0) : 0;
    const glucoseReadings = keyMetrics.glucoseReadings?.length || 0;
    
    return { activeDays, totalEntries, glucoseReadings };
  };

  useEffect(() => {
    if (userId) {
      loadAnalysis();
    }
  }, [userId, period]);

  return {
    analysis,
    loading,
    loadAnalysis,
    getKeyMetricsStats
  };
};
