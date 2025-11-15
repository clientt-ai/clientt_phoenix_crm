import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  Phone,
  Calendar,
  Download,
  Filter,
  Info,
  MapPin,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';

export function ContactsAnalytics() {
  const [dateRange, setDateRange] = useState('30days');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [kpiDetailDialog, setKpiDetailDialog] = useState<{
    isOpen: boolean;
    type: 'contacts' | 'verified' | 'appointments' | 'phone' | null;
  }>({ isOpen: false, type: null });

  const handleExport = (format: string) => {
    // Create a mock file download
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `contacts-analytics-${dateRange}-${timestamp}.${format}`;
    
    // Generate mock data based on format
    let content = '';
    let mimeType = '';
    
    if (format === 'csv') {
      content = 'Location,Contact Count,Growth Trend\n';
      content += 'New York, NY,342,12.3%\n';
      content += 'San Francisco, CA,298,18.7%\n';
      content += 'Los Angeles, CA,265,8.2%\n';
      content += 'Chicago, IL,189,15.4%\n';
      content += 'Austin, TX,156,22.1%\n';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      const data = {
        dateRange,
        exportDate: new Date().toISOString(),
        summary: {
          totalContacts: 1842,
          emailVerified: 1456,
          withAppointments: 584,
          phoneProvided: 1023
        },
        topLocations
      };
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else if (format === 'pdf') {
      toast.success(`Generating PDF report for ${dateRange}...`);
      setTimeout(() => {
        toast.success('PDF report would be downloaded in a production environment');
      }, 1500);
      return;
    }
    
    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported contacts analytics as ${format.toUpperCase()}`);
  };

  const handleGenerateReport = () => {
    setShowReportDialog(true);
    toast.success('Report generated successfully!');
  };

  const downloadReport = (format: string) => {
    handleExport(format);
    setShowReportDialog(false);
  };

  const openKpiDetail = (type: 'contacts' | 'verified' | 'appointments' | 'phone') => {
    setKpiDetailDialog({ isOpen: true, type });
  };

  const closeKpiDetail = () => {
    setKpiDetailDialog({ isOpen: false, type: null });
  };

  const getKpiDetailContent = () => {
    const { type } = kpiDetailDialog;
    
    if (type === 'contacts') {
      return {
        title: 'Total Contacts Breakdown',
        description: 'Contact acquisition by source',
        data: [
          { label: 'Web Forms', value: 892, percent: 48.4 },
          { label: 'Calendar Bookings', value: 584, percent: 31.7 },
          { label: 'Chatbot', value: 246, percent: 13.4 },
          { label: 'Manual Entry', value: 120, percent: 6.5 },
        ]
      };
    } else if (type === 'verified') {
      return {
        title: 'Email Verification Status',
        description: 'Breakdown of verified vs unverified emails',
        data: [
          { label: 'Verified', value: 1456, percent: 79.1 },
          { label: 'Pending Verification', value: 283, percent: 15.4 },
          { label: 'Bounced', value: 72, percent: 3.9 },
          { label: 'Invalid', value: 31, percent: 1.6 },
        ]
      };
    } else if (type === 'appointments') {
      return {
        title: 'Appointment Status Breakdown',
        description: 'Contacts with scheduled appointments',
        data: [
          { label: 'Upcoming Appointments', value: 342, percent: 58.6 },
          { label: 'Completed Meetings', value: 189, percent: 32.4 },
          { label: 'Cancelled', value: 38, percent: 6.5 },
          { label: 'No-shows', value: 15, percent: 2.5 },
        ]
      };
    } else if (type === 'phone') {
      return {
        title: 'Phone Number Analysis',
        description: 'Contact phone number availability',
        data: [
          { label: 'Mobile Numbers', value: 723, percent: 70.7 },
          { label: 'Landline Numbers', value: 245, percent: 23.9 },
          { label: 'VOIP Numbers', value: 55, percent: 5.4 },
        ]
      };
    }
    
    return { title: '', description: '', data: [] };
  };

  // Filter data based on date range
  const getFilteredContactGrowth = () => {
    const allData = {
      '7days': [
        { month: 'Day 1', contacts: 24 },
        { month: 'Day 2', contacts: 31 },
        { month: 'Day 3', contacts: 28 },
        { month: 'Day 4', contacts: 35 },
        { month: 'Day 5', contacts: 29 },
        { month: 'Day 6', contacts: 33 },
        { month: 'Day 7', contacts: 38 },
      ],
      '30days': [
        { month: 'Week 1', contacts: 180 },
        { month: 'Week 2', contacts: 220 },
        { month: 'Week 3', contacts: 245 },
        { month: 'Week 4', contacts: 280 },
      ],
      '90days': [
        { month: 'Sep', contacts: 1350 },
        { month: 'Oct', contacts: 1580 },
        { month: 'Nov', contacts: 1842 },
      ],
      '12months': [
        { month: 'Jan', contacts: 520 },
        { month: 'Feb', contacts: 580 },
        { month: 'Mar', contacts: 650 },
        { month: 'Apr', contacts: 720 },
        { month: 'May', contacts: 820 },
        { month: 'Jun', contacts: 920 },
        { month: 'Jul', contacts: 950 },
        { month: 'Aug', contacts: 1100 },
        { month: 'Sep', contacts: 1350 },
        { month: 'Oct', contacts: 1580 },
        { month: 'Nov', contacts: 1720 },
        { month: 'Dec', contacts: 1842 },
      ],
      'custom': [
        { month: 'Jun', contacts: 820 },
        { month: 'Jul', contacts: 950 },
        { month: 'Aug', contacts: 1100 },
        { month: 'Sep', contacts: 1350 },
        { month: 'Oct', contacts: 1580 },
        { month: 'Nov', contacts: 1842 },
      ]
    };
    return allData[dateRange as keyof typeof allData] || allData['30days'];
  };

  const getKPIData = () => {
    const kpiData = {
      '7days': { totalContacts: 218, change: 31, changePercent: 16.6, emailVerified: 165 },
      '30days': { totalContacts: 925, change: 142, changePercent: 18.1, emailVerified: 720 },
      '90days': { totalContacts: 1842, change: 362, changePercent: 24.3, emailVerified: 1456 },
      '12months': { totalContacts: 5520, change: 1242, changePercent: 29.0, emailVerified: 4320 },
      'custom': { totalContacts: 1842, change: 362, changePercent: 24.3, emailVerified: 1456 }
    };
    return kpiData[dateRange as keyof typeof kpiData] || kpiData['30days'];
  };

  const contactGrowth = getFilteredContactGrowth();
  const kpiData = getKPIData();

  // Sample data for charts
  const contactSources = [
    { source: 'Web Forms', count: 892, percentage: 48 },
    { source: 'Calendar Bookings', count: 584, percentage: 32 },
    { source: 'Chatbot', count: 246, percentage: 13 },
    { source: 'Manual Entry', count: 120, percentage: 7 },
  ];

  const topLocations = [
    { city: 'New York, NY', count: 342, trend: 12.3 },
    { city: 'San Francisco, CA', count: 298, trend: 18.7 },
    { city: 'Los Angeles, CA', count: 265, trend: 8.2 },
    { city: 'Chicago, IL', count: 189, trend: 15.4 },
    { city: 'Austin, TX', count: 156, trend: 22.1 },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[28px] mb-2">Contacts Analytics & Reporting</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into contact acquisition and engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleGenerateReport}>
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              {kpiData.changePercent}%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Total Contacts</h3>
          <p className="text-[32px]">{kpiData.totalContacts.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            +{kpiData.change} from last period
          </p>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => openKpiDetail('contacts')}
          >
            Details
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              18.2%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Email Verified</h3>
          <p className="text-[32px]">{kpiData.emailVerified.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            79% verification rate
          </p>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => openKpiDetail('verified')}
          >
            Details
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              31.7%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">With Appointments</h3>
          <p className="text-[32px]">584</p>
          <p className="text-sm text-muted-foreground mt-2">
            32% have scheduled meetings
          </p>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => openKpiDetail('appointments')}
          >
            Details
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              12.5%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Phone Provided</h3>
          <p className="text-[32px]">1,023</p>
          <p className="text-sm text-muted-foreground mt-2">
            56% have phone numbers
          </p>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => openKpiDetail('phone')}
          >
            Details
          </Button>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Contact Growth */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl mb-1">Contact Growth</h3>
              <p className="text-sm text-muted-foreground">
                Total contacts over time
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Cumulative contact count by month</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-4">
            {contactGrowth.map((data, index) => {
              const maxValue = Math.max(...contactGrowth.map(d => d.contacts));
              const percentage = (data.contacts / maxValue) * 100;
              
              return (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                    <span className="text-sm">{data.contacts.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Contact Sources */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl mb-1">Contact Sources</h3>
              <p className="text-sm text-muted-foreground">
                Where contacts are coming from
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {contactSources.map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.source}</span>
                    <span className="text-sm text-muted-foreground">{item.count} contacts</span>
                  </div>
                  <span className="text-sm">{item.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-secondary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Sources</span>
              <span className="text-lg">4</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Locations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl mb-1">Top Locations</h3>
            <p className="text-sm text-muted-foreground">
              Cities with highest contact concentration
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="space-y-3">
          {topLocations.map((location, index) => (
            <div
              key={location.city}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {location.city}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {location.count.toLocaleString()} contacts
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {location.trend}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Download Report</DialogTitle>
            <DialogDescription>
              Choose the format to download the report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadReport('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadReport('json')}
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadReport('pdf')}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowReportDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KPI Detail Dialog */}
      <Dialog open={kpiDetailDialog.isOpen} onOpenChange={closeKpiDetail}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getKpiDetailContent().title}</DialogTitle>
            <DialogDescription>
              {getKpiDetailContent().description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {getKpiDetailContent().data.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm">
                  {item.value.toLocaleString()} ({item.percent.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={closeKpiDetail}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}