import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Calendar, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';

type Message = {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
};

type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
};

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Hi there 👋 Ready to book your free demo?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

const aiResponses = [
  "I'd be happy to help you schedule a demo! What time works best for you?",
  "Great! Our demo typically takes 30 minutes. Would you like to see a calendar of available slots?",
  "We offer demos Monday through Friday, 9 AM to 5 PM EST. What day works best for you?",
  "Perfect! I'll help you get that set up. Can I get your email address to send the confirmation?",
  "Our pricing starts at $49/month for the Starter plan. Would you like to see all plan details?",
  "The Enterprise plan includes advanced analytics, priority support, and custom integrations. Interested in learning more?",
];

type ChatbotWidgetProps = {
  autoOpen?: boolean;
  calendarConnected?: boolean;
};

export function ChatbotWidget({ autoOpen = false, calendarConnected = true }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCalendarAlert, setShowCalendarAlert] = useState(false);
  const [showPreConnectForm, setShowPreConnectForm] = useState(false);
  const [preConnectType, setPreConnectType] = useState<'pricing' | 'features' | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
  });
  const [userEmail, setUserEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scheduleLink = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0tu0VCKkbUPPvwxl0eLuGKaJn3DTw5IXwQ7hx79RbG_nSZQTEslK8k1iWxupZ5oW97Rs8KpCnC';

  const handleBookDemoClick = () => {
    if (!calendarConnected) {
      setShowCalendarAlert(true);
      setTimeout(() => setShowCalendarAlert(false), 5000);
    } else {
      // If user info already collected, skip email capture
      if (userInfo.email) {
        setUserEmail(userInfo.email);
        setEmailSubmitted(true);
      }
      setShowScheduleDialog(true);
    }
  };

  const handleQuickAction = (type: 'pricing' | 'features') => {
    setPreConnectType(type);
    setShowPreConnectForm(true);
  };

  const handleEmailSubmit = () => {
    if (userEmail && userEmail.includes('@')) {
      setEmailSubmitted(true);
    }
  };

  const handleCloseScheduleDialog = () => {
    setShowScheduleDialog(false);
    // Reset email state when closing (but keep userInfo)
    setTimeout(() => {
      if (!userInfo.email) {
        setEmailSubmitted(false);
        setUserEmail('');
      }
    }, 300);
  };

  const handlePreConnectSubmit = () => {
    // Validate required fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.email) {
      return;
    }

    // Close the pre-connect form
    setShowPreConnectForm(false);

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: preConnectType === 'pricing' ? '💰 Pricing' : '✨ Features',
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response based on type
    setTimeout(() => {
      let aiText = '';
      if (preConnectType === 'pricing') {
        aiText = `Thanks ${userInfo.firstName}! Here's our pricing:\n\n💎 Starter - $49/month\n• 5 forms\n• 1,000 submissions/mo\n• Basic analytics\n\n🚀 Pro - $99/month\n• Unlimited forms\n• 10,000 submissions/mo\n• Advanced analytics\n• Priority support\n\n🏢 Enterprise - Custom\n• Everything in Pro\n• Custom integrations\n• Dedicated support\n• SLA guarantee\n\nInterested in a demo?`;
      } else {
        aiText = `Great to meet you, ${userInfo.firstName}! Here are our key features:\n\n✨ AI-Powered Forms\n• Smart field suggestions\n• Auto-completion\n• Lead scoring\n\n📊 Advanced Analytics\n• Real-time dashboards\n• Conversion tracking\n• A/B testing\n\n🔗 Integrations\n• Calendar sync\n• CRM connections\n• Email automation\n\n📅 Want to see it in action? Book a demo!`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollContainerRef.current) {
      const scrollElement = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response after a delay
    setTimeout(() => {
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-50 animate-pulse"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-primary-foreground">Clientt Assistant</h3>
            <p className="text-primary-foreground/80">Online now</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-primary-foreground/20 rounded transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={message.sender === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                  {message.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.sender === 'ai'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p className={message.sender === 'user' ? 'text-primary-foreground' : ''}>{message.text}</p>
                <p className={`mt-1 ${message.sender === 'ai' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                  {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-b bg-muted/30">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={handleBookDemoClick}
            className="px-3 py-1.5 rounded-full bg-background border border-border hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
          >
            📅 Book a demo
          </button>
          <button
            onClick={() => handleQuickAction('pricing')}
            className="px-3 py-1.5 rounded-full bg-background border border-border hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
          >
            💰 Pricing
          </button>
          <button
            onClick={() => handleQuickAction('features')}
            className="px-3 py-1.5 rounded-full bg-background border border-border hover:bg-muted transition-colors whitespace-nowrap flex-shrink-0"
          >
            ✨ Features
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about our demo or pricing..."
            className="flex-1"
            autoFocus={isOpen}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Not Connected Alert */}
      {showCalendarAlert && (
        <div className="absolute bottom-full mb-2 left-0 right-0 px-4">
          <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-900 dark:text-orange-100">
              Please connect a calendar in <a href="#" className="font-medium underline">Settings</a> first to enable demo bookings.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={handleCloseScheduleDialog}>
        <DialogContent className={emailSubmitted ? "sm:max-w-[900px] max-h-[90vh] p-0" : "sm:max-w-[500px] p-6"}>
          {!emailSubmitted ? (
            // Email Capture Step
            <>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl">
                  {userInfo.firstName ? `Let's get you scheduled, ${userInfo.firstName}!` : "Let's get you scheduled!"}
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {userInfo.email 
                    ? `We'll send your invite and confirmation to ${userInfo.email}`
                    : "First enter your email so we know where to send your invite and confirmation."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {!userInfo.email && (
                  <div>
                    <label htmlFor="email" className="block mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="me@company.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && userEmail.includes('@')) {
                          handleEmailSubmit();
                        }
                      }}
                      className="w-full"
                      autoFocus
                    />
                  </div>
                )}
                
                <Button
                  onClick={handleEmailSubmit}
                  disabled={!userInfo.email && !userEmail.includes('@')}
                  className="w-full"
                  style={{
                    background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
                  }}
                >
                  {userInfo.email ? 'Continue to Calendar →' : 'Confirm'}
                </Button>
                
                {!userInfo.email && (
                  <p className="text-xs text-muted-foreground">
                    By providing your email, you agree that Clientt may use your information for personalization and advertising as set forth in our Privacy Policy.
                  </p>
                )}
              </div>
            </>
          ) : (
            // Calendar Scheduling Step
            <>
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle>Schedule Your Demo</DialogTitle>
                </div>
                <DialogDescription>
                  Choose a convenient time for your personalized demo with our team
                </DialogDescription>
              </DialogHeader>
              
              <div className="w-full h-[600px] px-6 pb-6">
                <iframe
                  src={scheduleLink}
                  className="w-full h-full rounded-lg border border-border"
                  frameBorder="0"
                  title="Schedule Demo"
                />
              </div>

              <div className="p-6 pt-0 border-t">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Can't find a suitable time? <a href={scheduleLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Open in new window <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <Button variant="outline" onClick={handleCloseScheduleDialog}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pre-Connect Form Modal */}
      <Dialog open={showPreConnectForm} onOpenChange={setShowPreConnectForm}>
        <DialogContent className="sm:max-w-[480px] p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#ec4899]" />
              <DialogTitle className="text-2xl">
                {preConnectType === 'pricing' ? 'View Pricing' : 'Explore Features'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base">
              ✨ Great! Before we show {preConnectType === 'pricing' ? 'pricing details' : 'feature highlights'}, just a few quick questions so we can personalize your experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={userInfo.firstName}
                  onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={userInfo.lastName}
                  onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preConnectEmail">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="preConnectEmail"
                type="email"
                placeholder="john@company.com"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userInfo.firstName && userInfo.lastName && userInfo.email.includes('@')) {
                    handlePreConnectSubmit();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={userInfo.company}
                onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userInfo.firstName && userInfo.lastName && userInfo.email.includes('@')) {
                    handlePreConnectSubmit();
                  }
                }}
              />
            </div>
            
            <Button
              onClick={handlePreConnectSubmit}
              disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.email.includes('@')}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
              }}
            >
              Continue →
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              We'll use this info to personalize your experience
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
