
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SymptomForm = () => {
  const [symptoms, setSymptoms] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim() && !selectedImage) {
      toast({
        title: "Please add symptoms",
        description: "Enter your symptoms or upload an image to continue.",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting symptoms:', { symptoms, image: selectedImage?.name });
    
    toast({
      title: "Symptoms recorded!",
      description: "Your symptoms have been saved successfully.",
    });

    // Reset form
    setSymptoms('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            className={`flex-1 border-health-primary/30 text-health-primary hover:bg-health-primary/10 ${
              isRecording ? 'bg-red-100 border-red-300 animate-pulse' : ''
            }`}
          >
            🎤 {isRecording ? 'Recording...' : 'Voice Record'}
          </Button>
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1 border-health-primary/30 text-health-primary hover:bg-health-primary/10"
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
          className="w-full bg-health-primary hover:bg-health-secondary text-white font-semibold py-3"
        >
          Save Symptoms
        </Button>
      </form>
    </Card>
  );
};

export default SymptomForm;
