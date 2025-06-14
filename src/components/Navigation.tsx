
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-health-primary/20 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center py-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all ${
                location.pathname === path
                  ? 'text-health-primary bg-health-primary/10'
                  : 'text-health-muted hover:text-health-secondary'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
