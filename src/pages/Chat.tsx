
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

// Define separate message histories for each group
const initialGroupMessages: Record<string, Message[]> = {
  general: [
    {
      id: '1',
      user_id: 'other-user-1',
      message: 'Hello everyone! How is everyone feeling today?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_email: 'sarah@example.com'
    },
    {
      id: '2',
      user_id: 'dev-user-123',
      message: 'Hi Sarah! I\'m doing well, thanks for asking.',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      user_email: 'dev@example.com'
    }
  ],
  diabetes: [
    {
      id: '3',
      user_id: 'other-user-3',
      message: 'Anyone have tips for managing blood sugar levels?',
      created_at: new Date(Date.now() - 2400000).toISOString(),
      user_email: 'john@example.com'
    }
  ],
  anxiety: [
    {
      id: '4',
      user_id: 'other-user-4',
      message: 'Breathing exercises have really helped me lately.',
      created_at: new Date(Date.now() - 1200000).toISOString(),
      user_email: 'emma@example.com'
    }
  ],
  arthritis: [
    {
      id: '5',
      user_id: 'other-user-5',
      message: 'What exercises work best for joint pain?',
      created_at: new Date(Date.now() - 3000000).toISOString(),
      user_email: 'mike@example.com'
    }
  ],
  hypertension: [
    {
      id: '6',
      user_id: 'other-user-6',
      message: 'Diet changes have made a huge difference for me.',
      created_at: new Date(Date.now() - 1500000).toISOString(),
      user_email: 'lisa@example.com'
    }
  ]
};

const Chat = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('general');
  const [groupMessages, setGroupMessages] = useState<Record<string, Message[]>>(initialGroupMessages);

  const groups = [
    { id: 'general', name: 'General Support', members: 234 },
    { id: 'diabetes', name: 'Diabetes Care', members: 89 },
    { id: 'anxiety', name: 'Anxiety Support', members: 156 },
    { id: 'arthritis', name: 'Arthritis Care', members: 73 },
    { id: 'hypertension', name: 'Heart Health', members: 45 },
  ];

  const sendMessage = async (message: string) => {
    console.log('Sending message to group:', selectedGroup, message);
    
    // Create new message object
    const newMessage: Message = {
      id: Date.now().toString(), // Simple ID generation for demo
      user_id: user?.id || 'dev-user-123',
      message: message,
      created_at: new Date().toISOString(),
      user_email: user?.email
    };

    // Add message to the current group's chat history
    setGroupMessages(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), newMessage]
    }));
  };

  const handleGroupChange = (groupId: string) => {
    console.log('Switching to group:', groupId);
    setSelectedGroup(groupId);
    
    // Initialize empty message array for new groups if they don't exist
    if (!groupMessages[groupId]) {
      setGroupMessages(prev => ({
        ...prev,
        [groupId]: []
      }));
    }
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

  // Get messages for the currently selected group
  const currentMessages = groupMessages[selectedGroup] || [];

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
            messages={currentMessages}
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
