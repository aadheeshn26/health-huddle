
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DailyCheckIn = () => {
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const questions = [
    "How would you rate your overall mood today?",
    "How well did you sleep last night?",
    "How is your energy level today?",
    "How manageable is your stress today?",
    "How connected do you feel to others today?"
  ];

  const options = [
    { value: 1, label: "Very Poor" },
    { value: 2, label: "Poor" },
    { value: 3, label: "Fair" },
    { value: 4, label: "Good" },
    { value: 5, label: "Excellent" }
  ];

  useEffect(() => {
    const checkTodayStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('daily_checkups')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', `${today}T00:00:00`)
          .lt('completed_at', `${today}T23:59:59`);

        if (error) {
          console.error('Error checking today status:', error);
        } else if (data && data.length > 0) {
          setHasCompletedToday(true);
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Error in checkTodayStatus:', error);
      } finally {
        setLoading(false);
      }
    };

    checkTodayStatus();
  }, [user]);

  const handleStartCheckIn = () => {
    setIsCheckingIn(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
    setHasCompletedToday(false);
  };

  const handleAnswer = async (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and complete check-in
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const averageScore = (totalScore / questions.length).toFixed(1);
      
      try {
        if (user) {
          // Record the daily checkup (this will trigger streak update)
          const { error } = await supabase
            .from('daily_checkups')
            .insert({
              user_id: user.id,
              type: 'text', // This is a wellness check-in
            });

          if (error) {
            console.error('Error completing check-in:', error);
            toast({
              title: "Error",
              description: "Failed to save check-in. Please try again.",
              variant: "destructive",
            });
          } else {
            setIsCompleted(true);
            setIsCheckingIn(false);
            setHasCompletedToday(true);
            
            toast({
              title: "Check-in Complete!",
              description: `Your wellness score: ${averageScore}/5. Streak updated!`,
            });

            console.log('Daily check-in completed:', { answers: newAnswers, score: averageScore });

            // Refresh page to update streak
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error completing check-in:', error);
        toast({
          title: "Error",
          description: "Failed to save check-in. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20 h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-health-primary"></div>
      </div>
    );
  }

  if (isCompleted || hasCompletedToday) {
    const totalScore = answers.length > 0 ? answers.reduce((sum, answer) => sum + answer, 0) : 0;
    const averageScore = answers.length > 0 ? (totalScore / questions.length).toFixed(1) : '✓';
    
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20 h-32 flex flex-col justify-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className="text-health-success" size={20} />
          <span className="text-2xl font-bold text-health-primary">{averageScore}</span>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            Today's Check-in
          </div>
          <div className="text-xs text-health-muted mb-3">
            {hasCompletedToday ? 'Completed today!' : 'Check-in complete!'}
          </div>
        </div>
        <Button
          onClick={handleStartCheckIn}
          variant="outline"
          className="w-full text-xs border-health-primary/30 text-health-primary hover:bg-health-primary/10"
        >
          New Check-in
        </Button>
      </div>
    );
  }

  if (isCheckingIn) {
    return (
      <Card className="p-4 bg-white/60 backdrop-blur-sm border-health-primary/20 health-card-glow h-32 flex flex-col">
        <div className="mb-4">
          <div className="text-xs text-health-muted mb-2">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <h3 className="text-sm font-medium text-slate-800 mb-4">
            {questions[currentQuestion]}
          </h3>
        </div>
        
        <RadioGroup onValueChange={handleAnswer} className="space-y-2 flex-1">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
              <label htmlFor={`option-${option.value}`} className="text-xs text-slate-700 cursor-pointer">
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </Card>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20 h-32 flex flex-col justify-center">
      <div className="text-center mb-3">
        <div className="text-sm font-semibold text-slate-800 mb-1">
          Daily Check-in
        </div>
        <div className="text-xs text-health-muted mb-3">
          Track your wellness
        </div>
      </div>
      <Button
        onClick={handleStartCheckIn}
        className="w-full bg-health-primary hover:bg-health-secondary text-white text-xs py-2"
      >
        Start Check-in
      </Button>
    </div>
  );
};

export default DailyCheckIn;
