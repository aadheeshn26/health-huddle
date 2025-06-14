
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const DailyCheckIn = () => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
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

  const handleStartCheckIn = () => {
    setIsCheckingIn(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer, 0);
      const averageScore = (totalScore / questions.length).toFixed(1);
      
      setIsCompleted(true);
      setIsCheckingIn(false);
      
      toast({
        title: "Check-in Complete!",
        description: `Your wellness score: ${averageScore}/5`,
      });

      console.log('Daily check-in completed:', { answers: newAnswers, score: averageScore });
    }
  };

  if (isCompleted) {
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const averageScore = (totalScore / questions.length).toFixed(1);
    
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 health-card-glow border border-health-primary/20 h-32 flex flex-col justify-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CheckCircle className="text-health-success" size={20} />
          <span className="text-2xl font-bold text-health-primary">{averageScore}</span>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            Today's Score
          </div>
          <div className="text-xs text-health-muted mb-3">
            Check-in complete!
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
