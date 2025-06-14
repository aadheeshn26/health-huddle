
import { Card } from '@/components/ui/card';

interface MessageProps {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_email?: string;
  currentUserId?: string;
}

const Message = ({ user_id, message, created_at, user_email, currentUserId }: MessageProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserDisplayName = () => {
    if (user_id === currentUserId) return 'You';
    return user_email?.split('@')[0] || 'Unknown User';
  };

  const isCurrentUser = user_id === currentUserId;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <Card className={`max-w-[80%] p-3 ${
        isCurrentUser
          ? 'bg-blue-600 text-white border-blue-500'
          : 'bg-slate-800/50 border-slate-700 text-white'
      }`}>
        {!isCurrentUser && (
          <div className="text-xs text-blue-400 font-medium mb-1">
            {getUserDisplayName()}
          </div>
        )}
        <div className="text-sm">{message}</div>
        <div className={`text-xs mt-1 ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-400'
        }`}>
          {formatTime(created_at)}
        </div>
      </Card>
    </div>
  );
};

export default Message;
