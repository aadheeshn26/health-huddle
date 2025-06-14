
import { useState, useEffect } from 'react';
import { Flame, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const StreakCounter = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      try {
        // First try to get streak from database
        const { data: streakData } = await supabase
          .from('streaks')
          .select('streak_count')
          .eq('user_id', user.id)
          .single();

        if (streakData) {
          setStreak(streakData.streak_count);
        } else {
          // Calculate streak using the database function
          const { data: calculatedStreak } = await supabase
            .rpc('calculate_user_streak', { user_uuid: user.id });
          
          setStreak(calculatedStreak || 0);
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [user]);

  const getBadgeInfo = () => {
    if (streak >= 30) return { text: '30-Day Champion', color: 'text-yellow-400', icon: Award };
    if (streak >= 14) return { text: '14-Day Warrior', color: 'text-purple-400', icon: Award };
    if (streak >= 7) return { text: '7-Day Hero', color: 'text-blue-400', icon: Award };
    if (streak >= 5) return { text: '5-Day Supporter', color: 'text-green-400', icon: Award };
    return null;
  };

  const badgeInfo = getBadgeInfo();

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-6 w-6 bg-gray-300 rounded mx-auto mb-2"></div>
          <div className="h-4 w-16 bg-gray-300 rounded mx-auto mb-1"></div>
          <div className="h-3 w-12 bg-gray-300 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center space-x-1 mb-1">
        <Flame className="text-orange-500" size={16} />
        <span className="text-xl font-bold text-health-primary">{streak}</span>
      </div>
      <div className="text-xs font-semibold text-slate-800 mb-1">
        {streak === 1 ? 'Day Streak' : 'Day Streak'}
      </div>
      
      {badgeInfo ? (
        <div className="flex items-center justify-center space-x-1 mb-2">
          <badgeInfo.icon className={badgeInfo.color} size={12} />
          <span className={`text-xs font-bold ${badgeInfo.color}`}>
            {badgeInfo.text}
          </span>
        </div>
      ) : (
        <div className="text-xs text-health-muted mb-2">
          Keep it up!
        </div>
      )}
      
      <div className="flex justify-center">
        <div className="flex space-x-1">
          {[...Array(Math.min(streak, 3))].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-health-primary"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
          {streak > 3 && (
            <div className="text-health-primary text-xs font-bold ml-1">
              +{streak - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
