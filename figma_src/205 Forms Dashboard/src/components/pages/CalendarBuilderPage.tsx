import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Globe, Download, Check } from 'lucide-react';
import { Card } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Separator } from '../ui/separator';

type CalendarBuilderPageProps = {
  onBack: () => void;
};

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
];

const customQuestions = [
  { id: 'hear', label: 'How did you hear about us?', type: 'select', options: ['Search Engine', 'Social Media', 'Referral', 'Advertisement'] },
  { id: 'company', label: 'Company Name', type: 'text' },
  { id: 'role', label: 'Your Role', type: 'text' }
];

export function CalendarBuilderPage({ onBack }: CalendarBuilderPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [embedEnabled, setEmbedEnabled] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'John Smith',
    email: 'john.smith@company.com',
    timezone: 'America/New_York (EST)',
    hear: '',
    company: '',
    role: ''
  });

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      setShowConfirmation(true);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="cursor-pointer hover:text-primary">
                Forms
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Demo Calendar Builder</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forms
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1>Demo Calendar Builder</h1>
        <p className="text-muted-foreground">Create a calendar booking experience for your leads and customers</p>
      </div>

      {/* Embed Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Embed on Landing Page</Label>
            <p className="text-muted-foreground">Allow visitors to book directly from your landing page</p>
          </div>
          <Switch checked={embedEnabled} onCheckedChange={setEmbedEnabled} />
        </div>
      </Card>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Calendar & Time Slots */}
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h3>Select Date & Time</h3>
            <p className="text-muted-foreground">Choose a convenient time for your demo</p>
          </div>

          <Separator />

          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Available time slots</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`px-3 py-2 rounded-md border transition-all ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:border-primary hover:bg-muted'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Right Panel - Booking Information */}
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <h3>Booking Details</h3>
            <p className="text-muted-foreground">Complete your booking information</p>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York (EST)">America/New_York (EST)</SelectItem>
                  <SelectItem value="America/Chicago (CST)">America/Chicago (CST)</SelectItem>
                  <SelectItem value="America/Denver (MST)">America/Denver (MST)</SelectItem>
                  <SelectItem value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</SelectItem>
                  <SelectItem value="Europe/London (GMT)">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris (CET)">Europe/Paris (CET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Custom Questions */}
          <div className="space-y-4">
            <h4>Additional Information</h4>
            
            {customQuestions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id}>{question.label}</Label>
                {question.type === 'select' ? (
                  <Select value={formData[question.id as keyof typeof formData]} onValueChange={(value) => setFormData({ ...formData, [question.id]: value })}>
                    <SelectTrigger id={question.id}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={question.id}
                    value={formData[question.id as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [question.id]: e.target.value })}
                    placeholder={`Enter ${question.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <h4>Booking Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.timezone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1" 
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime || !formData.name || !formData.email}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Booking
            </Button>
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-accent-foreground" />
            </div>
            <DialogTitle className="text-center">Booking Confirmed!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Your demo has been successfully scheduled. A confirmation email has been sent to {formData.email}
            </p>
            
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timezone</span>
                <span>{formData.timezone.split(' ')[0]}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-center">Add to calendar:</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Google Calendar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Outlook
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  iCal
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => { setShowConfirmation(false); onBack(); }} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
