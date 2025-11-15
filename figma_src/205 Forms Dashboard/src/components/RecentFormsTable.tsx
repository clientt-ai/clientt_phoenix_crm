import { Search, Plus, MoreVertical, Edit, Copy, BarChart3, Trash2, Pause, Play } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { toast } from 'sonner';

const initialRecentForms = [
  {
    id: 1,
    name: 'Customer Feedback Survey',
    type: 'Form',
    submissions: 247,
    status: 'Active',
    dateCreated: 'Oct 15, 2025',
    lastEdited: '2 hours ago',
  },
  {
    id: 2,
    name: 'Product Inquiry Form',
    type: 'Form',
    submissions: 1432,
    status: 'Active',
    dateCreated: 'Oct 10, 2025',
    lastEdited: '5 hours ago',
  },
  {
    id: 3,
    name: 'Newsletter Signup',
    type: 'Form',
    submissions: 892,
    status: 'Active',
    dateCreated: 'Oct 8, 2025',
    lastEdited: '1 day ago',
  },
  {
    id: 4,
    name: 'Event Registration',
    type: 'Form',
    submissions: 156,
    status: 'Draft',
    dateCreated: 'Oct 5, 2025',
    lastEdited: '2 days ago',
  },
  {
    id: 5,
    name: 'Contact Us',
    type: 'Form',
    submissions: 523,
    status: 'Active',
    dateCreated: 'Sep 28, 2025',
    lastEdited: '3 days ago',
  },
  {
    id: 6,
    name: 'Demo Request Form',
    type: 'Form',
    submissions: 78,
    status: 'Paused',
    dateCreated: 'Sep 20, 2025',
    lastEdited: '5 days ago',
  },
];

type RecentFormsTableProps = {
  onCreateForm: () => void;
  onNavigate?: (page: string) => void;
};

export function RecentFormsTable({ onCreateForm, onNavigate }: RecentFormsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [recentForms, setRecentForms] = useState(initialRecentForms);

  // Filter forms based on search query
  const filteredForms = recentForms.filter(form => {
    const matchesSearch = !searchQuery || 
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Show top 6 unless "View All" is clicked
  const displayedForms = showAll ? filteredForms : filteredForms.slice(0, 6);

  const handleRowClick = (formId: number) => {
    console.log('Opening form:', formId);
    onCreateForm();
  };

  const handleDuplicateForm = (e: React.MouseEvent, formId: number, formName: string) => {
    e.stopPropagation();
    const formToDuplicate = recentForms.find(f => f.id === formId);
    if (formToDuplicate) {
      const newForm = {
        ...formToDuplicate,
        id: Math.max(...recentForms.map(f => f.id)) + 1,
        name: `${formToDuplicate.name} (Copy)`,
        submissions: 0,
        status: 'Draft',
        dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastEdited: 'Just now',
      };
      setRecentForms([newForm, ...recentForms]);
      toast.success(`"${formName}" duplicated successfully`);
    }
  };

  const handleViewAnalytics = (e: React.MouseEvent, formName: string) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate('Analytics');
      toast.success(`Viewing analytics for "${formName}"`);
    } else {
      toast.info('Analytics view coming soon!');
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, formId: number, formName: string, currentStatus: string) => {
    e.stopPropagation();
    setRecentForms(recentForms.map(form => {
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
    setRecentForms(recentForms.filter(form => form.id !== formId));
    toast.error(`"${formName}" has been deleted`);
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">All Forms</h3>
          <p className="text-sm text-muted-foreground">
            Manage and track your forms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onCreateForm}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Form
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Last Edited</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No items found. Try a different search.
                </TableCell>
              </TableRow>
            ) : (
              displayedForms.map((form) => (
              <TableRow
                key={form.id}
                className="hover:bg-muted/50 cursor-pointer group"
                onClick={() => handleRowClick(form.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{form.name}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to edit
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    {form.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span>
                    {form.submissions.toLocaleString()}
                  </span>
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
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center justify-center"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(form.id);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleDuplicateForm(e, form.id, form.name)}
                        className="cursor-pointer"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleViewAnalytics(e, form.name)}
                        className="cursor-pointer"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleToggleStatus(e, form.id, form.name, form.status)}
                        className="cursor-pointer"
                      >
                        {form.status === 'Active' ? (
                          <Pause className="mr-2 h-4 w-4" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        {form.status === 'Active' ? 'Pause' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteForm(e, form.id, form.name)}
                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View All / Show Less Button */}
      {filteredForms.length > 6 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All (${filteredForms.length} items)`}
          </Button>
        </div>
      )}
    </Card>
  );
}