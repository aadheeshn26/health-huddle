
import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

const StreakCounter = () => {
  const [streak, setStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);

  useEffect(() => {
    // Get streak data from localStorage (simulating backend for now)
    const storedStreak = localStorage.getItem('healthhuddle_streak');
    const storedLastLogin = localStorage.getItem('healthhuddle_last_login');
    const today = new Date().toDateString();

    console.log('Loading streak data:', { storedStreak, storedLastLogin, today });

    if (storedLastLogin === today) {
      // Already logged in today
      setStreak(parseInt(storedStreak || '1'));
      setLastLoginDate(storedLastLogin);
    } else if (storedLastLogin) {
      const lastLogin = new Date(storedLastLogin);
      const todayDate = new Date();
      const diffTime = Math.abs(todayDate.getTime() - lastLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        const newStreak = parseInt(storedStreak || '0') + 1;
        setStreak(newStreak);
        localStorage.setItem('healthhuddle_streak', newStreak.toString());
        localStorage.setItem('healthhuddle_last_login', today);
        setLastLoginDate(today);
        console.log('Streak incremented to:', newStreak);
      } else {
        // Missed days - reset streak
        setStreak(1);
        localStorage.setItem('healthhuddle_streak', '1');
        localStorage.setItem('healthhuddle_last_login', today);
        setLastLoginDate(today);
        console.log('Streak reset to 1');
      }
    } else {
      // First time user
      setStreak(1);
      localStorage.setItem('healthhuddle_streak', '1');
      localStorage.setItem('healthhuddle_last_login', today);
      setLastLoginDate(today);
      console.log('First time login, streak set to 1');
    }
  }, []);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Flame className="text-orange-500" size={20} />
        <span className="text-2xl font-bold text-health-primary">{streak}</span>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-slate-800 mb-1">
          Day Streak
        </div>
        <div className="text-xs text-health-muted">
          Keep it up!
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="flex space-x-1">
          {[...Array(Math.min(streak, 5))].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-health-primary"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
          {streak > 5 && (
            <div className="text-health-primary text-xs font-bold ml-1">
              +{streak - 5}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
