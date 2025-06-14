
import Navigation from '@/components/Navigation';
import StreakCounter from '@/components/StreakCounter';
import SymptomForm from '@/components/SymptomForm';

const Index = () => {
  return (
    <div className="min-h-screen health-gradient pb-20">
      <div className="w-full px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            HealthHuddle
          </h1>
          <p className="text-gray-300">
            Your personal health companion
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Left Side - Streak and Quick Stats */}
          <div className="lg:col-span-1 space-y-4">
            <StreakCounter />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-health-darker/50 rounded-lg p-4 text-center border border-health-primary/20">
                <div className="text-2xl font-bold text-health-primary">12</div>
                <div className="text-sm text-gray-400">Entries</div>
              </div>
              <div className="bg-health-darker/50 rounded-lg p-4 text-center border border-health-primary/20">
                <div className="text-2xl font-bold text-health-secondary">85%</div>
                <div className="text-sm text-gray-400">Progress</div>
              </div>
            </div>
          </div>

          {/* Right Side - Symptom Form */}
          <div className="lg:col-span-3">
            <SymptomForm />
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Index;
