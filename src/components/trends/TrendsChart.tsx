
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AnalysisData, KeyMetrics, ChartDataPoint } from '@/types/trends';

interface TrendsChartProps {
  analysis: AnalysisData | null;
}

const TrendsChart = ({ analysis }: TrendsChartProps) => {
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

  const prepareChartData = (): ChartDataPoint[] => {
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

  if (!analysis?.key_metrics) {
    return null;
  }

  return (
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
  );
};

export default TrendsChart;
