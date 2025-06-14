
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_flagged?: boolean;
  flagged_reason?: string;
  profiles?: {
    email?: string;
  };
}

const Chat = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const groups = [
    { id: 'general', name: 'General Support', members: 234 },
    { id: 'diabetes', name: 'Diabetes Care', members: 89 },
    { id: 'anxiety', name: 'Anxiety Support', members: 156 },
    { id: 'arthritis', name: 'Arthritis Care', members: 73 },
    { id: 'hypertension', name: 'Heart Health', members: 45 },
  ];

  useEffect(() => {
    if (!user) return;

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
  }, [user, selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!inner(email)
        `)
        .eq('group_id', selectedGroup)
        .eq('is_flagged', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          group_id: selectedGroup,
          message: message.trim(),
        });

      if (error) throw error;

      console.log('Message sent successfully');
      setMessage('');

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserDisplayName = (msg: Message) => {
    if (msg.user_id === user?.id) return 'You';
    return msg.profiles?.email?.split('@')[0] || 'Unknown User';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p>Please log in to access the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur-lg p-4 border-b border-blue-500/20">
          <h1 className="text-xl font-bold text-white mb-3">Support Groups</h1>
          
          {/* Group Selector */}
          <div className="flex space-x-2 overflow-x-auto">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setSelectedGroup(group.id);
                  setLoading(true);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGroup === group.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-gray-300 hover:bg-blue-600/20'
                }`}
              >
                {group.name}
                <span className="ml-1 text-xs opacity-70">({group.members})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="h-[calc(100vh-240px)] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] p-3 ${
                    msg.user_id === user.id
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/50 border-slate-700 text-white'
                  }`}>
                    {msg.user_id !== user.id && (
                      <div className="text-xs text-blue-400 font-medium mb-1">
                        {getUserDisplayName(msg)}
                      </div>
                    )}
                    <div className="text-sm">{msg.message}</div>
                    <div className={`text-xs mt-1 ${
                      msg.user_id === user.id ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.created_at)}
                    </div>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-slate-800/90 backdrop-blur-lg border-t border-blue-500/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700/50 border-blue-500/30 text-white placeholder-gray-400 focus:border-blue-500"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Send
            </Button>
          </form>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;
