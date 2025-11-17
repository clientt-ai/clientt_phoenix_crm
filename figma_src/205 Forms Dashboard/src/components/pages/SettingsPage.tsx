import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User, Bell, Shield, CreditCard, Palette, Zap, Plug, Calendar, MessageSquare, CheckCircle2, ChevronDown, ExternalLink, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TeamCalendarPage } from './TeamCalendarPage';
import { TwoFactorSetup, TwoFactorDisable } from '../TwoFactorSetup';
import { toast } from 'sonner';

type SettingsPageProps = {
  profilePhoto: string | null;
  onProfilePhotoChange: (photo: string | null) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  userEmail: string;
  onUserEmailChange: (email: string) => void;
  initialTab?: string;
  googleConnected: boolean;
  onGoogleConnectedChange: (connected: boolean) => void;
  outlookConnected: boolean;
  onOutlookConnectedChange: (connected: boolean) => void;
  chatbotEnabled: boolean;
  onChatbotEnabledChange: (enabled: boolean) => void;
};

export function SettingsPage({ 
  profilePhoto, 
  onProfilePhotoChange, 
  userName, 
  onUserNameChange, 
  userEmail, 
  onUserEmailChange, 
  initialTab = 'profile',
  googleConnected,
  onGoogleConnectedChange,
  outlookConnected,
  onOutlookConnectedChange,
  chatbotEnabled,
  onChatbotEnabledChange
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(true);
  const [chatbotDemoButton, setChatbotDemoButton] = useState(true);
  const [firstName, setFirstName] = useState(userName.split(' ')[0] || 'John');
  const [lastName, setLastName] = useState(userName.split(' ')[1] || 'Doe');
  const [currentEmail, setCurrentEmail] = useState(userEmail);
  const [company, setCompany] = useState('Clientt');
  const [bio, setBio] = useState('Product manager passionate about creating amazing user experiences.');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      toast.success('Dark mode enabled');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      toast.success('Light mode enabled');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      toast.success('System theme applied');
    }
  }, [theme]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onProfilePhotoChange(reader.result as string);
        toast.success('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onProfilePhotoChange(null);
    toast.success('Profile photo removed');
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = () => {
    const newUserName = `${firstName} ${lastName}`;
    onUserNameChange(newUserName);
    onUserEmailChange(currentEmail);
    toast.success('Profile updated successfully!');
  };

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-2 text-[38px] font-bold">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your personal and company settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tabs List with Two Sections */}
        <div className="mb-8 space-y-6">
          {/* User Settings Section */}
          <div>
            <div className="mb-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                User Settings
              </p>
            </div>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Company Settings Section */}
          <div>
            <div className="mb-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Company Settings
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Company-level settings affect all users
              </p>
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Team Calendar
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Integrations
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="mb-1">Profile Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your account profile information and email address
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="mr-2" onClick={handleChangePhotoClick}>
                    Change Photo
                  </Button>
                  <Button variant="ghost" onClick={handleRemovePhoto} disabled={!profilePhoto}>
                    Remove
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={currentEmail} onChange={(e) => setCurrentEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Calendar Integration */}
            <Card className="p-6">
              <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="mb-1 flex items-center gap-2">
                        Calendar Integration
                        {(googleConnected || outlookConnected) && (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Connect your calendar to sync bookings and demos
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${calendarOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-6 space-y-6">
                    {/* Calendar Provider Selection */}
                    <div>
                      <Label className="mb-3 block">Calendar Provider</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Google Calendar */}
                        <div className={`p-4 rounded-lg border-2 transition-all ${googleConnected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-border flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium">Google Calendar</p>
                                <p className="text-xs text-muted-foreground">Sync with Google</p>
                              </div>
                            </div>
                            {googleConnected && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                          </div>
                          <Button
                            onClick={() => onGoogleConnectedChange(!googleConnected)}
                            className="w-full"
                            variant={googleConnected ? "outline" : "default"}
                            style={!googleConnected ? {
                              background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
                            } : undefined}
                          >
                            {googleConnected ? 'Disconnect' : 'Connect Account'}
                          </Button>
                        </div>

                        {/* Microsoft Outlook */}
                        <div className={`p-4 rounded-lg border-2 transition-all ${outlookConnected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-border flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                  <path fill="#0078D4" d="M23 5.37v13.26a1.37 1.37 0 0 1-1.37 1.37H13.5V4h8.13A1.37 1.37 0 0 1 23 5.37z"/>
                                  <path fill="#0364B8" d="M13.5 4v16H2.37A1.37 1.37 0 0 1 1 18.63V5.37A1.37 1.37 0 0 1 2.37 4z"/>
                                  <path fill="#FFF" d="M7.5 9.5h5v1.5h-5zm0 3h5V14h-5z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium">Microsoft Outlook</p>
                                <p className="text-xs text-muted-foreground">Sync with Outlook</p>
                              </div>
                            </div>
                            {outlookConnected && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                          </div>
                          <Button
                            onClick={() => onOutlookConnectedChange(!outlookConnected)}
                            className="w-full"
                            variant={outlookConnected ? "outline" : "default"}
                            style={!outlookConnected ? {
                              background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
                            } : undefined}
                          >
                            {outlookConnected ? 'Disconnect' : 'Connect Account'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(googleConnected || outlookConnected) && (
                      <>
                        <Separator />

                        {/* Calendar Settings */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="teamCalendar">Team Calendar</Label>
                            <Select defaultValue="main">
                              <SelectTrigger id="teamCalendar">
                                <SelectValue placeholder="Select calendar" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="main">Main Calendar</SelectItem>
                                <SelectItem value="sales">Sales Team Calendar</SelectItem>
                                <SelectItem value="support">Support Calendar</SelectItem>
                                <SelectItem value="demos">Demo Calendar</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Choose which calendar to sync bookings to
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="eventTitle">Booking Event Title</Label>
                            <Input
                              id="eventTitle"
                              defaultValue="Demo with Clientt user"
                              placeholder="e.g., Demo with {{user_name}}"
                            />
                            <p className="text-xs text-muted-foreground">
                              Customize how bookings appear on your calendar
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p>Send confirmation to team inbox</p>
                              <p className="text-sm text-muted-foreground">
                                Forward booking confirmations to team@clientt.com
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmationEmail">Confirmation Email</Label>
                            <Input
                              id="confirmationEmail"
                              type="email"
                              defaultValue="bookings@clientt.com"
                              placeholder="team@company.com"
                            />
                            <p className="text-xs text-muted-foreground">
                              Email address to receive booking confirmations
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline">Cancel</Button>
                          <Button style={{
                            background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
                          }}>
                            Save Calendar Settings
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Chatbot Settings */}
            <Card className="p-6">
              <Collapsible open={chatbotOpen} onOpenChange={setChatbotOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ec4899]/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[#ec4899]" />
                    </div>
                    <div className="text-left">
                      <h3 className="mb-1 flex items-center gap-2">
                        Chatbot Settings
                        {chatbotEnabled && (
                          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your sales chatbot widget and demo booking behavior
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${chatbotOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-6 space-y-6">
                    {/* Chatbot Status */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Enable Chatbot Widget</p>
                        <p className="text-sm text-muted-foreground">
                          Show the chatbot widget on your forms and landing pages
                        </p>
                      </div>
                      <Switch
                        checked={chatbotEnabled}
                        onCheckedChange={onChatbotEnabledChange}
                      />
                    </div>

                    {chatbotEnabled && (
                      <>
                        <Separator />

                        {/* Chatbot Configuration */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="chatbotName">Chatbot Name</Label>
                            <Input
                              id="chatbotName"
                              defaultValue="Clientt Assistant"
                              placeholder="Enter chatbot name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="greetingMessage">Greeting Message</Label>
                            <textarea
                              id="greetingMessage"
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                              defaultValue="Hi there 👋 Ready to book your free demo?"
                            />
                            <p className="text-xs text-muted-foreground">
                              First message users see when opening the chatbot
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="triggerPage">Trigger Page</Label>
                            <Select defaultValue="all">
                              <SelectTrigger id="triggerPage">
                                <SelectValue placeholder="Select trigger" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Pages</SelectItem>
                                <SelectItem value="forms">Form Pages Only</SelectItem>
                                <SelectItem value="landing">Landing Pages Only</SelectItem>
                                <SelectItem value="contact">Contact Form</SelectItem>
                                <SelectItem value="pricing">Pricing Page</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Choose which pages display the chatbot widget
                            </p>
                          </div>

                          <Separator />

                          {/* Demo Booking Settings */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Enable Demo Booking Button</p>
                                <p className="text-sm text-muted-foreground">
                                  Show "Book a demo" quick action in chatbot
                                </p>
                              </div>
                              <Switch
                                checked={chatbotDemoButton}
                                onCheckedChange={setChatbotDemoButton}
                              />
                            </div>

                            {chatbotDemoButton && (
                              <>
                                {!(googleConnected || outlookConnected) && (
                                  <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      Calendar integration required. <a href="#" className="text-primary hover:underline font-medium">Connect a calendar above</a> to enable demo bookings.
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="confirmationDestination">Demo Confirmation Routing</Label>
                                  <Select defaultValue="email">
                                    <SelectTrigger id="confirmationDestination">
                                      <SelectValue placeholder="Select destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="email">Email Notification</SelectItem>
                                      <SelectItem value="internal">Internal Dashboard Only</SelectItem>
                                      <SelectItem value="both">Email + Dashboard</SelectItem>
                                      <SelectItem value="slack">Slack Channel (Coming Soon)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    Where should demo booking confirmations be sent?
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="notificationEmail">Notification Email</Label>
                                  <Input
                                    id="notificationEmail"
                                    type="email"
                                    defaultValue="sales@clientt.com"
                                    placeholder="sales@company.com"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Email address to receive demo booking notifications
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline">Cancel</Button>
                          <Button style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                          }}>
                            Save Chatbot Settings
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* CTA Banner - Navigate to Team Calendar */}
            <Card 
              className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-primary/20"
              onClick={() => setActiveTab('calendar')}
              style={{
                background: 'linear-gradient(135deg, rgba(34, 120, 192, 0.05) 0%, rgba(26, 95, 153, 0.05) 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
                  }}>
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1">Manage Your Team's Availability</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure booking hours, team members, and availability settings
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('calendar');
                  }}
                >
                  Go to Team Calendar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Developer Reference Card */}
            <Card className="p-6 border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="mb-2">🧩 Integration Settings Handoff Notes</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>API Endpoints (Mock):</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">POST /api/auth/google/calendar</code> - Google OAuth flow</li>
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">POST /api/auth/microsoft/calendar</code> - Microsoft OAuth flow</li>
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">GET /api/calendar/availability</code> - Fetch available slots</li>
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">POST /api/bookings/create</code> - Create new booking</li>
                    </ul>
                    <p className="mt-3"><strong>Data Flow:</strong></p>
                    <p>Form submission → Chatbot trigger → Email capture → Booking modal → Calendar sync → Confirmation email</p>
                    <p className="mt-3"><strong>State Management:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">connected</code> - Calendar successfully linked</li>
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">disconnected</code> - No calendar connected</li>
                      <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">error</code> - Connection or sync error</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Team Calendar Settings */}
        <TabsContent value="calendar">
          <TeamCalendarPage />
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="mb-1">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want to be notified about activity
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p>Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your forms and submissions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>New Submission Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone submits a form
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Weekly Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your form performance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Marketing Communications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive tips, best practices, and product updates
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>AI Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered recommendations and insights
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="mb-1">Security Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your password and security preferences
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Button className="bg-primary hover:bg-primary/90 text-white">
                Update Password
              </Button>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!twoFactorEnabled) {
                      setShowTwoFactorSetup(true);
                    } else {
                      setShowTwoFactorDisable(true);
                    }
                  }}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <Separator />

              <div>
                <p className="mb-2">Active Sessions</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your active sessions across devices
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm">MacBook Pro • Chrome</p>
                      <p className="text-xs text-muted-foreground">Current session • San Francisco, CA</p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="mb-1">Billing & Subscription</h3>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and payment methods
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Current Plan</p>
                    <h3 className="text-2xl mt-1">Pro Plan</h3>
                  </div>
                  <Zap className="w-8 h-8" />
                </div>
                <p className="text-sm opacity-90 mb-4">
                  $49/month • Renews on Dec 1, 2025
                </p>
                <Button variant="secondary" className="w-full">
                  Upgrade to Enterprise
                </Button>
              </div>

              <Separator />

              <div>
                <p className="mb-4">Payment Method</p>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm">•••• •••• •••• 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-4">Billing History</p>
                <div className="space-y-2">
                  {[
                    { date: 'Nov 1, 2025', amount: '$49.00', status: 'Paid' },
                    { date: 'Oct 1, 2025', amount: '$49.00', status: 'Paid' },
                    { date: 'Sep 1, 2025', amount: '$49.00', status: 'Paid' },
                  ].map((invoice) => (
                    <div
                      key={invoice.date}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm">{invoice.date}</p>
                        <p className="text-xs text-muted-foreground">Pro Plan</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm">{invoice.amount}</p>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {invoice.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="mb-1">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how Clientt looks and feels
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    className="p-4 rounded-lg border-2 transition-all"
                    style={theme === 'light' ? {
                      borderColor: 'var(--primary)',
                      backgroundColor: 'var(--primary-5)',
                    } : undefined}
                    onClick={() => setTheme('light')}
                  >
                    <div className="w-full h-24 rounded bg-gradient-to-br from-white to-gray-100 mb-3" />
                    <p className="text-sm">Light</p>
                  </button>
                  <button
                    className="p-4 rounded-lg border-2 transition-all"
                    style={theme === 'dark' ? {
                      borderColor: 'var(--primary)',
                      backgroundColor: 'var(--primary-5)',
                    } : undefined}
                    onClick={() => setTheme('dark')}
                  >
                    <div className="w-full h-24 rounded bg-gradient-to-br from-gray-900 to-black mb-3" />
                    <p className="text-sm">Dark</p>
                  </button>
                  <button
                    className="p-4 rounded-lg border-2 transition-all"
                    style={theme === 'system' ? {
                      borderColor: 'var(--primary)',
                      backgroundColor: 'var(--primary-5)',
                    } : undefined}
                    onClick={() => setTheme('system')}
                  >
                    <div className="w-full h-24 rounded bg-gradient-to-br from-white via-gray-500 to-black mb-3" />
                    <p className="text-sm">System</p>
                  </button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Compact Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Show more content by reducing spacing
                  </p>
                </div>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p>Show Animations</p>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch
                  checked={showAnimations}
                  onCheckedChange={setShowAnimations}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Two-Factor Authentication Dialogs */}
      <TwoFactorSetup
        open={showTwoFactorSetup}
        onOpenChange={setShowTwoFactorSetup}
        onComplete={() => setTwoFactorEnabled(true)}
      />

      <TwoFactorDisable
        open={showTwoFactorDisable}
        onOpenChange={setShowTwoFactorDisable}
        onConfirm={() => setTwoFactorEnabled(false)}
      />
    </div>
  );
}