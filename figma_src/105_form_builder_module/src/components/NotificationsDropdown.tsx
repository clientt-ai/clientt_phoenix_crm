import { useState } from 'react';
import { Bell, FileText, Globe, CheckCircle2, AlertCircle, TrendingUp, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

type Notification = {
  id: string;
  type: 'form_submission' | 'page_published' | 'milestone' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'form_submission',
    title: 'New Form Submission',
    message: 'Contact Us Form received a new submission',
    timestamp: '2 minutes ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'milestone',
    title: 'Milestone Reached',
    message: 'Newsletter Signup hit 1,000 submissions!',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'page_published',
    title: 'Landing Page Published',
    message: 'Product Launch 2024 is now live',
    timestamp: '3 hours ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'form_submission',
    title: 'New Form Submission',
    message: 'Event Registration received a new submission',
    timestamp: '5 hours ago',
    isRead: true,
  },
  {
    id: '5',
    type: 'alert',
    title: 'Low Conversion Rate',
    message: 'Quote Request form conversion dropped below 10%',
    timestamp: 'Yesterday',
    isRead: true,
  },
  {
    id: '6',
    type: 'form_submission',
    title: 'New Form Submission',
    message: 'Product Inquiry received a new submission',
    timestamp: 'Yesterday',
    isRead: true,
  },
];

type NotificationsDropdownProps = {
  onNavigate: (page: string) => void;
};

export function NotificationsDropdown({ onNavigate }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'form_submission':
        return <FileText className="w-4 h-4" />;
      case 'page_published':
        return <Globe className="w-4 h-4" />;
      case 'milestone':
        return <TrendingUp className="w-4 h-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'form_submission':
        return 'text-blue-500';
      case 'page_published':
        return 'text-green-500';
      case 'milestone':
        return 'text-purple-500';
      case 'alert':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 flex flex-col" align="end">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`px-4 py-3 hover:bg-muted transition-colors group relative ${
                        !notification.isRead ? 'bg-muted/50' : ''
                      }`}
                    >
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="w-full text-left"
                      >
                        <div className="flex gap-3">
                          <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm">{notification.title}</p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.timestamp}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
                          >
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </button>
                    </div>
                    {index < notifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border flex-shrink-0">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('Notifications');
              }}
              className="w-full px-4 py-3 text-center text-sm text-primary hover:bg-muted transition-colors"
            >
              View all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
