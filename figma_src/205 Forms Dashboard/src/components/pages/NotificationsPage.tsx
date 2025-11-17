import { useState } from 'react';
import { Bell, FileText, Globe, CheckCircle2, AlertCircle, TrendingUp, X, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

type Notification = {
  id: string;
  type: 'form_submission' | 'page_published' | 'milestone' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
};

const allNotifications: Notification[] = [
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
  {
    id: '7',
    type: 'milestone',
    title: 'Conversion Milestone',
    message: 'Spring Sale Campaign reached 1,500 conversions',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '8',
    type: 'page_published',
    title: 'Landing Page Updated',
    message: 'Free Trial Signup page has been updated',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '9',
    type: 'form_submission',
    title: 'New Form Submission',
    message: 'Job Application received a new submission',
    timestamp: '3 days ago',
    isRead: true,
  },
  {
    id: '10',
    type: 'alert',
    title: 'Form Performance Alert',
    message: 'Support Ticket form has unusually high abandonment rate',
    timestamp: '3 days ago',
    isRead: true,
  },
  {
    id: '11',
    type: 'form_submission',
    title: 'New Form Submission',
    message: 'Customer Feedback received a new submission',
    timestamp: '4 days ago',
    isRead: true,
  },
  {
    id: '12',
    type: 'milestone',
    title: 'User Milestone',
    message: 'Your account has reached 5,000 total form submissions!',
    timestamp: '5 days ago',
    isRead: true,
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const displayNotifications = filter === 'all' ? notifications : unreadNotifications;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'form_submission':
        return <FileText className="w-5 h-5" />;
      case 'page_published':
        return <Globe className="w-5 h-5" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'form_submission':
        return 'bg-[#2278c0]/10 text-[#2278c0] dark:bg-[#2278c0]/20';
      case 'page_published':
        return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400';
      case 'milestone':
        return 'bg-[#ec4899]/10 text-[#ec4899] dark:bg-[#ec4899]/20';
      case 'alert':
        return 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1>Notifications</h1>
          {unreadNotifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-[#2278c0] to-[#1a5f99] text-white hover:opacity-90 transition-opacity"
            >
              Mark all as read
            </button>
          )}
        </div>
        <p className="text-muted-foreground">
          Stay updated with all your form and landing page activities
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
          <Badge variant="secondary" className="ml-2">
            {notifications.length}
          </Badge>
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Unread
          {unreadNotifications.length > 0 && (
            <Badge className="ml-2 bg-[#ec4899] text-white">
              {unreadNotifications.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {displayNotifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                {filter === 'unread'
                  ? "You don't have any unread notifications"
                  : 'No notifications to display'}
              </p>
            </div>
          </Card>
        ) : (
          displayNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-primary bg-muted/30' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-sm">{notification.title}</h3>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors group"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-[#2278c0]" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors group"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
