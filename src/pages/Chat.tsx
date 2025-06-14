import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ChatHeader from '@/components/chat/ChatHeader';
import MessagesList from '@/components/chat/MessagesList';
import MessageInput from '@/components/chat/MessageInput';

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_email?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('general');

  const groups = [
    { id: 'general', name: 'General Support', members: 234 },
    { id: 'diabetes', name: 'Diabetes Care', members: 89 },
    { id: 'anxiety', name: 'Anxiety Support', members: 156 },
    { id: 'arthritis', name: 'Arthritis Care', members: 73 },
    { id: 'hypertension', name: 'Heart Health', members: 45 },
  ];

  // Initial mock messages
  const initialMessages: Message[] = [
    {
      id: '1',
      user_id: 'other-user-1',
      message: 'Hello everyone! How is everyone feeling today?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_email: 'sarah@example.com'
    },
    {
      id: '2',
      user_id: user?.id || 'dev-user-123',
      message: 'Hi Sarah! I\'m doing well, thanks for asking.',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      user_email: user?.email
    },
    {
      id: '3',
      user_id: 'other-user-2',
      message: 'Great to see everyone here supporting each other!',
      created_at: new Date(Date.now() - 900000).toISOString(),
      user_email: 'mike@example.com'
    }
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const sendMessage = async (message: string) => {
    console.log('Sending message:', message);
    
    // Create new message object
    const newMessage: Message = {
      id: Date.now().toString(), // Simple ID generation for demo
      user_id: user?.id || 'dev-user-123',
      message: message,
      created_at: new Date().toISOString(),
      user_email: user?.email
    };

    // Add message to local state
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    // When switching groups, you could load different messages here
    // For now, we'll keep the same messages for all groups
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p>Please log in to access the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <ChatHeader 
          groups={groups}
          selectedGroup={selectedGroup}
          onGroupChange={handleGroupChange}
        />
        
        <div className="flex-1 overflow-hidden">
          <MessagesList 
            messages={messages}
            loading={false}
            currentUserId={user.id}
          />
        </div>
        
        <MessageInput onSendMessage={sendMessage} />
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;
