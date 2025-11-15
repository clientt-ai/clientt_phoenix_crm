import { useState } from 'react';
import image_b693f77e83051db5862967ace25f26d9b9c27404 from 'figma:asset/b693f77e83051db5862967ace25f26d9b9c27404.png';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  Calendar, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Users,
  FileCheck,
  CreditCard,
  Headphones,
  Lock,
  UserCircle,
  Contact,
  FileBarChart
} from 'lucide-react';

type MenuItem = {
  icon: any;
  label: string;
  badge?: string;
  disabled?: boolean;
};

type ModuleGroup = {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  disabled?: boolean;
  items: MenuItem[];
};

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
};

export function Sidebar({ activePage, onNavigate, isOpen }: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(['forms']);

  // Single-level menu items (always visible)
  const topLevelItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard' },
  ];

  // Module groups with sub-pages
  const moduleGroups: ModuleGroup[] = [
    {
      id: 'forms',
      label: 'Forms Portal',
      icon: FileText,
      items: [
        { icon: FileText, label: 'Forms' },
        { icon: Contact, label: 'Contacts' },
        { icon: Calendar, label: 'Calendar Integration' },
        { icon: MessageSquare, label: 'Chatbot' },
      ]
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      badge: 'Coming Soon',
      disabled: true,
      items: [
        { icon: Users, label: 'Contacts', disabled: true },
        { icon: FileText, label: 'Deals', disabled: true },
        { icon: BarChart3, label: 'Pipeline', disabled: true },
      ]
    },
    {
      id: 'cpq',
      label: 'CPQ',
      icon: FileCheck,
      badge: 'Coming Soon',
      disabled: true,
      items: [
        { icon: FileCheck, label: 'Quotes', disabled: true },
        { icon: FileText, label: 'Products', disabled: true },
        { icon: BarChart3, label: 'Reports', disabled: true },
      ]
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      badge: 'Coming Soon',
      disabled: true,
      items: [
        { icon: CreditCard, label: 'Invoices', disabled: true },
        { icon: FileText, label: 'Subscriptions', disabled: true },
        { icon: BarChart3, label: 'Revenue', disabled: true },
      ]
    },
    {
      id: 'customer-portal',
      label: 'Customer Portal',
      icon: UserCircle,
      badge: 'Coming Soon',
      disabled: true,
      items: [
        { icon: UserCircle, label: 'Portal Access', disabled: true },
        { icon: Settings, label: 'Portal Settings', disabled: true },
        { icon: FileText, label: 'Customer Views', disabled: true },
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: Headphones,
      badge: 'Coming Soon',
      disabled: true,
      items: [
        { icon: Headphones, label: 'Tickets', disabled: true },
        { icon: MessageSquare, label: 'Live Chat', disabled: true },
        { icon: FileText, label: 'Knowledge Base', disabled: true },
      ]
    },
  ];

  const toggleModule = (moduleId: string) => {
    if (moduleGroups.find(m => m.id === moduleId)?.disabled) return;
    
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <aside className={`w-64 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-20`}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1>
          <img 
            src={image_b693f77e83051db5862967ace25f26d9b9c27404} 
            alt="Clientt" 
            className="h-8 dark:brightness-0 dark:invert"
          />
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {/* Top Level Items */}
          {topLevelItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.label;
            return (
              <li key={item.label}>
                <button
                  onClick={() => onNavigate(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}

          {/* Module Groups */}
          {moduleGroups.map((module, moduleIndex) => {
            const ModuleIcon = module.icon;
            const isExpanded = expandedModules.includes(module.id);
            const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
            
            // Render Settings before locked modules
            const isFirstLockedModule = module.disabled && moduleGroups.findIndex(m => m.disabled) === moduleGroups.indexOf(module);
            
            return (
              <div key={`module-group-${module.id}`}>
                {/* Settings - appears before first locked module */}
                {isFirstLockedModule && (
                  <li key="settings" className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => onNavigate('Settings')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activePage === 'Settings'
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>
                  </li>
                )}
                
                <li key={module.id} className="mt-4 first:mt-2">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    disabled={module.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      module.disabled
                        ? 'text-muted-foreground/50 cursor-not-allowed'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <ModuleIcon className="w-5 h-5" />
                    <span className="flex-1 text-left">{module.label}</span>
                    {module.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {module.badge}
                      </span>
                    )}
                    {!module.disabled && (
                      <ChevronIcon className="w-4 h-4" />
                    )}
                    {module.disabled && (
                      <Lock className="w-4 h-4 opacity-30" />
                    )}
                  </button>

                  {/* Module Items (collapsible) */}
                  {isExpanded && !module.disabled && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {module.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = activePage === item.label;
                        return (
                          <li key={item.label}>
                            <button
                              onClick={() => !item.disabled && onNavigate(item.label)}
                              disabled={item.disabled}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                                isActive
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                  : item.disabled
                                  ? 'text-muted-foreground/50 cursor-not-allowed'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              </div>
            );
          })}

          {/* Settings (always at bottom) - REMOVE THIS SECTION */}
          {/* ... remove this code ... */}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={() => onNavigate('Settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground">
            JD
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </button>
      </div>
    </aside>
  );
}