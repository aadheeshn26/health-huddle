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
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // 1-31 for monthly medications
  notifications: boolean;
  createdDate?: Date; // Track when medication was created for bi-weekly calculation
}

const MedicationReminder = () => {
  console.log('MedicationReminder component rendering');
  
  const [medication, setMedication] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(undefined);
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(undefined);
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

  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  // Generate array of day numbers 1-31
  const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString()
  }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Saving medication:', { medication, time, frequency, dayOfWeek, dayOfMonth, notifications });
    
    if (!medication.trim() || !time || !frequency) {
      toast({
        title: "Please fill all fields",
        description: "Enter medication name, time, and frequency to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate day of week for weekly and bi-weekly frequencies
    if ((frequency === 'weekly' || frequency === 'bi-weekly') && dayOfWeek === undefined) {
      toast({
        title: "Day of week required",
        description: "Please select a day of the week for weekly or bi-weekly medications.",
        variant: "destructive",
      });
      return;
    }

    // Validate day of month for monthly frequency
    if (frequency === 'monthly' && dayOfMonth === undefined) {
      toast({
        title: "Day of month required",
        description: "Please select a day of the month for monthly medications.",
        variant: "destructive",
      });
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medication,
      time: time,
      frequency: frequency,
      dayOfWeek: (frequency === 'weekly' || frequency === 'bi-weekly') ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      notifications: notifications,
      createdDate: new Date()
    };

    setMedications(prev => [...prev, newMedication]);
    
    // Reset form
    setMedication('');
    setTime('');
    setFrequency('');
    setDayOfWeek(undefined);
    setDayOfMonth(undefined);
    setNotifications(false);
    
    let frequencyText = frequency;
    if (dayOfWeek !== undefined) {
      const dayName = dayOptions.find(d => d.value === dayOfWeek)?.label;
      frequencyText = `${frequency} on ${dayName}`;
    }
    if (dayOfMonth !== undefined) {
      frequencyText = `${frequency} on day ${dayOfMonth}`;
    }
    
    toast({
      title: "Reminder added!",
      description: `${medication} reminder set for ${time} (${frequencyText})`,
    });
  };

  const handleEdit = (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
      setMedication(med.name);
      setTime(med.time);
      setFrequency(med.frequency);
      setDayOfWeek(med.dayOfWeek);
      setDayOfMonth(med.dayOfMonth);
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

  // Fixed medication filtering logic
  const getMedicationsForDate = () => {
    const selectedDay = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const selectedDateNum = selectedDate.getDate(); // 1-31
    
    console.log('Filtering medications for date:', selectedDate);
    console.log('Selected day of week:', selectedDay);
    console.log('Selected day of month:', selectedDateNum);
    
    return medications.filter(med => {
      console.log('Checking medication:', med.name, 'frequency:', med.frequency);
      
      switch (med.frequency) {
        case 'daily':
          console.log('Daily medication - showing');
          return true;
          
        case 'weekly':
          const weeklyMatch = med.dayOfWeek === selectedDay;
          console.log('Weekly medication - dayOfWeek:', med.dayOfWeek, 'selectedDay:', selectedDay, 'match:', weeklyMatch);
          return weeklyMatch;
          
        case 'bi-weekly':
          // First check if it's the right day of week
          if (med.dayOfWeek !== selectedDay) {
            console.log('Bi-weekly medication - wrong day of week');
            return false;
          }
          
          // Calculate weeks difference from creation date
          const createdDate = med.createdDate || new Date();
          const timeDiff = selectedDate.getTime() - createdDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const weeksDiff = Math.floor(daysDiff / 7);
          const biWeeklyMatch = weeksDiff % 2 === 0;
          console.log('Bi-weekly medication - weeks diff:', weeksDiff, 'match:', biWeeklyMatch);
          return biWeeklyMatch;
          
        case 'monthly':
          const monthlyMatch = med.dayOfMonth === selectedDateNum;
          console.log('Monthly medication - dayOfMonth:', med.dayOfMonth, 'selectedDateNum:', selectedDateNum, 'match:', monthlyMatch);
          return monthlyMatch;
          
        default:
          console.log('Unknown frequency - not showing');
          return false;
      }
    });
  };

  const dateMedications = getMedicationsForDate();

  console.log('Current medications:', medications);
  console.log('Selected date:', selectedDate);
  console.log('Medications for selected date:', dateMedications);

  const needsDaySelection = frequency === 'weekly' || frequency === 'bi-weekly';
  const needsMonthDaySelection = frequency === 'monthly';

  return (
    <div className="w-full">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-health-primary/20 health-card-glow">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Medication Management
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Add Medication Form */}
          <div className="lg:col-span-1 space-y-6">
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
                  <Select value={frequency} onValueChange={(value) => {
                    setFrequency(value);
                    if (value !== 'weekly' && value !== 'bi-weekly') {
                      setDayOfWeek(undefined);
                    }
                    if (value !== 'monthly') {
                      setDayOfMonth(undefined);
                    }
                  }}>
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

                {needsDaySelection && (
                  <div>
                    <label htmlFor="dayOfWeek" className="block text-sm font-medium text-slate-700 mb-2">
                      Day of Week
                    </label>
                    <Select value={dayOfWeek?.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
                      <SelectTrigger className="bg-white/50 border-health-primary/30 text-slate-800 focus:border-health-primary focus:ring-health-primary">
                        <SelectValue placeholder="Select day..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {needsMonthDaySelection && (
                  <div>
                    <label htmlFor="dayOfMonth" className="block text-sm font-medium text-slate-700 mb-2">
                      Day of Month
                    </label>
                    <Select value={dayOfMonth?.toString()} onValueChange={(value) => setDayOfMonth(parseInt(value))}>
                      <SelectTrigger className="bg-white/50 border-health-primary/30 text-slate-800 focus:border-health-primary focus:ring-health-primary">
                        <SelectValue placeholder="Select day (1-31)..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOfMonthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

          {/* Right Side - Calendar and Medications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar and Medications in 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* Calendar */}
              <div className="h-80">
                <h3 className="text-lg font-medium text-slate-800 mb-3 text-center">Select Date</h3>
                <div className="bg-white rounded-lg border border-health-primary/20 shadow-sm h-full flex items-center justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="p-4 pointer-events-auto rounded-lg"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium text-slate-800",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-health-primary/20 rounded",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-health-muted rounded-md w-9 font-normal text-sm",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 relative hover:bg-health-primary/10 rounded-md",
                      day: "h-9 w-9 p-0 font-normal text-slate-800 hover:bg-health-primary/20 rounded-md",
                      day_selected: "bg-health-primary text-white hover:bg-health-primary hover:text-white focus:bg-health-primary focus:text-white",
                      day_today: "bg-health-accent/20 text-health-primary font-medium",
                      day_outside: "text-health-muted opacity-50",
                      day_disabled: "text-health-muted opacity-50",
                    }}
                  />
                </div>
              </div>

              {/* Your Medications List */}
              <div className="h-80">
                <h3 className="text-lg font-medium text-slate-800 mb-3">Your Medications</h3>
                <div className="bg-white rounded-lg border border-health-primary/20 p-4 shadow-sm h-full">
                  {medications.length > 0 ? (
                    <div className="space-y-3 h-full overflow-y-auto">
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
                                {med.dayOfWeek !== undefined && ` on ${dayOptions.find(d => d.value === med.dayOfWeek)?.label}`}
                                {med.dayOfMonth !== undefined && ` on day ${med.dayOfMonth}`}
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
                    <div className="flex items-center justify-center h-full text-health-muted text-center">
                      <div>
                        <p className="text-lg mb-2">No medications added yet</p>
                        <p className="text-sm">Add your first medication using the form on the left</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medications for Selected Date - Only show if there are medications for this date */}
            {dateMedications.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-slate-800 mb-3">
                  Medications for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                <div className="bg-white rounded-lg border border-health-primary/20 p-4 shadow-sm">
                  <div className="space-y-3">
                    {dateMedications.map((med) => (
                      <div key={med.id} className="bg-health-accent/20 rounded-lg p-3 border border-health-primary/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-slate-800">{med.name}</div>
                            <div className="text-sm text-health-muted">Take at {med.time}</div>
                          </div>
                          <div className="text-sm text-health-secondary font-medium">
                            {frequencyOptions.find(f => f.value === med.frequency)?.label}
                            {med.dayOfWeek !== undefined && ` - ${dayOptions.find(d => d.value === med.dayOfWeek)?.label}`}
                            {med.dayOfMonth !== undefined && ` - Day ${med.dayOfMonth}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MedicationReminder;
