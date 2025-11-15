import { useState } from 'react';
import {  Contact, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  DollarSign,
  Tag,
  Edit,
  Eye,
  Check,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContactsAnalytics } from './ContactsAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

// Mock data for contacts
const generateMockContacts = () => {
  const formNames = ['Product Demo Request', 'Newsletter Signup', 'Contact Sales', 'Support Ticket', 'Event Registration'];
  const companies = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Digital Dynamics', 'CloudNet Systems', 'DataFlow Co'];
  const firstNames = ['Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Linda', 'Robert', 'Jennifer', 'William'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];
  
  return Array.from({ length: 47 }, (_, i) => ({
    id: `contact-${i + 1}`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `contact${i + 1}@example.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    company: companies[Math.floor(Math.random() * companies.length)],
    formName: formNames[Math.floor(Math.random() * formNames.length)],
    dateSubmitted: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    status: ['New', 'Contacted', 'Qualified', 'Nurturing'][Math.floor(Math.random() * 4)],
    dealValue: Math.floor(Math.random() * 50000) + 5000,
    notes: 'Interested in enterprise plan. Follow up scheduled for next week.'
  }));
};

type ContactsPageProps = {
  crmEnabled?: boolean;
};

export function ContactsPage({ crmEnabled = false }: ContactsPageProps) {
  const [contacts, setContacts] = useState(generateMockContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterForm, setFilterForm] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<typeof contacts[0] | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [editedContact, setEditedContact] = useState<typeof contacts[0] | null>(null);
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterForm === 'all' || contact.formName === filterForm;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  // Get unique form names for filter
  const uniqueForms = Array.from(new Set(contacts.map(c => c.formName)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Contacted':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Qualified':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Nurturing':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleExportCSV = () => {
    // Prepare CSV headers
    const headers = crmEnabled 
      ? ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Form Name', 'Date Submitted', 'Status', 'Deal Value', 'Notes']
      : ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Form Name', 'Date Submitted'];
    
    // Prepare CSV rows
    const rows = filteredContacts.map(contact => {
      const baseRow = [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phone,
        contact.company,
        contact.formName,
        contact.dateSubmitted
      ];
      
      if (crmEnabled) {
        return [...baseRow, contact.status, contact.dealValue.toString(), `"${contact.notes}"`];
      }
      
      return baseRow;
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success toast
    toast.success(`Exported ${filteredContacts.length} contacts to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <Contact className="w-8 h-8 text-primary" />
            Contacts
            {crmEnabled && (
              <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30">
                CRM Enhanced
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {crmEnabled 
              ? 'Manage contacts with CRM pipeline integration and enhanced insights'
              : 'View and manage contacts from your form submissions'
            }
          </p>
        </div>
        <Button className="gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
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
          {/* Stats Cards - CRM Enhanced */}
          {crmEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Contacts</p>
                      <p className="text-2xl mt-1">{contacts.length}</p>
                    </div>
                    <Contact className="w-8 h-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Qualified Leads</p>
                      <p className="text-2xl mt-1">{contacts.filter(c => c.status === 'Qualified').length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pipeline Value</p>
                      <p className="text-2xl mt-1">
                        ${(contacts.reduce((sum, c) => sum + c.dealValue, 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-secondary opacity-20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New This Week</p>
                      <p className="text-2xl mt-1">{contacts.filter(c => c.status === 'New').length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts by name, email, or company..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Filter by Form */}
                <Select value={filterForm} onValueChange={(value) => {
                  setFilterForm(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full md:w-64">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Forms</SelectItem>
                    {uniqueForms.map(form => (
                      <SelectItem key={form} value={form}>{form}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} contacts</span>
                {(searchQuery || filterForm !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterForm('all');
                      setCurrentPage(1);
                    }}
                    className="h-7 gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contacts Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm text-muted-foreground">First Name</th>
                    <th className="text-left p-4 text-sm text-muted-foreground">Last Name</th>
                    <th className="text-left p-4 text-sm text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm text-muted-foreground">Company</th>
                    <th className="text-left p-4 text-sm text-muted-foreground">Form Name</th>
                    <th className="text-left p-4 text-sm text-muted-foreground">Date Submitted</th>
                    {crmEnabled && (
                      <>
                        <th className="text-left p-4 text-sm text-muted-foreground">Status</th>
                        <th className="text-left p-4 text-sm text-muted-foreground">Deal Value</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">{contact.firstName}</td>
                      <td className="p-4">{contact.lastName}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.company}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{contact.formName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{contact.dateSubmitted}</td>
                      {crmEnabled && (
                        <>
                          <td className="p-4">
                            <Badge variant="outline" className={getStatusColor(contact.status)}>
                              {contact.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">${(contact.dealValue / 1000).toFixed(1)}K</span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
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
          </Card>

          {/* Contact Detail Modal */}
          {selectedContact && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-3">
                      <Contact className="w-6 h-6 text-primary" />
                      {selectedContact.firstName} {selectedContact.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContact(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-6 pt-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-sm">{selectedContact.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="text-sm">{selectedContact.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="text-sm">{selectedContact.company}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="text-sm">{selectedContact.dateSubmitted}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wide">Form Details</h3>
                    
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Form Name</p>
                        <p className="text-sm">{selectedContact.formName}</p>
                      </div>
                    </div>
                  </div>

                  {/* CRM Enhanced Section */}
                  {crmEnabled && (
                    <>
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-sm text-muted-foreground uppercase tracking-wide">CRM Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge variant="outline" className={`mt-1 ${getStatusColor(selectedContact.status)}`}>
                                {selectedContact.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Deal Value</p>
                              <p className="text-sm mt-1">${selectedContact.dealValue.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Notes</p>
                          <p className="text-sm">{selectedContact.notes}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Move to Pipeline
                          </Button>
                          <Button variant="outline" className="flex-1 gap-2">
                            <Mail className="w-4 h-4" />
                            Send Email
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setEditedContact(selectedContact);
                      setShowEditDialog(true);
                    }}>
                      Edit Contact
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowFormPreview(true)}>
                      View Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Contact Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update the contact details below.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={editedContact?.email || ''}
                      onChange={(e) => setEditedContact({ ...editedContact!, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editedContact?.phone || ''}
                      onChange={(e) => setEditedContact({ ...editedContact!, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={editedContact?.company || ''}
                      onChange={(e) => setEditedContact({ ...editedContact!, company: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Date Submitted</Label>
                    <Input
                      value={editedContact?.dateSubmitted || ''}
                      onChange={(e) => setEditedContact({ ...editedContact!, dateSubmitted: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {crmEnabled && (
                  <>
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label>Status</Label>
                        <Select value={editedContact?.status || 'New'} onValueChange={(value) => setEditedContact({ ...editedContact!, status: value })}>
                          <SelectTrigger className="w-full md:w-64">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by form" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Nurturing">Nurturing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label>Deal Value</Label>
                        <Input
                          value={editedContact?.dealValue?.toString() || '0'}
                          onChange={(e) => setEditedContact({ ...editedContact!, dealValue: parseInt(e.target.value) })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={editedContact?.notes || ''}
                          onChange={(e) => setEditedContact({ ...editedContact!, notes: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContacts(contacts.map(c => c.id === editedContact?.id ? editedContact : c));
                    setSelectedContact(editedContact);
                    setShowEditDialog(false);
                  }}
                  className="h-7 gap-1"
                >
                  <Check className="w-3 h-3" />
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Form Preview Dialog */}
          <Dialog open={showFormPreview} onOpenChange={setShowFormPreview}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Form Preview: {selectedContact?.formName}</DialogTitle>
                <DialogDescription>
                  Preview the form submission details for this contact.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={selectedContact?.email || ''}
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={selectedContact?.phone || ''}
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={selectedContact?.company || ''}
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label>Date Submitted</Label>
                    <Input
                      value={selectedContact?.dateSubmitted || ''}
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>

                {crmEnabled && (
                  <>
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label>Status</Label>
                        <Select value={selectedContact?.status || 'New'} onValueChange={(value) => setEditedContact({ ...editedContact, status: value })}>
                          <SelectTrigger className="w-full md:w-64">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by form" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Nurturing">Nurturing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label>Deal Value</Label>
                        <Input
                          value={selectedContact?.dealValue?.toString() || '0'}
                          readOnly
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={selectedContact?.notes || ''}
                          readOnly
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFormPreview(false)}
                  className="h-7 gap-1"
                >
                  <X className="w-3 h-3" />
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <ContactsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}