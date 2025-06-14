
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    await onSendMessage(message.trim());
    setMessage('');
  };

  return (
    <div className="p-4 bg-slate-800/90 backdrop-blur-lg border-t border-blue-500/20">
      <form onSubmit={handleSubmit} className="flex space-x-2">
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
  );
};

export default MessageInput;
