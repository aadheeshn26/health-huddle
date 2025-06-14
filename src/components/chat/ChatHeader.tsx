
import { Button } from '@/components/ui/button';

interface Group {
  id: string;
  name: string;
  members: number;
}

interface ChatHeaderProps {
  groups: Group[];
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
}

const ChatHeader = ({ groups, selectedGroup, onGroupChange }: ChatHeaderProps) => {
  return (
    <div className="bg-slate-800/90 backdrop-blur-lg p-4 border-b border-blue-500/20">
      <h1 className="text-xl font-bold text-white mb-3">Support Groups</h1>
      
      {/* Group Selector */}
      <div className="flex space-x-2 overflow-x-auto">
        {groups.map((group) => (
          <Button
            key={group.id}
            onClick={() => onGroupChange(group.id)}
            variant="ghost"
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGroup === group.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-gray-300 hover:bg-blue-600/20'
            }`}
          >
            {group.name}
            <span className="ml-1 text-xs opacity-70">({group.members})</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatHeader;
