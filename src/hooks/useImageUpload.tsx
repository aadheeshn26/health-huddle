
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "Image uploaded",
      description: `${file.name} has been attached for analysis.`,
    });
  }, [toast]);

  const processImageWithVision = useCallback(async (image: File) => {
    if (!image) return null;

    setIsProcessing(true);
    
    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(image);
      });

      console.log('Image prepared for Google Vision API:', {
        filename: image.name,
        size: image.size,
        type: image.type
      });

      // TODO: Implement Google Vision API call
      // This would typically be done through a Supabase Edge Function
      // For now, we'll just prepare the data structure
      
      return {
        image: base64Image,
        mimeType: image.type,
        filename: image.name
      };

    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "Could not process the image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  return {
    selectedImage,
    imagePreview,
    isProcessing,
    handleImageUpload,
    processImageWithVision,
    clearImage,
  };
};
