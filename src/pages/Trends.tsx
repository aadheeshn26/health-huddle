
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Activity, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

interface KeyMetrics {
  dailyEntries?: Record<string, number>;
  glucoseReadings?: Array<{ date: string; value: number }>;
}

interface AnalysisData {
  id?: string;
  user_id?: string;
  analysis_period?: number;
  claude_patterns?: any;
  vision_insights?: any;
  gpt_summary?: string;
  key_metrics?: any;
  created_at?: string;
  updated_at?: string;
}

const Trends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (user) {
      loadAnalysis();
    }
  }, [user, period]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      // First check if we have cached analysis
      const { data: cached } = await supabase
        .from('trends_analysis')
        .select('*')
        .eq('user_id', user?.id)
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
        body: { userId: user?.id, period }
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

  const chartConfig = {
    glucose: {
      label: "Glucose (mg/dL)",
      color: "#3b82f6",
    },
    entries: {
      label: "Daily Entries",
      color: "#10b981",
    },
  };

  const prepareChartData = () => {
    if (!analysis?.key_metrics) return [];

    const keyMetrics = analysis.key_metrics as KeyMetrics;
    const { dailyEntries, glucoseReadings } = keyMetrics;
    
    if (!dailyEntries) return [];
    
    const dates = Object.keys(dailyEntries).sort();

    return dates.map(date => ({
      date: new Date(date).toLocaleDateString(),
      entries: dailyEntries[date] || 0,
      glucose: glucoseReadings?.find((g) => g.date === date)?.value || null
    }));
  };

  const getKeyMetricsStats = () => {
    if (!analysis?.key_metrics) return { activeDays: 0, totalEntries: 0, glucoseReadings: 0 };
    
    const keyMetrics = analysis.key_metrics as KeyMetrics;
    const activeDays = keyMetrics.dailyEntries ? Object.keys(keyMetrics.dailyEntries).length : 0;
    const totalEntries = keyMetrics.dailyEntries ? Object.values(keyMetrics.dailyEntries).reduce((a: number, b: number) => a + b, 0) : 0;
    const glucoseReadings = keyMetrics.glucoseReadings?.length || 0;
    
    return { activeDays, totalEntries, glucoseReadings };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400">Please log in to view trends.</div>
      </div>
    );
  }

  const { activeDays, totalEntries, glucoseReadings } = getKeyMetricsStats();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="w-full px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">
            Health Trends
          </h1>
          <p className="text-gray-400">
            Monthly analysis of your health patterns
          </p>
        </div>

        {/* Period Selection */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-900 rounded-lg p-1">
            {[7, 14, 30].map((days) => (
              <Button
                key={days}
                variant={period === days ? "default" : "ghost"}
                className={`px-4 py-2 ${
                  period === days 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setPeriod(days)}
              >
                {days} Days
              </Button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="text-blue-400" size={20} />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {activeDays}
                  </div>
                  <div className="text-sm text-gray-400">Active Days</div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <Activity className="text-green-400" size={20} />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {totalEntries}
                  </div>
                  <div className="text-sm text-gray-400">Total Entries</div>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-purple-400" size={20} />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {glucoseReadings}
                  </div>
                  <div className="text-sm text-gray-400">Glucose Readings</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart */}
          {analysis?.key_metrics && (
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Activity & Glucose Trends</h3>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData()}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="entries" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Daily Entries"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="glucose" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Glucose (mg/dL)"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          )}

          {/* AI Analysis */}
          {analysis?.gpt_summary && (
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="text-blue-400 mr-2" size={20} />
                Health Summary & Recommendations
              </h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {analysis.gpt_summary}
              </div>
            </Card>
          )}

          {/* Patterns */}
          {analysis?.claude_patterns && (
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Identified Patterns</h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {typeof analysis.claude_patterns === 'string' 
                  ? analysis.claude_patterns 
                  : JSON.stringify(analysis.claude_patterns, null, 2)
                }
              </div>
            </Card>
          )}

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button
              onClick={loadAnalysis}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Trends;
