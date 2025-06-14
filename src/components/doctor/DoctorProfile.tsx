
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit, Mail, Phone, MapPin, User } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profile_picture_url?: string;
  specialization?: string;
}

interface DoctorProfileProps {
  doctor: Doctor;
  onEdit: () => void;
  onChat: () => void;
}

const DoctorProfile = ({ doctor, onEdit, onChat }: DoctorProfileProps) => {
  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {doctor.profile_picture_url ? (
            <img
              src={doctor.profile_picture_url}
              alt={doctor.name}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="text-gray-400" size={48} />
            </div>
          )}
        </div>

        {/* Doctor Information */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{doctor.name}</h2>
              {doctor.specialization && (
                <p className="text-blue-400 font-medium">{doctor.specialization}</p>
              )}
            </div>
            <Button
              onClick={onEdit}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-300">
              <Mail className="text-blue-400 mr-3" size={18} />
              <span>{doctor.email}</span>
            </div>
            
            {doctor.phone && (
              <div className="flex items-center text-gray-300">
                <Phone className="text-blue-400 mr-3" size={18} />
                <span>{doctor.phone}</span>
              </div>
            )}
            
            {doctor.location && (
              <div className="flex items-center text-gray-300">
                <MapPin className="text-blue-400 mr-3" size={18} />
                <span>{doctor.location}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onChat}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <MessageSquare size={16} className="mr-2" />
              Chat with Doctor
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => window.open(`mailto:${doctor.email}`, '_blank')}
            >
              <Mail size={16} className="mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DoctorProfile;
