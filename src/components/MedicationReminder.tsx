
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  time: string;
  frequency: string;
  notifications: boolean;
}

const MedicationReminder = () => {
  console.log('MedicationReminder component rendering');
  
  const [medication, setMedication] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Saving medication:', { medication, time, frequency, notifications });
    
    if (!medication.trim() || !time || !frequency) {
      toast({
        title: "Please fill all fields",
        description: "Enter medication name, time, and frequency to continue.",
        variant: "destructive",
      });
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medication,
      time: time,
      frequency: frequency,
      notifications: notifications
    };

    setMedications(prev => [...prev, newMedication]);
    
    // Reset form
    setMedication('');
    setTime('');
    setFrequency('');
    setNotifications(false);
    
    toast({
      title: "Reminder added!",
      description: `${medication} reminder set for ${time} (${frequency})`,
    });
  };

  const handleEdit = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
      setMedication(med.name);
      setTime(med.time);
      setFrequency(med.frequency);
      setNotifications(med.notifications);
      
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleDelete = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Reminder deleted",
      description: "Medication reminder has been removed.",
    });
  };

  // Get today's medications based on frequency and selected date
  const getTodaysMedications = () => {
    const today = new Date();
    const selectedDay = selectedDate.getDay();
    const selectedDateNum = selectedDate.getDate();
    
    return medications.filter(med => {
      switch (med.frequency) {
        case 'daily':
          return true;
        case 'weekly':
          return selectedDay === today.getDay();
        case 'bi-weekly':
          const weeksDiff = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
          return weeksDiff % 2 === 0 && selectedDay === today.getDay();
        case 'monthly':
          return selectedDateNum === today.getDate();
        default:
          return false;
      }
    });
  };

  const todaysMedications = getTodaysMedications();

  console.log('Current medications:', medications);
  console.log('Todays medications:', todaysMedications);

  return (
    <div className="w-full">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-health-primary/20 health-card-glow">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Medication Management
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Medication List and Add Form */}
          <div className="space-y-6">
            {/* Current Medications List */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-3">Your Medications</h3>
              {medications.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {medications.map((med) => (
                    <div key={med.id} className="bg-health-lighter/50 rounded-lg p-3 border border-health-primary/10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">{med.name}</div>
                          <div className="text-sm text-health-muted">
                            Time: {med.time}
                          </div>
                          <div className="text-sm text-health-muted">
                            Frequency: {frequencyOptions.find(f => f.value === med.frequency)?.label}
                          </div>
                          <div className="text-xs text-health-muted mt-1">
                            Notifications: {med.notifications ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(med.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs border-health-primary/30 text-health-primary hover:bg-health-primary/10"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(med.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-health-muted">
                  <p>No medications added yet</p>
                  <p className="text-sm">Add your first medication below</p>
                </div>
              )}
            </div>

            {/* Add New Medication Form */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-3">Add Medication Reminder</h3>
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

                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 mb-2">
                    Frequency
                  </label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="bg-white/50 border-health-primary/30 text-slate-800 focus:border-health-primary focus:ring-health-primary">
                      <SelectValue placeholder="Select frequency..." />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Add Medication Reminder
                </Button>
              </form>
            </div>
          </div>

          {/* Right Side - Calendar and Today's Schedule */}
          <div className="space-y-6">
            {/* Calendar */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-3">Calendar</h3>
              <div className="bg-white/50 rounded-lg p-4 border border-health-primary/20">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0"
                />
              </div>
            </div>

            {/* Today's Medications */}
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-3">
                Medications for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="bg-white/50 rounded-lg p-4 border border-health-primary/20 min-h-[200px]">
                {todaysMedications.length > 0 ? (
                  <div className="space-y-3">
                    {todaysMedications.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-3 bg-health-primary/5 rounded-md border border-health-primary/10">
                        <div>
                          <div className="font-medium text-slate-800">{med.name}</div>
                          <div className="text-sm text-health-muted">Take at {med.time}</div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-health-primary/10 rounded-full text-health-primary font-medium">
                          {frequencyOptions.find(f => f.value === med.frequency)?.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-health-muted text-center">
                    <div>
                      <p className="text-lg mb-2">No medications scheduled</p>
                      <p className="text-sm">for {format(selectedDate, 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MedicationReminder;
