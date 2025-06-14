
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profile_picture_url?: string;
  specialization?: string;
}

interface DoctorFormProps {
  doctor?: Doctor | null;
  onSave: (doctor: Doctor) => void;
  onCancel: () => void;
}

const DoctorForm = ({ doctor, onSave, onCancel }: DoctorFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    location: doctor?.location || '',
    profile_picture_url: doctor?.profile_picture_url || '',
    specialization: doctor?.specialization || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const doctorData = {
        user_id: user.id,
        ...formData,
      };

      let result;
      if (doctor) {
        // Update existing doctor
        result = await supabase
          .from('doctors')
          .update(doctorData)
          .eq('id', doctor.id)
          .select()
          .single();
      } else {
        // Create new doctor
        result = await supabase
          .from('doctors')
          .insert(doctorData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      onSave(result.data);
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast({
        title: "Error",
        description: "Failed to save doctor information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">
        {doctor ? 'Edit Doctor Information' : 'Add Your Doctor'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Dr. John Smith"
            required
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="doctor@example.com"
            required
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="specialization" className="text-gray-300">Specialization</Label>
          <Input
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="Cardiologist, Family Medicine, etc."
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="location" className="text-gray-300">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State or Full Address"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="profile_picture_url" className="text-gray-300">Profile Picture URL</Label>
          <Input
            id="profile_picture_url"
            name="profile_picture_url"
            type="url"
            value={formData.profile_picture_url}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : 'Save Doctor'}
          </Button>
          
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DoctorForm;
