import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  Send,
  Users,
  Calendar,
  Download,
  Filter,
  Info,
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

export function FormsAnalytics() {
  const [dateRange, setDateRange] = useState('30days');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [kpiDetailDialog, setKpiDetailDialog] = useState<{
    isOpen: boolean;
    type: 'submissions' | 'forms' | 'conversions' | 'rate' | null;
  }>({ isOpen: false, type: null });

  const handleExport = (format: string) => {
    // Create a mock file download
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `forms-analytics-${dateRange}-${timestamp}.${format}`;
    
    // Generate mock data based on format
    let content = '';
    let mimeType = '';
    
    if (format === 'csv') {
      content = 'Form Name,Submissions,Conversion Rate,Trend\n';
      content += 'Newsletter Signup,892,N/A,18.5%\n';
      content += 'Contact Us,523,N/A,12.3%\n';
      content += 'Product Inquiry,445,75%,8.7%\n';
      content += 'Webinar Registration,423,73%,15.2%\n';
      content += 'Demo Booking Form,312,88%,22.1%\n';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      const data = {
        dateRange,
        exportDate: new Date().toISOString(),
        summary: {
          totalSubmissions: 3803,
          activeForms: 10,
          calendarConversions: 1292,
          avgConversionRate: '76.2%'
        },
        topForms: topPerformingForms
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
    
    toast.success(`Exported forms analytics as ${format.toUpperCase()}`);
  };

  const handleGenerateReport = () => {
    setShowReportDialog(true);
    toast.success('Report generated successfully!');
  };

  const downloadReport = (format: string) => {
    handleExport(format);
    setShowReportDialog(false);
  };

  const openKpiDetail = (type: 'submissions' | 'forms' | 'conversions' | 'rate') => {
    setKpiDetailDialog({ isOpen: true, type });
  };

  const closeKpiDetail = () => {
    setKpiDetailDialog({ isOpen: false, type: null });
  };

  const getKpiDetailContent = () => {
    const { type } = kpiDetailDialog;
    
    if (type === 'submissions') {
      return {
        title: 'Total Submissions Breakdown',
        description: 'Detailed breakdown of form submissions',
        data: [
          { label: 'Newsletter Signup', value: 892, percent: 23.5 },
          { label: 'Contact Us', value: 523, percent: 13.8 },
          { label: 'Product Inquiry', value: 445, percent: 11.7 },
          { label: 'Webinar Registration', value: 423, percent: 11.1 },
          { label: 'Demo Booking Form', value: 312, percent: 8.2 },
          { label: 'Other Forms', value: 1208, percent: 31.7 },
        ]
      };
    } else if (type === 'forms') {
      return {
        title: 'Active Forms Details',
        description: 'Overview of your active forms',
        data: [
          { label: 'Contact & Lead Forms', value: 4, percent: 40 },
          { label: 'Booking & Registration', value: 3, percent: 30 },
          { label: 'Newsletter & Subscriptions', value: 2, percent: 20 },
          { label: 'Feedback & Surveys', value: 1, percent: 10 },
        ]
      };
    } else if (type === 'conversions') {
      return {
        title: 'Calendar Conversions Breakdown',
        description: 'Forms integrated with calendar booking',
        data: [
          { label: 'Demo Booking Form', value: 512, percent: 39.6 },
          { label: 'Webinar Registration', value: 423, percent: 32.7 },
          { label: 'Consultation Request', value: 245, percent: 19.0 },
          { label: 'Meeting Scheduler', value: 112, percent: 8.7 },
        ]
      };
    } else if (type === 'rate') {
      return {
        title: 'Conversion Rate Analysis',
        description: 'Average conversion rate for calendar-integrated forms',
        data: [
          { label: 'Demo Booking Form', value: 88, percent: 88 },
          { label: 'Product Inquiry', value: 75, percent: 75 },
          { label: 'Webinar Registration', value: 73, percent: 73 },
          { label: 'Consultation Request', value: 71, percent: 71 },
          { label: 'Meeting Scheduler', value: 68, percent: 68 },
        ]
      };
    }
    
    return { title: '', description: '', data: [] };
  };

  // Filter data based on date range
  const getFilteredSubmissionData = () => {
    const allData = {
      '7days': [
        { month: 'Day 1', submissions: 45 },
        { month: 'Day 2', submissions: 52 },
        { month: 'Day 3', submissions: 48 },
        { month: 'Day 4', submissions: 61 },
        { month: 'Day 5', submissions: 55 },
        { month: 'Day 6', submissions: 58 },
        { month: 'Day 7', submissions: 63 },
      ],
      '30days': [
        { month: 'Week 1', submissions: 320 },
        { month: 'Week 2', submissions: 380 },
        { month: 'Week 3', submissions: 410 },
        { month: 'Week 4', submissions: 450 },
      ],
      '90days': [
        { month: 'Sep', submissions: 890 },
        { month: 'Oct', submissions: 1050 },
        { month: 'Nov', submissions: 1247 },
      ],
      '12months': [
        { month: 'Jan', submissions: 280 },
        { month: 'Feb', submissions: 310 },
        { month: 'Mar', submissions: 350 },
        { month: 'Apr', submissions: 390 },
        { month: 'May', submissions: 420 },
        { month: 'Jun', submissions: 520 },
        { month: 'Jul', submissions: 580 },
        { month: 'Aug', submissions: 720 },
        { month: 'Sep', submissions: 890 },
        { month: 'Oct', submissions: 1050 },
        { month: 'Nov', submissions: 1180 },
        { month: 'Dec', submissions: 1247 },
      ],
      'custom': [
        { month: 'Jun', submissions: 420 },
        { month: 'Jul', submissions: 580 },
        { month: 'Aug', submissions: 720 },
        { month: 'Sep', submissions: 890 },
        { month: 'Oct', submissions: 1050 },
        { month: 'Nov', submissions: 1247 },
      ]
    };
    return allData[dateRange as keyof typeof allData] || allData['30days'];
  };

  const getKPIData = () => {
    const kpiData = {
      '7days': { totalSubmissions: 382, change: 45, changePercent: 13.4, activeForms: 8 },
      '30days': { totalSubmissions: 1560, change: 210, changePercent: 15.6, activeForms: 10 },
      '90days': { totalSubmissions: 3187, change: 487, changePercent: 18.0, activeForms: 10 },
      '12months': { totalSubmissions: 8537, change: 1823, changePercent: 27.1, activeForms: 12 },
      'custom': { totalSubmissions: 3803, change: 632, changePercent: 18.5, activeForms: 10 }
    };
    return kpiData[dateRange as keyof typeof kpiData] || kpiData['30days'];
  };

  const submissionData = getFilteredSubmissionData();
  const kpiData = getKPIData();

  // Sample data for charts
  const topPerformingForms = [
    { name: 'Newsletter Signup', submissions: 892, conversionRate: null, trend: 18.5 },
    { name: 'Contact Us', submissions: 523, conversionRate: null, trend: 12.3 },
    { name: 'Product Inquiry', submissions: 445, conversionRate: '75%', trend: 8.7 },
    { name: 'Webinar Registration', submissions: 423, conversionRate: '73%', trend: 15.2 },
    { name: 'Demo Booking Form', submissions: 312, conversionRate: '88%', trend: 22.1 },
  ];

  const formsByStatus = [
    { status: 'Active', count: 10, percentage: 83 },
    { status: 'Draft', count: 1, percentage: 8 },
    { status: 'Paused', count: 1, percentage: 8 },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[28px] mb-2">Forms Analytics & Reporting</h2>
          <p className="text-muted-foreground">
            Detailed insights into form performance and submission trends
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
            <FileText className="w-4 h-4" />
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
              <Send className="w-6 h-6 text-primary" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              {kpiData.changePercent}%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Total Submissions</h3>
          <p className="text-[32px]">{kpiData.totalSubmissions.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            +{kpiData.change} from last period
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => openKpiDetail('submissions')}
          >
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            Details
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              12%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Active Forms</h3>
          <p className="text-[32px]">{kpiData.activeForms}</p>
          <p className="text-sm text-muted-foreground mt-2">
            83% of total forms
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => openKpiDetail('forms')}
          >
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
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
              15.3%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Calendar Conversions</h3>
          <p className="text-[32px]">1,292</p>
          <p className="text-sm text-muted-foreground mt-2">
            From 6 integrated forms
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => openKpiDetail('conversions')}
          >
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            Details
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <TrendingUp className="w-3 h-3" />
              5.3%
            </Badge>
          </div>
          <h3 className="text-muted-foreground mb-1">Avg Conversion Rate</h3>
          <p className="text-[32px]">76.2%</p>
          <p className="text-sm text-muted-foreground mt-2">
            For forms with calendar sync
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => openKpiDetail('rate')}
          >
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            Details
          </Button>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Submission Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl mb-1">Submission Trends</h3>
              <p className="text-sm text-muted-foreground">
                Monthly form submissions over time
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Total form submissions aggregated by month</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-4">
            {submissionData.map((data, index) => {
              const maxValue = Math.max(...submissionData.map(d => d.submissions));
              const percentage = (data.submissions / maxValue) * 100;
              
              return (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                    <span className="text-sm">{data.submissions.toLocaleString()}</span>
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

        {/* Forms by Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl mb-1">Forms by Status</h3>
              <p className="text-sm text-muted-foreground">
                Distribution of form statuses
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {formsByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : item.status === 'Draft'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }
                    >
                      {item.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.count} forms</span>
                  </div>
                  <span className="text-sm">{item.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      item.status === 'Active'
                        ? 'bg-green-500'
                        : item.status === 'Draft'
                        ? 'bg-gray-400'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Forms</span>
              <span className="text-lg">12</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Forms */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl mb-1">Top Performing Forms</h3>
            <p className="text-sm text-muted-foreground">
              Forms ranked by submission volume
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="space-y-3">
          {topPerformingForms.map((form, index) => (
            <div
              key={form.name}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="mb-1">{form.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {form.submissions.toLocaleString()} submissions
                    </span>
                    {form.conversionRate && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {form.conversionRate} conversion
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {form.trend}%
                </Badge>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Generated</DialogTitle>
            <DialogDescription>
              Your report has been generated successfully. You can download it in the desired format.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => downloadReport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadReport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadReport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <DialogFooter>
            <div className="space-y-4">
              {getKpiDetailContent().data.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.value.toLocaleString()}</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {item.percent}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}