import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  FileText, 
  Send, 
  TrendingUp, 
  Users, 
  MoreVertical, 
  Copy, 
  Edit, 
  Pause, 
  Play, 
  Trash2, 
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Globe,
  Info,
  LayoutDashboard,
  LineChart
} from 'lucide-react';
import { KPICard } from '../KPICard';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FormsAnalytics } from './FormsAnalytics';

const initialFormsData = [
  {
    id: 1,
    name: 'Customer Feedback Survey',
    submissions: 247,
    calendarBookings: 178,
    status: 'Active',
    dateCreated: 'Oct 15, 2025',
    lastEdited: '2 hours ago',
    calendarSync: true,
    demoConversionRate: '68%',
  },
  {
    id: 2,
    name: 'Newsletter Signup',
    submissions: 892,
    calendarBookings: 0,
    status: 'Active',
    dateCreated: 'Oct 8, 2025',
    lastEdited: '1 day ago',
    calendarSync: false,
    demoConversionRate: null,
  },
  {
    id: 3,
    name: 'Event Registration',
    submissions: 156,
    calendarBookings: 128,
    status: 'Draft',
    dateCreated: 'Oct 5, 2025',
    lastEdited: '2 days ago',
    calendarSync: true,
    demoConversionRate: '82%',
  },
  {
    id: 4,
    name: 'Contact Us',
    submissions: 523,
    calendarBookings: 0,
    status: 'Active',
    dateCreated: 'Sep 28, 2025',
    lastEdited: '3 days ago',
    calendarSync: false,
    demoConversionRate: null,
  },
  {
    id: 5,
    name: 'Job Application Form',
    submissions: 234,
    calendarBookings: 0,
    status: 'Active',
    dateCreated: 'Sep 22, 2025',
    lastEdited: '4 days ago',
    calendarSync: false,
    demoConversionRate: null,
  },
  {
    id: 6,
    name: 'Product Inquiry',
    submissions: 445,
    calendarBookings: 316,
    status: 'Active',
    dateCreated: 'Sep 15, 2025',
    lastEdited: '1 week ago',
    calendarSync: true,
    demoConversionRate: '75%',
  },
  {
    id: 7,
    name: 'Survey - Q4 Feedback',
    submissions: 89,
    calendarBookings: 0,
    status: 'Paused',
    dateCreated: 'Sep 10, 2025',
    lastEdited: '2 weeks ago',
    calendarSync: false,
    demoConversionRate: null,
  },
  {
    id: 8,
    name: 'Partnership Request',
    submissions: 67,
    calendarBookings: 52,
    status: 'Active',
    dateCreated: 'Sep 5, 2025',
    lastEdited: '3 weeks ago',
    calendarSync: true,
    demoConversionRate: '71%',
  },
  {
    id: 9,
    name: 'Demo Booking Form',
    submissions: 312,
    calendarBookings: 284,
    status: 'Active',
    dateCreated: 'Aug 28, 2025',
    lastEdited: '1 month ago',
    calendarSync: true,
    demoConversionRate: '88%',
  },
  {
    id: 10,
    name: 'Support Request',
    submissions: 178,
    calendarBookings: 0,
    status: 'Active',
    dateCreated: 'Aug 20, 2025',
    lastEdited: '1 month ago',
    calendarSync: false,
    demoConversionRate: null,
  },
  {
    id: 11,
    name: 'Webinar Registration',
    submissions: 423,
    calendarBookings: 334,
    status: 'Active',
    dateCreated: 'Aug 15, 2025',
    lastEdited: '1 month ago',
    calendarSync: true,
    demoConversionRate: '73%',
  },
  {
    id: 12,
    name: 'Early Access Signup',
    submissions: 567,
    calendarBookings: 0,
    status: 'Active',
    dateCreated: 'Aug 10, 2025',
    lastEdited: '2 months ago',
    calendarSync: false,
    demoConversionRate: null,
  },
];

type FormsPageProps = {
  onCreateForm: (formData?: any) => void;
  searchQuery?: string;
  onNavigate?: (page: string) => void;
  savedForms?: any[];
};

type SortField = 'name' | 'submissions' | 'conversionRate' | 'dateCreated' | 'calendarSync' | null;
type SortDirection = 'asc' | 'desc';

