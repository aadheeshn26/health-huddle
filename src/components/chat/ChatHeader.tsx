
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
    <div className="bg-gray-900 border-b border-gray-800 p-4">
      <h1 className="text-xl font-bold text-white mb-3">Support Groups</h1>
      
      {/* Group Selector */}
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Button
            key={group.id}
            onClick={() => onGroupChange(group.id)}
            variant="ghost"
            size="sm"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGroup === group.id
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
