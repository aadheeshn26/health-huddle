
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Mic, MicOff, Loader2, Upload, X } from 'lucide-react';

const SymptomForm = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleTranscription = useCallback((transcribedText: string) => {
    // Append the transcribed text to existing symptoms
    setSymptoms(prev => {
      const separator = prev.trim() ? ' ' : '';
      return prev + separator + transcribedText;
    });
  }, []);

  const { isRecording, isTranscribing, toggleRecording } = useAudioRecorder(handleTranscription);
  const { selectedImage, imagePreview, isProcessing, handleImageUpload, clearImage } = useImageUpload();

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
      clearImage();
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
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
          <div className="relative">
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="How are you feeling today? Describe any symptoms, pain levels, or changes you've noticed..."
              className="min-h-[120px] bg-white/50 border-health-primary/30 text-slate-800 placeholder-slate-500 focus:border-health-primary focus:ring-health-primary pr-12"
            />
            <Button
              type="button"
              onClick={toggleRecording}
              disabled={isTranscribing}
              variant="ghost"
              size="sm"
              className={`absolute top-2 right-2 h-8 w-8 p-0 ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'text-health-primary hover:bg-health-primary/10'
              }`}
            >
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isRecording && (
            <p className="text-xs text-red-600 mt-1 animate-pulse">
              Recording... Click the microphone to stop or wait 10 seconds
            </p>
          )}
          {isTranscribing && (
            <p className="text-xs text-health-primary mt-1">
              Converting speech to text...
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={toggleRecording}
            variant="outline"
            disabled={isTranscribing}
            className={`flex-1 bg-transparent border-health-primary text-health-primary hover:bg-health-primary/10 ${
              isRecording ? 'bg-red-100/50 border-red-300 animate-pulse' : ''
            }`}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : isRecording ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Voice Record
              </>
            )}
          </Button>
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isProcessing}
            className="flex-1 bg-transparent border-health-primary text-health-primary hover:bg-health-primary/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Medical Data
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {imagePreview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Uploaded Medical Data:</p>
              <Button
                type="button"
                onClick={clearImage}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-slate-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <img
                src={imagePreview}
                alt="Medical data preview"
                className="max-h-48 w-auto rounded-lg border border-slate-200 shadow-sm"
              />
              <div className="mt-2 text-xs text-slate-600">
                📎 {selectedImage?.name} ({Math.round((selectedImage?.size || 0) / 1024)}KB)
              </div>
            </div>
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