export function FormsPage({ onCreateForm, searchQuery = '', onNavigate, savedForms }: FormsPageProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeKPI, setActiveKPI] = useState<'all' | 'submissions' | 'active' | 'conversionRate' | null>(null);
  const [formsData, setFormsData] = useState(initialFormsData);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const itemsPerPage = 8;
  
  // Merge saved forms into forms data when they change
  useEffect(() => {
    if (savedForms && savedForms.length > 0) {
      const newForms = savedForms.map((savedForm, index) => {
        const now = new Date();
        const createdDate = new Date(savedForm.createdAt);
        const diffTime = now.getTime() - createdDate.getTime();
        const diffMinutes = Math.floor(diffTime / 60000);
        
        let lastEdited = 'Just now';
        if (diffMinutes > 60) {
          const diffHours = Math.floor(diffMinutes / 60);
          lastEdited = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffMinutes > 0) {
          lastEdited = `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        
        return {
          id: initialFormsData.length + index + 1,
          name: savedForm.title,
          submissions: 0,
          calendarBookings: 0,
          status: 'Draft',
          dateCreated: createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          lastEdited,
          calendarSync: !!savedForm.postSubmission?.assignedCalendar,
          demoConversionRate: null,
        };
      });
      
      // Add new forms to the beginning of the list
      setFormsData([...newForms, ...initialFormsData]);
    }
  }, [savedForms]);
  
  // Combine global and local search
  const effectiveSearchQuery = searchQuery || localSearchQuery;

  // Analytics calculations
  const totalSubmissions = formsData.reduce((sum, form) => sum + form.submissions, 0);
  const totalConversions = formsData.reduce((sum, form) => {
    return sum + (form.calendarSync ? form.calendarBookings : 0);
  }, 0);
  const activeForms = formsData.filter(form => form.status === 'Active').length;
  
  // Calculate average conversion rate only for forms with calendar integration
  const formsWithCalendar = formsData.filter(form => form.calendarSync && form.submissions > 0);
  const avgConversionRate = formsWithCalendar.length > 0
    ? (formsWithCalendar.reduce((sum, form) => {
        const rate = (form.calendarBookings / form.submissions) * 100;
        return sum + rate;
      }, 0) / formsWithCalendar.length).toFixed(1)
    : '0.0';

  // Filter forms based on active KPI and search query
  let filteredForms = formsData.filter(form => {
    const matchesStatus = activeKPI !== 'active' || form.status === 'Active';
    const matchesConversion = activeKPI !== 'conversionRate' || form.calendarSync;
    const matchesSearch = !effectiveSearchQuery || 
      form.name.toLowerCase().includes(effectiveSearchQuery.toLowerCase());
    return matchesStatus && matchesConversion && matchesSearch;
  });

  // Sort forms
  if (sortField) {
    filteredForms = [...filteredForms].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'conversionRate') {
        aVal = parseFloat(a.conversionRate);
        bVal = parseFloat(b.conversionRate);
      } else if (sortField === 'calendarSync') {
        aVal = a.calendarSync ? 1 : 0;
        bVal = b.calendarSync ? 1 : 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  } else if (activeKPI === 'submissions') {
    filteredForms = [...filteredForms].sort((a, b) => b.submissions - a.submissions);
  }

  // Pagination
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = filteredForms.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleRowClick = (formId: number) => {
    console.log('Opening form:', formId);
    onCreateForm();
  };

  const handleEditForm = (e: React.MouseEvent, formId: number, formName: string) => {
    e.stopPropagation();
    toast.success(`Opening "${formName}" for editing`);
    onCreateForm();
  };

  const handleDuplicateForm = (e: React.MouseEvent, formId: number, formName: string) => {
    e.stopPropagation();
    const formToDuplicate = formsData.find(f => f.id === formId);
    if (formToDuplicate) {
      const newForm = {
        ...formToDuplicate,
        id: Math.max(...formsData.map(f => f.id)) + 1,
        name: `${formToDuplicate.name} (Copy)`,
        submissions: 0,
        status: 'Draft',
        dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastEdited: 'Just now',
        conversionRate: '0%',
      };
      setFormsData([newForm, ...formsData]);
      toast.success(`"${formName}" duplicated successfully`);
    }
  };

  const handleViewAnalytics = (e: React.MouseEvent, formName: string) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate('Analytics');
      toast.success(`Viewing analytics for "${formName}"`);
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, formId: number, formName: string, currentStatus: string) => {
    e.stopPropagation();
    setFormsData(formsData.map(form => {
      if (form.id === formId) {
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        return { ...form, status: newStatus, lastEdited: 'Just now' };
      }
      return form;
    }));
    if (currentStatus === 'Active') {
      toast.success(`"${formName}" has been paused`);
    } else {
      toast.success(`"${formName}" is now active`);
    }
  };

  const handleDeleteForm = (e: React.MouseEvent, formId: number, formName: string) => {
    e.stopPropagation();
    setFormsData(formsData.filter(form => form.id !== formId));
    toast.error(`"${formName}" has been deleted`);
  };

  const handleKPIClick = (kpi: 'all' | 'submissions' | 'active' | 'conversionRate') => {
    setActiveKPI(activeKPI === kpi ? null : kpi);
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-30" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-2 text-[38px] font-bold">
          Forms Page
        </h1>
        <p className="text-muted-foreground">
          Manage and track all your web forms in one place
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics & Reporting
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Forms"
              value={initialFormsData.length.toString()}
              change={12}
              icon={FileText}
              colorClass="bg-primary"
              onClick={() => handleKPIClick('all')}
              isActive={activeKPI === 'all'}
            />
            <KPICard
              title="Total Submissions"
              value={totalSubmissions.toLocaleString()}
              change={18.5}
              icon={Send}
              colorClass="bg-secondary"
              onClick={() => handleKPIClick('submissions')}
              isActive={activeKPI === 'submissions'}
            />
            <KPICard
              title="Active Forms"
              value={activeForms.toString()}
              change={8.2}
              icon={Users}
              colorClass="bg-accent"
              onClick={() => handleKPIClick('active')}
              isActive={activeKPI === 'active'}
            />
            <KPICard
              title="Avg Conversion Rate"
              value={`${avgConversionRate}%`}
              change={5.3}
              icon={TrendingUp}
              colorClass="bg-[#7C3AED]"
              onClick={() => handleKPIClick('conversionRate')}
              isActive={activeKPI === 'conversionRate'}
            />
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Create new forms and manage submissions
                </p>
              </div>
              {!showQuickActions && (
                <Button 
                  onClick={() => {
                    onCreateForm();
                    toast.success('Opening form builder...');
                  }}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Create New Form
                </Button>
              )}
            </div>
          </Card>

          {/* Forms Table */}
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="mb-1">All Forms</h3>
                <p className="text-sm text-muted-foreground">
                  {activeKPI === 'submissions' 
                    ? 'Sorted by submissions (highest first)' 
                    : activeKPI === 'conversionRate' 
                    ? 'Showing forms with calendar sync enabled' 
                    : activeKPI === 'active'
                    ? 'Showing active forms only'
                    : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredForms.length)} of ${filteredForms.length} forms`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search forms..."
                    className="pl-10 w-64"
                    value={localSearchQuery}
                    onChange={(e) => {
                      setLocalSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                {(activeKPI || effectiveSearchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveKPI(null);
                      setLocalSearchQuery('');
                      setSortField(null);
                      setCurrentPage(1);
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 group"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 group"
                        onClick={() => handleSort('submissions')}
                      >
                        <div className="flex items-center gap-1">
                          Submissions
                          <SortIcon field="submissions" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 group"
                        onClick={() => handleSort('calendarSync')}
                      >
                        <div className="flex items-center gap-1">
                          Calendar Integrated?
                          <SortIcon field="calendarSync" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 group"
                        onClick={() => handleSort('conversionRate')}
                      >
                        <div className="flex items-center gap-1">
                          Conversion Rate
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help ml-1" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Conversion is calculated only for forms linked to a calendar integration.</p>
                              <p className="mt-1 text-xs text-muted-foreground">Formula: Calendar Bookings ÷ Unique Form Submissions × 100</p>
                            </TooltipContent>
                          </Tooltip>
                          <SortIcon field="conversionRate" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70 group"
                        onClick={() => handleSort('dateCreated')}
                      >
                        <div className="flex items-center gap-1">
                          Date Created
                          <SortIcon field="dateCreated" />
                        </div>
                      </TableHead>
                      <TableHead>Last Edited</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentForms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No forms found. {searchQuery ? 'Try a different search.' : 'Create your first form to get started.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentForms.map((form) => {
                        // Calculate conversion rate: Calendar Bookings ÷ Submissions × 100
                        const conversionRate = form.calendarSync && form.submissions > 0 
                          ? ((form.calendarBookings / form.submissions) * 100).toFixed(1)
                          : null;
                        
                        return (
                          <TableRow
                            key={form.id}
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleRowClick(form.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span>{form.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span>
                                {form.submissions.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              {form.calendarSync ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <XCircle className="w-3 h-3" />
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {conversionRate ? (
                                <div className="flex items-center gap-2">
                                  <span>{conversionRate}%</span>
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    {form.calendarBookings} bookings
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">–</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  form.status === 'Active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : form.status === 'Draft'
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }
                              >
                                {form.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground text-sm">
                                {form.dateCreated}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground text-sm">
                                {form.lastEdited}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger className="hover:bg-muted/50 rounded-full p-1">
                                  <MoreVertical className="w-4 h-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                  <DropdownMenuItem
                                    onClick={(e) => handleEditForm(e, form.id, form.name)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDuplicateForm(e, form.id, form.name)}
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleToggleStatus(e, form.id, form.name, form.status)}
                                  >
                                    {form.status === 'Active' ? (
                                      <Pause className="w-4 h-4 mr-2" />
                                    ) : (
                                      <Play className="w-4 h-4 mr-2" />
                                    )}
                                    {form.status === 'Active' ? 'Pause' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => handleViewAnalytics(e, form.name)}
                                  >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Analytics
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteForm(e, form.id, form.name)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TooltipProvider>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, idx, array) => {
                      // Add ellipsis
                      const showEllipsisBefore = idx > 0 && page - array[idx - 1] > 1;
                      return (
                        <div key={page} className="flex items-center gap-2">
                          {showEllipsisBefore && <span className="text-muted-foreground">...</span>}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-9 h-9"
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <FormsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}