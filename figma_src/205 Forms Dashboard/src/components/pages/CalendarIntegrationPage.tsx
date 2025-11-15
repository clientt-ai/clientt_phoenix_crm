import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar, Check, Info } from 'lucide-react';
import { toast } from 'sonner';

export function CalendarIntegrationPage() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [demoBookingEnabled, setDemoBookingEnabled] = useState(true);
  const [meetingDuration, setMeetingDuration] = useState('30');
  const [bufferTime, setBufferTime] = useState('15');
  const [advanceWindow, setAdvanceWindow] = useState('30');

  const handleGoogleConnect = () => {
    if (googleConnected) {
      setGoogleConnected(false);
      toast.success('Google Calendar disconnected');
    } else {
      setGoogleConnected(true);
      toast.success('Google Calendar connected successfully!');
    }
  };

  const handleOutlookConnect = () => {
    if (outlookConnected) {
      setOutlookConnected(false);
      toast.success('Outlook Calendar disconnected');
    } else {
      setOutlookConnected(true);
      toast.success('Outlook Calendar connected successfully!');
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[38px] mb-2">Calendar Integration</h1>
        <p className="text-muted-foreground">
          Connect your primary calendar to enable demo booking and scheduling across all forms. One master calendar can link to multiple forms.
        </p>
      </div>

      {/* Overview Section - Calendar Connections */}
      <div className="mb-6">
        <h2 className="mb-4">Connect Your Calendar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Google Calendar Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="mb-1">Google Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    Sync with Google Workspace
                  </p>
                </div>
              </div>
              {googleConnected && (
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <Button
              onClick={handleGoogleConnect}
              className={
                googleConnected
                  ? 'w-full bg-red-500 hover:bg-red-600 text-white'
                  : 'w-full bg-green-600 hover:bg-green-700 text-white'
              }
            >
              {googleConnected ? 'Disconnect' : 'Connect Google Calendar'}
            </Button>
          </Card>

          {/* Outlook Calendar Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1">Microsoft Outlook</h3>
                  <p className="text-sm text-muted-foreground">
                    Sync with Microsoft 365
                  </p>
                </div>
              </div>
              {outlookConnected && (
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <Button
              onClick={handleOutlookConnect}
              className={
                outlookConnected
                  ? 'w-full bg-red-500 hover:bg-red-600 text-white'
                  : 'w-full bg-green-600 hover:bg-green-700 text-white'
              }
            >
              {outlookConnected ? 'Disconnect' : 'Connect Outlook Calendar'}
            </Button>
          </Card>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Booking submissions are recorded to the database for manual integration (Phase 1).
          </p>
        </div>
      </div>

      {/* Configuration Section */}
      <Card className="p-6 mb-6">
        <h2 className="mb-4">Booking Configuration</h2>
        
        {/* Enable Demo Booking Toggle */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-base">Enable Demo Booking</Label>
              <div className="group relative">
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border z-10">
                  When turned off, users can submit forms without booking time slots.
                </div>
              </div>
            </div>
            <Switch
              checked={demoBookingEnabled}
              onCheckedChange={(checked) => {
                setDemoBookingEnabled(checked);
                toast.success(checked ? 'Demo booking enabled' : 'Demo booking disabled');
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {demoBookingEnabled
              ? 'Users can select available time slots when submitting forms'
              : 'Users can only submit forms without scheduling'}
          </p>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Default Meeting Duration */}
          <div>
            <Label className="mb-2 block">Default Meeting Duration</Label>
            <Select value={meetingDuration} onValueChange={setMeetingDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buffer Time */}
          <div>
            <Label className="mb-2 block">Buffer Time Between Meetings</Label>
            <Select value={bufferTime} onValueChange={setBufferTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advance Booking Window */}
          <div>
            <Label className="mb-2 block">Advance Booking Window</Label>
            <Select value={advanceWindow} onValueChange={setAdvanceWindow}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Information Section */}
      <Card className="p-6 bg-amber-500/5 border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="mb-2 text-amber-900 dark:text-amber-100">Phase 1 Implementation</h3>
            <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
              Phase 1 records selected booking times to the database. Future updates will include full calendar API syncing with automatic event creation and real-time availability checking.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
