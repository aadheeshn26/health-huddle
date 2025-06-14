
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SymptomForm = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim() && !selectedImage) {
      toast({
        title: "Please add symptoms",
        description: "Enter your symptoms or upload an image to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your symptoms.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine the type of checkup
      let checkupType = 'text';
      if (selectedImage) checkupType = 'image';
      if (symptoms.includes('Voice recording:')) checkupType = 'voice';

      // Save symptom to symptoms table
      const { error: symptomError } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          text: symptoms,
          image_url: selectedImage ? `image_${Date.now()}_${selectedImage.name}` : null,
        });

      if (symptomError) throw symptomError;

      // Record daily checkup (this will trigger streak update)
      const { error: checkupError } = await supabase
        .from('daily_checkups')
        .insert({
          user_id: user.id,
          type: checkupType,
        });

      if (checkupError) throw checkupError;

      console.log('Symptoms and daily checkup recorded:', { symptoms, image: selectedImage?.name, type: checkupType });
      
      toast({
        title: "Symptoms recorded!",
        description: "Your symptoms have been saved and streak updated.",
      });

      // Reset form
      setSymptoms('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh the page to update streak counter
      window.location.reload();

    } catch (error) {
      console.error('Error saving symptoms:', error);
      toast({
        title: "Error",
        description: "Failed to save symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording simulation
      toast({
        title: "Recording started",
        description: "Speak your symptoms clearly.",
      });
      
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setSymptoms(prev => prev + " Voice recording: feeling tired and headache");
        toast({
          title: "Recording complete",
          description: "Your voice recording has been added.",
        });
      }, 3000);
    } else {
      toast({
        title: "Recording stopped",
        description: "Recording has been saved.",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      toast({
        title: "Image uploaded",
        description: `${file.name} has been attached.`,
      });
    }
  };

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-health-primary/20 health-card-glow">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Track Your Symptoms
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700 mb-2">
            Describe your symptoms
          </label>
          <Textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="How are you feeling today? Describe any symptoms, pain levels, or changes you've noticed..."
            className="min-h-[120px] bg-white/50 border-health-primary/30 text-slate-800 placeholder-slate-500 focus:border-health-primary focus:ring-health-primary"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={handleVoiceRecord}
            variant="outline"
            className={`flex-1 bg-transparent border-health-primary text-health-primary hover:bg-health-primary/10 ${
              isRecording ? 'bg-red-100/50 border-red-300 animate-pulse' : ''
            }`}
          >
            🎤 {isRecording ? 'Recording...' : 'Voice Record'}
          </Button>
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 bg-transparent border-health-primary text-health-primary hover:bg-health-primary/10"
          >
            📷 Upload Image
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {selectedImage && (
          <div className="text-sm text-health-secondary">
            📎 Attached: {selectedImage.name}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-health-primary hover:bg-health-secondary text-white font-semibold py-3"
        >
          {isSubmitting ? 'Saving...' : 'Save Symptoms'}
        </Button>
      </form>
    </Card>
  );
};

export default SymptomForm;
