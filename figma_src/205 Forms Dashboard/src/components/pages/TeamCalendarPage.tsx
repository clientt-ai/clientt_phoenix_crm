import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, Users, Plus, X, Info, CalendarCheck, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

type TimeSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
};

export function TeamCalendarPage() {
  const [defaultDuration, setDefaultDuration] = useState('30');
  const [bufferTime, setBufferTime] = useState('15');
  const [advanceBooking, setAdvanceBooking] = useState('30');
  const [minNotice, setMinNotice] = useState('4');
  const [timezone, setTimezone] = useState('America/New_York');
  
  const [weeklyHours, setWeeklyHours] = useState<TimeSlot[]>([
    { id: '1', day: 'Monday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: '2', day: 'Tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: '3', day: 'Wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: '4', day: 'Thursday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: '5', day: 'Friday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: '6', day: 'Saturday', startTime: '09:00', endTime: '17:00', enabled: false },
    { id: '7', day: 'Sunday', startTime: '09:00', endTime: '17:00', enabled: false },
  ]);

  const toggleDay = (id: string) => {
    setWeeklyHours(weeklyHours.map(slot => 
      slot.id === id ? { ...slot, enabled: !slot.enabled } : slot
    ));
  };

  const updateTime = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setWeeklyHours(weeklyHours.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  return (
    <div className="space-y-6">
      {/* Availability Overview Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Team Calendar & Availability
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure your team's booking availability and calendar settings
            </p>
          </div>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
            Active
          </Badge>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            These settings control when clients can book demos with your team. Changes sync automatically with your connected calendar.
          </AlertDescription>
        </Alert>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Active Days</p>
            </div>
            <p className="text-2xl">{weeklyHours.filter(s => s.enabled).length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Default Duration</p>
            </div>
            <p className="text-2xl">{defaultDuration} min</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Advance Booking</p>
            </div>
            <p className="text-2xl">{advanceBooking} days</p>
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="mb-4">General Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Default Meeting Duration</Label>
              <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                <SelectTrigger id="defaultDuration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default length for new demo bookings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer Time Between Meetings</Label>
              <Select value={bufferTime} onValueChange={setBufferTime}>
                <SelectTrigger id="bufferTime">
                  <SelectValue placeholder="Select buffer time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Time to prepare between bookings
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="advanceBooking">Advance Booking Period</Label>
              <Select value={advanceBooking} onValueChange={setAdvanceBooking}>
                <SelectTrigger id="advanceBooking">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How far in advance clients can book
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minNotice">Minimum Notice Time</Label>
              <Select value={minNotice} onValueChange={setMinNotice}>
                <SelectTrigger id="minNotice">
                  <SelectValue placeholder="Select notice time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No minimum</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Minimum time before booking
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">GMT</SelectItem>
                <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                <SelectItem value="Asia/Tokyo">Japan Time (JST)</SelectItem>
                <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your team's default timezone for availability
            </p>
          </div>
        </div>
      </Card>

      {/* Weekly Availability */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Weekly Availability</h3>
            <p className="text-sm text-muted-foreground">
              Set your team's available hours for each day
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allEnabled = weeklyHours.every(s => s.enabled);
              setWeeklyHours(weeklyHours.map(slot => ({ ...slot, enabled: !allEnabled })));
            }}
          >
            {weeklyHours.every(s => s.enabled) ? 'Disable All' : 'Enable All'}
          </Button>
        </div>

        <div className="space-y-3">
          {weeklyHours.map((slot) => (
            <div
              key={slot.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                slot.enabled
                  ? 'border-border bg-background'
                  : 'border-border bg-muted/30 opacity-60'
              }`}
            >
              <Switch
                checked={slot.enabled}
                onCheckedChange={() => toggleDay(slot.id)}
              />
              <div className="w-24">
                <p className={slot.enabled ? '' : 'text-muted-foreground'}>{slot.day}</p>
              </div>
              {slot.enabled ? (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTime(slot.id, 'startTime', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTime(slot.id, 'endTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {(() => {
                      const start = parseInt(slot.startTime.split(':')[0]);
                      const end = parseInt(slot.endTime.split(':')[0]);
                      const hours = end - start;
                      return `${hours}h available`;
                    })()}
                  </Badge>
                </>
              ) : (
                <p className="text-sm text-muted-foreground ml-auto">Unavailable</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Team Members */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Manage who can receive demo bookings
            </p>
          </div>
          <Button
            size="sm"
            style={{
              background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { name: 'John Doe', email: 'john.doe@clientt.com', role: 'Sales Manager', active: true },
            { name: 'Jane Smith', email: 'jane.smith@clientt.com', role: 'Account Executive', active: true },
            { name: 'Mike Johnson', email: 'mike.johnson@clientt.com', role: 'Solutions Engineer', active: false },
          ].map((member, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant="outline" className="ml-4">
                  {member.role}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={member.active} />
                <span className="text-xs text-muted-foreground w-16">
                  {member.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Date Overrides */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Date Overrides</h3>
            <p className="text-sm text-muted-foreground">
              Block specific dates or add custom availability
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Override
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Thanksgiving Break</p>
              <p className="text-sm text-muted-foreground">November 23-24, 2025</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                Blocked
              </Badge>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Extended Hours (Black Friday)</p>
              <p className="text-sm text-muted-foreground">November 29, 2025 • 8:00 AM - 8:00 PM</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                Custom Hours
              </Badge>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm py-4 border-t border-border -mx-8 px-8">
        <Button variant="outline">Cancel</Button>
        <Button
          style={{
            background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
          }}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
