
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Activity, TrendingUp } from 'lucide-react';
import { MetricsStats } from '@/types/trends';

interface MetricsCardsProps {
  stats: MetricsStats;
}

const MetricsCards = ({ stats }: MetricsCardsProps) => {
  const { activeDays, totalEntries, glucoseReadings } = stats;

  return (
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
  );
};

export default MetricsCards;
