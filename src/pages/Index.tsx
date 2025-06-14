
import React from 'react';
import Navigation from '@/components/Navigation';
import StreakCounter from '@/components/StreakCounter';
import SymptomForm from '@/components/SymptomForm';
import DailyCheckIn from '@/components/DailyCheckIn';
import MedicationReminder from '@/components/MedicationReminder';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();

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

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Left Side - Streak and Daily Check-in */}
          <div className="lg:col-span-1 space-y-4">
            {/* Streak and Daily Check-in row */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20 aspect-square flex items-center justify-center">
                <StreakCounter />
              </div>
              <div className="aspect-square">
                <DailyCheckIn />
              </div>
            </div>
          </div>

          {/* Right Side - Symptom Form and Medication Reminder */}
          <div className="lg:col-span-3 space-y-6">
            <SymptomForm />
            <MedicationReminder />
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Index;
