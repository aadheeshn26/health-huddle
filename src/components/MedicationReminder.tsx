
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const MedicationReminder = () => {
  const [medication, setMedication] = useState('');
  const [time, setTime] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medication.trim() || !time) {
      toast({
        title: "Please fill all fields",
        description: "Enter medication name and time to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log('Medication reminder saved:', { medication, time, notifications });
    
    setIsConfigured(true);
    toast({
      title: "Reminder set!",
      description: `${medication} reminder set for ${time}`,
    });
  };

  const handleEdit = () => {
    setIsConfigured(false);
  };

  if (isConfigured) {
    return (
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-health-primary/20 health-card-glow">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Medication Reminder
        </h2>
        
        <div className="space-y-3">
          <div className="bg-health-lighter/50 rounded-lg p-3">
            <div className="text-sm font-medium text-slate-800">{medication}</div>
            <div className="text-sm text-health-muted">Daily at {time}</div>
            <div className="text-xs text-health-muted mt-1">
              Notifications: {notifications ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <Button
            onClick={handleEdit}
            variant="outline"
            className="w-full border-health-primary/30 text-health-primary hover:bg-health-primary/10"
          >
            Edit Reminder
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-health-primary/20 health-card-glow">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Set Medication Reminder
      </h2>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="medication" className="block text-sm font-medium text-slate-700 mb-2">
            Medication Name
          </label>
          <Input
            id="medication"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="Enter medication name..."
            className="bg-white/50 border-health-primary/30 text-slate-800 placeholder-slate-500 focus:border-health-primary focus:ring-health-primary"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-2">
            Reminder Time
          </label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-white/50 border-health-primary/30 text-slate-800 focus:border-health-primary focus:ring-health-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="notifications" className="text-sm font-medium text-slate-700">
            Enable Notifications
          </label>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-health-primary hover:bg-health-secondary text-white font-semibold py-3"
        >
          Set Reminder
        </Button>
      </form>
    </Card>
  );
};

export default MedicationReminder;
