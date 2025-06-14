
import { useState, useEffect } from 'react';

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
    <div className="bg-health-darker/50 rounded-xl p-6 health-card-glow border border-health-primary/20">
      <div className="text-center">
        <div className="text-4xl font-bold text-health-primary mb-2 animate-pulse-glow">
          {streak}
        </div>
        <div className="text-lg font-semibold text-white mb-1">
          Day Streak
        </div>
        <div className="text-sm text-gray-400">
          Keep it up! Daily check-ins matter.
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-1">
          {[...Array(Math.min(streak, 7))].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-health-primary animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
          {streak > 7 && (
            <div className="text-health-primary text-sm font-bold ml-2">
              +{streak - 7}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;
