
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import ChatHeader from '@/components/chat/ChatHeader';
import MessagesList from '@/components/chat/MessagesList';
import MessageInput from '@/components/chat/MessageInput';
import { useChatMessages } from '@/components/chat/useChatMessages';

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

  const { messages, loading, sendMessage } = useChatMessages(selectedGroup, user?.id);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
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
        <ChatHeader 
          groups={groups}
          selectedGroup={selectedGroup}
          onGroupChange={handleGroupChange}
        />
        
        <MessagesList 
          messages={messages}
          loading={loading}
          currentUserId={user.id}
        />
        
        <MessageInput onSendMessage={sendMessage} />
      </div>

      <Navigation />
    </div>
  );
};

export default Chat;
