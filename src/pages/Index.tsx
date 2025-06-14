
import React from 'react';
import Navigation from '@/components/Navigation';
import StreakCounter from '@/components/StreakCounter';
import SymptomForm from '@/components/SymptomForm';
import DailyCheckIn from '@/components/DailyCheckIn';
import MedicationReminder from '@/components/MedicationReminder';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  
  console.log('Index page rendering, user:', user);

  return (
    <div className="min-h-screen health-gradient pb-20">
      <div className="w-full px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-health-primary mb-2">
            HealthHuddle
          </h1>
          <p className="text-health-muted">
            Your personal health companion
          </p>
          {user && (
            <p className="text-sm text-health-secondary mt-2">
              Welcome back, {user.email}
            </p>
          )}
        </div>

        {/* Top Section - Streak and Daily Check-in */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20 h-32 flex items-center justify-center">
              <StreakCounter />
            </div>
            <div className="h-32">
              <DailyCheckIn />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto space-y-6">
          <SymptomForm />
          <MedicationReminder />
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Index;
