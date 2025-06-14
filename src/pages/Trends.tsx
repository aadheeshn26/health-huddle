
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import TrendsHeader from '@/components/trends/TrendsHeader';
import PeriodSelector from '@/components/trends/PeriodSelector';
import MetricsCards from '@/components/trends/MetricsCards';
import TrendsChart from '@/components/trends/TrendsChart';
import AnalysisCards from '@/components/trends/AnalysisCards';
import { useTrendsAnalysis } from '@/hooks/useTrendsAnalysis';

const Trends = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState(30);
  
  const {
    analysis,
    loading,
    loadAnalysis,
    getKeyMetricsStats
  } = useTrendsAnalysis(user?.id, period);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400">Please log in to view trends.</div>
      </div>
    );
  }

  const stats = getKeyMetricsStats();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="w-full px-4 pt-8">
        <TrendsHeader />
        <PeriodSelector period={period} onPeriodChange={setPeriod} />

        <div className="max-w-6xl mx-auto space-y-6">
          <MetricsCards stats={stats} />
          <TrendsChart analysis={analysis} />
          <AnalysisCards analysis={analysis} />

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
