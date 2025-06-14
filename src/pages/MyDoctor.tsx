
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import DoctorProfile from '@/components/doctor/DoctorProfile';
import DoctorForm from '@/components/doctor/DoctorForm';
import DoctorChat from '@/components/doctor/DoctorChat';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profile_picture_url?: string;
  specialization?: string;
}

const MyDoctor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user) {
      loadDoctor();
    }
  }, [user]);

  const loadDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      setDoctor(data);
      if (!data) {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error loading doctor:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSaved = (savedDoctor: Doctor) => {
    setDoctor(savedDoctor);
    setShowForm(false);
    toast({
      title: "Success",
      description: "Doctor information saved successfully.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400">Please log in to access your doctor.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="w-full px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">
            My Doctor
          </h1>
          <p className="text-gray-400">
            Manage your healthcare provider information
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {showForm ? (
            <DoctorForm
              doctor={doctor}
              onSave={handleDoctorSaved}
              onCancel={() => setShowForm(false)}
            />
          ) : doctor ? (
            showChat ? (
              <DoctorChat
                doctor={doctor}
                onBack={() => setShowChat(false)}
              />
            ) : (
              <DoctorProfile
                doctor={doctor}
                onEdit={() => setShowForm(true)}
                onChat={() => setShowChat(true)}
              />
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No doctor configured yet.</p>
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default MyDoctor;
