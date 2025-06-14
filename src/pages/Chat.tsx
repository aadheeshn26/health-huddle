
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: 'Sarah M.',
      content: 'Has anyone tried the new meditation app? Really helping with my anxiety.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isOwn: false,
    },
    {
      id: '2',
      user: 'Mike R.',
      content: 'Yes! Been using it for 2 weeks. The sleep stories are amazing.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isOwn: false,
    },
    {
      id: '3',
      user: 'You',
      content: 'Thanks for the recommendation! Just downloaded it.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isOwn: true,
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const groups = [
    { id: 'general', name: 'General Support', members: 234 },
    { id: 'anxiety', name: 'Anxiety Support', members: 156 },
    { id: 'diabetes', name: 'Diabetes Care', members: 89 },
    { id: 'fitness', name: 'Fitness & Wellness', members: 203 },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      user: 'You',
      content: message,
      timestamp: new Date(),
      isOwn: true,
    };

    console.log('Sending message:', newMessage);
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    toast({
      title: "Message sent!",
      description: "Your message has been shared with the group.",
    });

    // Simulate a response after 2 seconds
    setTimeout(() => {
      const responses = [
        "That's really helpful, thank you for sharing!",
        "I've been wondering about that too.",
        "Hope you're feeling better today! 💙",
        "Thanks for the update, keep us posted!",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        user: 'Community Member',
        content: randomResponse,
        timestamp: new Date(),
        isOwn: false,
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen health-gradient pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-health-darker/90 backdrop-blur-lg p-4 border-b border-health-primary/20">
          <h1 className="text-xl font-bold text-white mb-3">Support Groups</h1>
          
          {/* Group Selector */}
          <div className="flex space-x-2 overflow-x-auto">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGroup === group.id
                    ? 'bg-health-primary text-white'
                    : 'bg-health-dark/50 text-gray-300 hover:bg-health-primary/20'
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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] p-3 ${
                msg.isOwn
                  ? 'bg-health-primary text-white'
                  : 'bg-health-darker/50 border-health-primary/20 text-white'
              }`}>
                {!msg.isOwn && (
                  <div className="text-xs text-health-secondary font-medium mb-1">
                    {msg.user}
                  </div>
                )}
                <div className="text-sm">{msg.content}</div>
                <div className={`text-xs mt-1 ${
                  msg.isOwn ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {formatTime(msg.timestamp)}
                </div>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-health-darker/90 backdrop-blur-lg border-t border-health-primary/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-health-dark/50 border-health-primary/30 text-white placeholder-gray-400 focus:border-health-primary"
            />
            <Button
              type="submit"
              className="bg-health-primary hover:bg-health-accent text-white px-6"
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
