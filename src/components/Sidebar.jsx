import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Code2, 
  GitBranch, 
  Folder, 
  LayoutGrid, 
  UserCircle,
  AlertCircle,
  Terminal as TerminalIcon
} from 'lucide-react';
import UserMenu from './UserMenu';
import UserAvatar from './UserAvatar';

const ActivityBar = ({ activePanels, onTogglePanel }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const items = [
    { id: 'explorer', icon: Folder, label: 'Explorer' },
    { id: 'problems', icon: AlertCircle, label: 'Problems' },
    { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
  ];

  return (
    <div className="w-12 bg-[#1e1e1e] flex flex-col items-center py-4 shrink-0 border-r border-white/5 relative">
      <div className="flex flex-col space-y-4 flex-1 w-full">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTogglePanel?.(item.id)}
            className={`w-full py-2 transition-all duration-200 group relative flex justify-center ${
              activePanels[item.id] 
                ? 'text-white' 
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            title={item.label}
          >
            {activePanels[item.id] && (
              <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
            <item.icon size={22} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <div className="flex flex-col space-y-4 items-center w-full">
        <div className="relative w-full flex justify-center">
          <UserAvatar 
            onClick={() => setShowUserMenu(!showUserMenu)}
            size="sm"
          />
          
          <div className="absolute left-full ml-2 bottom-0 z-[1000]">
            <UserMenu isOpen={showUserMenu} onClose={() => setShowUserMenu(false)} className="left-0 bottom-0" />
          </div>
        </div>

        <button 
          onClick={() => navigate('/workspaces')}
          className="text-[#858585] hover:text-[#cccccc] p-2 transition-colors"
          title="Back to Workspaces"
        >
          <LayoutGrid size={22} strokeWidth={1.5} />
        </button>
      </div>

      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[999]" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default ActivityBar;
