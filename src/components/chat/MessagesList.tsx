
import { useRef, useEffect } from 'react';
import Message from './Message';

interface MessageData {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_flagged?: boolean;
  flagged_reason?: string;
  user_email?: string;
}

interface MessagesListProps {
  messages: MessageData[];
  loading: boolean;
  currentUserId?: string;
}

const MessagesList = ({ messages, loading, currentUserId }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-240px)] overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-240px)] overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <Message
          key={msg.id}
          {...msg}
          currentUserId={currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
