
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_flagged?: boolean;
  flagged_reason?: string;
  user_email?: string;
}

export const useChatMessages = (selectedGroup: string, userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${selectedGroup}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, selectedGroup]);

  const fetchMessages = async () => {
    if (!userId) return;

    try {
      // First fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('group_id', selectedGroup)
        .eq('is_flagged', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) throw messagesError;

      // Then fetch user emails for these messages
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine the data
      const messagesWithEmails = messagesData?.map(msg => ({
        ...msg,
        user_email: profilesData?.find(profile => profile.id === msg.user_id)?.email
      })) || [];

      setMessages(messagesWithEmails);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          group_id: selectedGroup,
          message: message,
        });

      if (error) throw error;

      console.log('Message sent successfully');

      toast({
        title: "Message sent!",
        description: "Your message has been shared with the group.",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: () => {
      setLoading(true);
      fetchMessages();
    }
  };
};
