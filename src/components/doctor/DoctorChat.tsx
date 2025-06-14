
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
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

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'doctor';
  created_at: string;
}

interface DoctorChatProps {
  doctor: Doctor;
  onBack: () => void;
}

const DoctorChat = ({ doctor, onBack }: DoctorChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_chats')
        .select('*')
        .eq('doctor_id', doctor.id)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('doctor_chats')
        .insert({
          user_id: user.id,
          doctor_id: doctor.id,
          message: newMessage.trim(),
          sender_type: 'user'
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-0 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white mr-3"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex items-center">
          {doctor.profile_picture_url ? (
            <img
              src={doctor.profile_picture_url}
              alt={doctor.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 mr-3"></div>
          )}
          <div>
            <h3 className="font-semibold text-white">{doctor.name}</h3>
            <p className="text-sm text-gray-400">{doctor.specialization}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No messages yet. Start a conversation with your doctor.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p>{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DoctorChat;
