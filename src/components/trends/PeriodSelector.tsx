
import React from 'react';
import { Button } from '@/components/ui/button';

interface PeriodSelectorProps {
  period: number;
  onPeriodChange: (period: number) => void;
}

const PeriodSelector = ({ period, onPeriodChange }: PeriodSelectorProps) => {
  return (
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
            onClick={() => onPeriodChange(days)}
          >
            {days} Days
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;
