import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileDropdown } from './ProfileDropdown';

type HeaderProps = {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: string, tab?: string) => void;
  profilePhoto: string | null;
  userName: string;
  userEmail: string;
  onHelpSupport?: () => void;
  onSignOut?: () => void;
};

export function Header({ onToggleSidebar, isSidebarOpen, searchQuery, onSearchChange, onNavigate, profilePhoto, userName, userEmail, onHelpSupport, onSignOut }: HeaderProps) {
  return (
    <header className={`h-16 bg-card border-b border-border fixed top-0 right-0 z-30 transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-0'}`}>
      <div className="h-full px-6 flex items-center justify-between">
        {/* Menu Toggle & Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <GlobalSearch 
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onNavigate={onNavigate}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationsDropdown onNavigate={onNavigate} />

          {/* User Profile Dropdown */}
          <ProfileDropdown 
            profilePhoto={profilePhoto}
            userName={userName}
            userEmail={userEmail}
            onNavigate={onNavigate}
            onHelpSupport={onHelpSupport}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  );
}