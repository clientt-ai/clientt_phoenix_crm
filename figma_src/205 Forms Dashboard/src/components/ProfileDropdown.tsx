import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, Settings, LogOut, CreditCard, HelpCircle } from 'lucide-react';

type ProfileDropdownProps = {
  profilePhoto: string | null;
  userName: string;
  userEmail: string;
  onNavigate: (page: string, tab?: string) => void;
  onHelpSupport?: () => void;
  onSignOut?: () => void;
};

export function ProfileDropdown({ profilePhoto, userName, userEmail, onNavigate, onHelpSupport, onSignOut }: ProfileDropdownProps) {
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none">
          <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
            <AvatarImage src={profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onNavigate('Settings', 'profile')} className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate('Settings', 'security')} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onNavigate('Settings', 'billing')} className="cursor-pointer">
          <CreditCard className="w-4 h-4 mr-2" />
          Billing & Plans
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onHelpSupport} className="cursor-pointer">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
