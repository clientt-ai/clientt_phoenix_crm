import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  ArrowLeft,
  Settings,
  Sparkles,
  Eye,
  Save,
  Plus,
  X,
  Type,
  Mail,
  Phone,
  AlignLeft,
  Hash,
  Calendar,
  ListOrdered,
  CheckSquare,
  Link,
  Upload,
  ChevronDown,
  Palette,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { FormFieldsSidebar } from '../FormFieldsSidebar';
import { DraggableField } from '../DraggableField';
import { FormGridCanvas } from '../FormGridCanvas';
import { applySuggestionToForm, generateFormSuggestions, generateFormFieldsFromQuery, getAIResponse } from '../../lib/aiHelpers';

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  gridSpan?: number; // Number of columns (1-12)
  gridRow?: number; // Which row the field is in
  gridColumn?: number; // Starting column position (1-12)
};

type FieldOption = {
  icon: any;
  type: string;
  label: string;
  category: 'basic' | 'advanced' | 'ai' | 'custom';
};

const fieldOptions: FieldOption[] = [
  // Basic Fields
  { icon: Type, type: 'text', label: 'Short Text', category: 'basic' },
  { icon: Mail, type: 'email', label: 'Email', category: 'basic' },
  { icon: Phone, type: 'phone', label: 'Phone', category: 'basic' },
  { icon: AlignLeft, type: 'textarea', label: 'Long Text', category: 'basic' },
  
  // Advanced Fields
  { icon: Hash, type: 'number', label: 'Number', category: 'advanced' },
  { icon: Calendar, type: 'date', label: 'Date', category: 'advanced' },
  { icon: ListOrdered, type: 'dropdown', label: 'Dropdown', category: 'advanced' },
  { icon: ListOrdered, type: 'radio', label: 'Radio Buttons', category: 'advanced' },
  { icon: CheckSquare, type: 'checkbox', label: 'Checkbox', category: 'advanced' },
  { icon: Link, type: 'url', label: 'URL', category: 'advanced' },
  { icon: Upload, type: 'file', label: 'File Upload', category: 'advanced' },
  { icon: ChevronDown, type: 'divider', label: 'Divider', category: 'advanced' },
  { icon: AlignLeft, type: 'section-header', label: 'Section Title', category: 'advanced' },
  { icon: ChevronDown, type: 'spacer', label: 'Spacer', category: 'advanced' },
];

type FormBuilderPageProps = {
  onBack: () => void;
  onCreateCalendar?: () => void;
  formData?: {
    title: string;
    description: string;
    fields: any[];
  } | null;
  googleConnected?: boolean;
  outlookConnected?: boolean;
  chatbotEnabled?: boolean;
  onNavigateToSettings?: () => void;
  onSaveForm?: (formData: any) => void;
};

export function FormBuilderPage({ 
  onBack, 
  onCreateCalendar, 
  formData,
  googleConnected = false,
  outlookConnected = false,
  chatbotEnabled = true,
  onNavigateToSettings,
  onSaveForm
}: FormBuilderPageProps) {
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FieldType[]>([
    {
      id: '1',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
    },
    {
      id: '2',
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
    },
  ]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [showFieldsSidebar, setShowFieldsSidebar] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isDesignOptionsOpen, setIsDesignOptionsOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Design Options State
  const [fontType, setFontType] = useState('Inter');
  const [fontSize, setFontSize] = useState('14');
  const [borderColor, setBorderColor] = useState('#d4d4d8');
  const [transparency, setTransparency] = useState([100]);
  const [buttonColor, setButtonColor] = useState('#2278c0');
  const [assignedCalendar, setAssignedCalendar] = useState<string>('');
  
  // Post-submission actions state
  const [redirectUrl, setRedirectUrl] = useState('');
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [openChatbotOnSubmit, setOpenChatbotOnSubmit] = useState(false);
  const [bookDemoOnSubmit, setBookDemoOnSubmit] = useState(false);

  // Collapsible category states
  const [contactsOpen, setContactsOpen] = useState(true);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [choicesOpen, setChoicesOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [buttonsOpen, setButtonsOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);

  // Initialize form with AI-generated data if provided
  useEffect(() => {
    if (formData) {
      setFormTitle(formData.title || '');
      setFormDescription(formData.description || '');
      if (formData.fields && Array.isArray(formData.fields)) {
        setFields(formData.fields);
        toast.success(`✨ Created "${formData.title}" with ${formData.fields.length} fields!`, {
          description: 'All fields are customizable. Click any field to edit.',
        });
      }
      setAiSuggestions([
        'Form generated successfully! All fields are customizable',
        'Click any field to edit its properties',
        'Add more fields from the sidebar if needed',
      ]);
    }
  }, [formData]);
  
  // Update AI suggestions when fields change
  useEffect(() => {
    const suggestions = generateFormSuggestions(fields);
    if (suggestions.length > 0) {
      setAiSuggestions(suggestions);
    }
  }, [fields]);

  const addField = (type: string, label?: string) => {
    const fieldDefaults: { [key: string]: { label: string; placeholder: string } } = {
      text: { label: 'Full Name', placeholder: 'Enter your full name' },
      email: { label: 'Email Address', placeholder: 'your.email@example.com' },
      phone: { label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
      textarea: { label: 'Message', placeholder: 'Enter your message here...' },
      number: { label: 'Number', placeholder: '0' },
      date: { label: 'Date', placeholder: '' },
      dropdown: { label: 'Select Option', placeholder: 'Choose an option' },
      radio: { label: 'Choose One', placeholder: '' },
      checkbox: { label: 'I agree to the terms and conditions', placeholder: '' },
      url: { label: 'Website URL', placeholder: 'https://example.com' },
      file: { label: 'Upload File', placeholder: '' },
      divider: { label: 'Divider', placeholder: '' },
      'section-header': { label: 'Section Title', placeholder: 'Enter section description (optional)' },
      spacer: { label: 'Spacer', placeholder: '' },
    };

    // Smart placeholders based on custom labels
    const getSmartPlaceholder = (fieldLabel: string, fieldType: string): string => {
      const lowerLabel = fieldLabel.toLowerCase();
      
      // Name fields
      if (lowerLabel.includes('first name')) return 'Enter your first name';
      if (lowerLabel.includes('last name')) return 'Enter your last name';
      if (lowerLabel.includes('full name')) return 'Enter your full name';
      if (lowerLabel.includes('name')) return 'Enter name';
      
      // Contact fields
      if (lowerLabel.includes('email')) return 'your.email@example.com';
      if (lowerLabel.includes('phone')) return '+1 (555) 000-0000';
      if (lowerLabel.includes('address')) return 'Enter your address';
      if (lowerLabel.includes('company')) return 'Enter company name';
      if (lowerLabel.includes('position')) return 'Enter your position';
      
      // Other fields
      if (lowerLabel.includes('birthday')) return 'Select date';
      if (lowerLabel.includes('message') || lowerLabel.includes('long answer')) return 'Enter your message here...';
      if (lowerLabel.includes('short answer')) return 'Enter your answer';
      if (lowerLabel.includes('number')) return '0';
      if (lowerLabel.includes('url') || lowerLabel.includes('website')) return 'https://example.com';
      if (lowerLabel.includes('vat')) return 'Enter VAT ID';
      if (lowerLabel.includes('dropdown') || lowerLabel.includes('select')) return 'Choose an option';
      if (lowerLabel.includes('section')) return 'Enter section description (optional)';
      
      // Default based on type
      return fieldDefaults[fieldType]?.placeholder || '';
    };

    // Use custom label if provided, otherwise use default
    const finalLabel = label || fieldDefaults[type]?.label || type.charAt(0).toUpperCase() + type.slice(1);
    const finalPlaceholder = getSmartPlaceholder(finalLabel, type);

    // Layout elements default to full width
    const defaultSpan = (type === 'divider' || type === 'section-header' || type === 'spacer') ? 12 : 6;

    const newField: FieldType = {
      id: Date.now().toString(),
      type,
      label: finalLabel,
      placeholder: finalPlaceholder,
      required: false,
      options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      gridSpan: defaultSpan,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const updateField = (id: string, updates: Partial<FieldType>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex((f) => f.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const moveFieldByIndex = (dragIndex: number, hoverIndex: number) => {
    const newFields = [...fields];
    const [draggedField] = newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    setFields(newFields);
  };

  // AI Functions
  const handleApplySuggestion = async (suggestion: string) => {
    const newField = applySuggestionToForm(suggestion, fields);
    if (newField) {
      setFields([...fields, newField]);
      toast.success('Field added successfully!');
      // Refresh suggestions
      const updatedSuggestions = generateFormSuggestions([...fields, newField]);
      setAiSuggestions(updatedSuggestions);
    } else {
      toast.info('Suggestion noted! Consider implementing this improvement.');
    }
  };

  const handleGetAISuggestions = async () => {
    if (!aiQuery.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsGeneratingSuggestions(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if this is a form creation request
    const generatedFields = generateFormFieldsFromQuery(aiQuery);
    
    if (generatedFields && generatedFields.length > 0) {
      // Replace current fields with the generated form
      setFields(generatedFields);
      
      // Also update the form title based on the query
      const lowerQuery = aiQuery.toLowerCase();
      if (lowerQuery.includes('restaurant')) {
        setFormTitle('Restaurant Reservation Form');
        setFormDescription('Book a table at our restaurant');
      } else if (lowerQuery.includes('real estate') || lowerQuery.includes('property')) {
        setFormTitle('Property Inquiry Form');
        setFormDescription('Find your dream home');
      } else if (lowerQuery.includes('course') || lowerQuery.includes('class')) {
        setFormTitle('Course Enrollment Form');
        setFormDescription('Register for our courses');
      } else if (lowerQuery.includes('doctor') || lowerQuery.includes('medical') || lowerQuery.includes('appointment')) {
        setFormTitle('Appointment Booking Form');
        setFormDescription('Schedule your appointment');
      } else if (lowerQuery.includes('gym') || lowerQuery.includes('fitness')) {
        setFormTitle('Gym Membership Form');
        setFormDescription('Join our fitness community');
      } else if (lowerQuery.includes('hotel') || lowerQuery.includes('booking')) {
        setFormTitle('Hotel Booking Form');
        setFormDescription('Reserve your stay');
      } else if (lowerQuery.includes('event') || lowerQuery.includes('rsvp')) {
        setFormTitle('Event Registration Form');
        setFormDescription('Register for our event');
      } else if (lowerQuery.includes('dentist') || lowerQuery.includes('dental')) {
        setFormTitle('Dental Appointment Form');
        setFormDescription('Schedule your dental visit');
      } else if (lowerQuery.includes('job') || lowerQuery.includes('application')) {
        setFormTitle('Job Application Form');
        setFormDescription('Apply for a position');
      } else if (lowerQuery.includes('contact')) {
        setFormTitle('Contact Us Form');
        setFormDescription('Get in touch with us');
      } else if (lowerQuery.includes('feedback') || lowerQuery.includes('survey')) {
        setFormTitle('Feedback Form');
        setFormDescription('Share your thoughts');
      } else if (lowerQuery.includes('newsletter') || lowerQuery.includes('subscribe')) {
        setFormTitle('Newsletter Signup');
        setFormDescription('Subscribe to our newsletter');
      }
      
      toast.success('Form created with AI!', {
        description: `Generated ${generatedFields.length} fields based on your request.`,
      });
      
      setAiQuery('');
      setIsGeneratingSuggestions(false);
      return;
    }
    
    // Otherwise, get a text response
    const response = getAIResponse(aiQuery, fields);
    setAiResponse(response);
    
    toast.success('AI response generated!');
    setAiQuery('');
    setIsGeneratingSuggestions(false);
  };
  
  // Save Form Function
  const handleSaveForm = async () => {
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const formData = {
      title: formTitle,
      description: formDescription,
      fields: fields,
      design: {
        fontType,
        fontSize,
        borderColor,
        transparency: transparency[0],
        buttonColor,
      },
      postSubmission: {
        assignedCalendar,
        redirectUrl,
        openChatbotOnSubmit,
        bookDemoOnSubmit,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in localStorage for demonstration
    localStorage.setItem('savedForm', JSON.stringify(formData));
    
    toast.success('Form saved successfully!', {
      description: `"${formTitle}" has been saved with ${fields.length} fields.`,
    });
    
    if (onSaveForm) {
      onSaveForm(formData);
    }
    
    setIsSaving(false);
  };
  
  // Render field for preview
  const renderPreviewField = (field: FieldType) => {
    const baseInputClass = "w-full px-3 py-2 border rounded-md";
    const style = {
      borderColor,
      fontFamily: fontType,
      fontSize: `${fontSize}px`,
    };
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            placeholder={field.placeholder}
            required={field.required}
            type={field.type === 'email' ? 'email' : 'text'}
            style={style}
            className={baseInputClass}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            style={style}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            required={field.required}
            style={style}
            className={baseInputClass}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            required={field.required}
            style={style}
            className={baseInputClass}
          />
        );
      
      case 'dropdown':
        return (
          <Select required={field.required}>
            <SelectTrigger style={style}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
                <SelectItem key={i} value={option.toLowerCase().replace(/\s+/g, '-')}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.id}-${i}`}
                  name={field.id}
                  value={option}
                  className="w-4 h-4"
                />
                <label htmlFor={`${field.id}-${i}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <label className="text-sm">{field.label}</label>
          </div>
        );
      
      case 'file':
        return (
          <div className="border-2 border-dashed rounded-md p-6 text-center" style={{ borderColor }}>
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          </div>
        );
      
      case 'divider':
        return <Separator className="my-4" />;
      
      case 'section-header':
        return (
          <div className="mb-4">
            <h3 className="text-lg mb-1">{field.label}</h3>
            {field.placeholder && (
              <p className="text-sm text-muted-foreground">{field.placeholder}</p>
            )}
          </div>
        );
      
      case 'spacer':
        return <div className="h-8" />;
      
      default:
        return (
          <Input
            placeholder={field.placeholder}
            required={field.required}
            style={style}
            className={baseInputClass}
          />
        );
    }
  };

  // Group fields by category
  const basicFields = fieldOptions.filter(f => f.category === 'basic');
  const advancedFields = fieldOptions.filter(f => f.category === 'advanced');

  return (
    <div className="max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-[38px] font-bold mb-1">Form Builder</h1>
            <p className="text-muted-foreground">
              Create and customize your form with AI assistance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFieldsSidebar(!showFieldsSidebar)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showFieldsSidebar ? 'Hide' : 'Show'} Fields
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      {/* Post-Submission Actions - Moved to Top */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Post-Submission Actions</h3>
            <p className="text-sm text-muted-foreground">
              Configure what happens after form submission
            </p>
          </div>
          <TooltipProvider>
            <div className="flex gap-2">
              {/* Book a Demo Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant={bookDemoOnSubmit ? "default" : "outline"}
                      onClick={() => {
                        if (googleConnected || outlookConnected) {
                          setBookDemoOnSubmit(!bookDemoOnSubmit);
                          if (!bookDemoOnSubmit) {
                            toast.success('Demo booking will be offered after form submission');
                          } else {
                            toast.info('Demo booking action removed');
                          }
                        } else {
                          toast.error('Calendar integration required');
                          if (onNavigateToSettings) {
                            setTimeout(() => {
                              toast.info('Redirecting to Settings...');
                              onNavigateToSettings();
                            }, 1500);
                          }
                        }
                      }}
                      disabled={!googleConnected && !outlookConnected}
                      className="gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book a Demo
                      {bookDemoOnSubmit && <Badge className="ml-2 bg-green-500">Active</Badge>}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!googleConnected && !outlookConnected && (
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Please configure your calendar integration before using this option.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Open Chatbot Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant={openChatbotOnSubmit ? "default" : "outline"}
                      onClick={() => {
                        if (chatbotEnabled) {
                          setOpenChatbotOnSubmit(!openChatbotOnSubmit);
                          if (!openChatbotOnSubmit) {
                            toast.success('Chatbot will open after form submission');
                          } else {
                            toast.info('Chatbot action removed');
                          }
                        } else {
                          toast.error('Chatbot integration required');
                          if (onNavigateToSettings) {
                            setTimeout(() => {
                              toast.info('Redirecting to Settings...');
                              onNavigateToSettings();
                            }, 1500);
                          }
                        }
                      }}
                      disabled={!chatbotEnabled}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Open Chatbot
                      {openChatbotOnSubmit && <Badge className="ml-2 bg-green-500">Active</Badge>}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!chatbotEnabled && (
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Please configure your chatbot integration before using this option.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Redirect URL Button */}
              <Button 
                variant={redirectUrl ? "default" : "outline"} 
                className="gap-2" 
                onClick={() => setShowRedirectDialog(true)}
              >
                <ExternalLink className="w-4 h-4" />
                Redirect URL
                {redirectUrl && <Badge className="ml-2 bg-green-500">Set</Badge>}
              </Button>
            </div>
          </TooltipProvider>
        </div>
        
        {/* Active Post-Submission Actions Summary */}
        {(bookDemoOnSubmit || openChatbotOnSubmit || redirectUrl || assignedCalendar) && (
          <div className="space-y-3">
            <Separator />
            <div className="pt-3">
              <Label className="mb-2 block text-sm">Active Actions</Label>
              <div className="flex flex-wrap gap-2">
                {bookDemoOnSubmit && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Demo Booking Enabled
                  </Badge>
                )}
                {openChatbotOnSubmit && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Chatbot Enabled
                  </Badge>
                )}
                {redirectUrl && (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Redirect: {redirectUrl.length > 30 ? redirectUrl.substring(0, 30) + '...' : redirectUrl}
                  </Badge>
                )}
                {assignedCalendar && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Calendar: {assignedCalendar}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Calendar Assignment Section */}
        {(googleConnected || outlookConnected) && (
          <div className="space-y-3">
            <Separator />
            <div className="pt-3">
              <Label htmlFor="calendarAssignment" className="mb-2 block">
                Assign Calendar Integration
              </Label>
              <Select value={assignedCalendar} onValueChange={(value) => {
                setAssignedCalendar(value);
                toast.success(`Calendar assigned: ${value}`);
              }}>
                <SelectTrigger id="calendarAssignment">
                  <SelectValue placeholder="Select a calendar for this form" />
                </SelectTrigger>
                <SelectContent>
                  {googleConnected && (
                    <>
                      <SelectItem value="google-main">Google Calendar - Main</SelectItem>
                      <SelectItem value="google-sales">Google Calendar - Sales</SelectItem>
                      <SelectItem value="google-support">Google Calendar - Support</SelectItem>
                    </>
                  )}
                  {outlookConnected && (
                    <>
                      <SelectItem value="outlook-main">Microsoft Outlook - Main</SelectItem>
                      <SelectItem value="outlook-sales">Microsoft Outlook - Sales</SelectItem>
                      <SelectItem value="outlook-support">Microsoft Outlook - Support</SelectItem>
                    </>
                  )}
                  <SelectItem value="clientt">Clientt Internal Calendar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose which calendar will receive bookings from this form
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Left Sidebar - Wix-Style Field Categories */}
        {showFieldsSidebar && (
          <div className="col-span-3">
            <FormFieldsSidebar
              addField={addField}
              setShowAIAssistant={setShowAIAssistant}
              setIsDesignOptionsOpen={setIsDesignOptionsOpen}
              onNavigateToSettings={onNavigateToSettings}
              contactsOpen={contactsOpen}
              setContactsOpen={setContactsOpen}
              generalOpen={generalOpen}
              setGeneralOpen={setGeneralOpen}
              choicesOpen={choicesOpen}
              setChoicesOpen={setChoicesOpen}
              serviceOpen={serviceOpen}
              setServiceOpen={setServiceOpen}
              paymentsOpen={paymentsOpen}
              setPaymentsOpen={setPaymentsOpen}
              buttonsOpen={buttonsOpen}
              setButtonsOpen={setButtonsOpen}
              layoutOpen={layoutOpen}
              setLayoutOpen={setLayoutOpen}
              aiToolsOpen={aiToolsOpen}
              setAiToolsOpen={setAiToolsOpen}
            />
          </div>
        )}

        {/* Center - Form Canvas */}
        <div className={
          showFieldsSidebar 
            ? (selectedField ? 'col-span-5' : (showAIAssistant ? 'col-span-5' : 'col-span-6'))
            : (selectedField ? 'col-span-8' : (showAIAssistant ? 'col-span-8' : 'col-span-9'))
        }>
          <Card className="p-8">
            {/* Form Header */}
            <div className="mb-8">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-2xl border-none px-0 mb-2 focus-visible:ring-0"
                placeholder="Form Title"
              />
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-none px-0 resize-none focus-visible:ring-0"
                placeholder="Add a description for your form..."
                rows={2}
              />
            </div>

            <Separator className="mb-6" />

            {/* Form Fields - Drop Zone with Drag & Drop */}
            <FormGridCanvas
              fields={fields}
              selectedFieldId={selectedFieldId}
              borderColor={borderColor}
              fontType={fontType}
              fontSize={fontSize}
              onSelectField={setSelectedFieldId}
              onRemoveField={removeField}
              onAddField={addField}
              onMoveField={moveFieldByIndex}
              onUpdateField={updateField}
            />

            {/* Quick Add Field Button - Show when sidebar is hidden */}
            {!showFieldsSidebar && fields.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowFieldsSidebar(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Fields
                </Button>
              </div>
            )}

            {/* Submit Button Preview */}
            <div className="mt-8">
              <Button 
                className="w-full text-white" 
                style={{ 
                  backgroundColor: buttonColor,
                  opacity: transparency[0] / 100 
                }}
              >
                Submit Form
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Properties and AI Assistant */}
        <div className={selectedField ? 'col-span-4' : (showAIAssistant ? 'col-span-4' : 'col-span-3')}>
          <div className="flex flex-col gap-4 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pb-6">
            {/* Field Properties - Hug contents */}
            {selectedField && (
              <Card className="p-6 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5" />
                  <h3>Field Properties</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Field Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) =>
                        updateField(selectedField.id, { label: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Placeholder</Label>
                    <Input
                      value={selectedField.placeholder || ''}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          placeholder: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Description (Optional)</Label>
                    <Textarea
                      value={selectedField.description || ''}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          description: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Required Field</Label>
                    <Switch
                      checked={selectedField.required}
                      onCheckedChange={(checked) =>
                        updateField(selectedField.id, { required: checked })
                      }
                    />
                  </div>
                  {(selectedField.type === 'dropdown' ||
                    selectedField.type === 'radio') && (
                    <div>
                      <Label className="mb-2 block">Options</Label>
                      <div className="space-y-2">
                        {selectedField.options?.map((option, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(selectedField.options || [])];
                                newOptions[i] = e.target.value;
                                updateField(selectedField.id, {
                                  options: newOptions,
                                });
                              }}
                            />
                            <button
                              onClick={() => {
                                const newOptions = selectedField.options?.filter(
                                  (_, idx) => idx !== i
                                );
                                updateField(selectedField.id, {
                                  options: newOptions,
                                });
                              }}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const newOptions = [
                              ...(selectedField.options || []),
                              `Option ${(selectedField.options?.length || 0) + 1}`,
                            ];
                            updateField(selectedField.id, { options: newOptions });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => removeField(selectedField.id)}
                  >
                    Delete Field
                  </Button>
                </div>
              </Card>
            )}

            {/* Design Options Panel */}
            <Card className="p-6 flex-shrink-0">
              <Collapsible open={isDesignOptionsOpen} onOpenChange={setIsDesignOptionsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      <h3>Design Options</h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDesignOptionsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="mb-2 block text-sm">Font Type</Label>
                      <Select value={fontType} onValueChange={setFontType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm">Font Size (px)</Label>
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                          <SelectItem value="20">20px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm">Field Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm">Form Transparency</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={transparency}
                          onValueChange={setTransparency}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground w-12">{transparency[0]}%</span>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block text-sm">Button Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={buttonColor}
                          onChange={(e) => setButtonColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={buttonColor}
                          onChange={(e) => setButtonColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* AI Forms Assistant - Only show in sidebar when no field is selected */}
            {showAIAssistant && !selectedField && (
              <Card className="p-6 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3>AI Forms Assistant</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get intelligent suggestions to improve your form
                </p>
                
                {/* AI Suggestions */}
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {aiSuggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm mb-2">{suggestion}</p>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleApplySuggestion(suggestion)}>
                        Apply Suggestion
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* AI Response Display */}
                {aiResponse && (
                  <>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">{aiResponse}</p>
                        </div>
                        <button
                          onClick={() => setAiResponse('')}
                          className="p-1 hover:bg-primary/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                <Separator className="my-4" />
                
                {/* Ask AI Assistant */}
                <div className="mb-4">
                  <Label className="text-sm mb-2 block">Ask AI Assistant</Label>
                  <Textarea
                    placeholder="Try: 'Create a restaurant reservation form' or 'How can I improve this?'"
                    rows={3}
                    className="mb-2"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleGetAISuggestions();
                      }
                    }}
                  />
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={handleGetAISuggestions} disabled={isGeneratingSuggestions}>
                    {isGeneratingSuggestions ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Get Suggestions'
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Cmd/Ctrl + Enter to submit
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* AI Forms Assistant - Horizontal layout at bottom when field is selected */}
      {showAIAssistant && selectedField && (
        <Card className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* AI Header Section */}
            <div className="col-span-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3>AI Forms Assistant</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get intelligent suggestions to improve your form
              </p>
            </div>

            {/* AI Suggestions - Horizontal */}
            <div className="col-span-6">
              {aiResponse ? (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 h-full">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{aiResponse}</p>
                    </div>
                    <button
                      onClick={() => setAiResponse('')}
                      className="p-1 hover:bg-primary/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {aiSuggestions.map((suggestion, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex flex-col"
                    >
                      <p className="text-sm mb-2 flex-1">{suggestion}</p>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleApplySuggestion(suggestion)}>
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ask AI Section */}
            <div className="col-span-3">
              <Label className="text-sm mb-2 block">Ask AI Assistant</Label>
              <Textarea
                placeholder="Try: 'Create a restaurant reservation form' or 'How can I improve this?'"
                rows={2}
                className="mb-2"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleGetAISuggestions();
                  }
                }}
              />
              <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={handleGetAISuggestions} disabled={isGeneratingSuggestions}>
                {isGeneratingSuggestions ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Get Suggestions'
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Cmd/Ctrl + Enter to submit
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
            <DialogDescription>
              This is how your form will appear to users
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Card className="p-8">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-2xl mb-2">{formTitle}</h2>
                {formDescription && (
                  <p className="text-muted-foreground">{formDescription}</p>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Form Fields */}
              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.id}>
                    {field.type !== 'divider' && field.type !== 'spacer' && field.type !== 'checkbox' && (
                      <Label className="mb-2 block">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    )}
                    {field.description && (
                      <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                    )}
                    {renderPreviewField(field)}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <Button 
                  className="w-full text-white" 
                  style={{ 
                    backgroundColor: buttonColor,
                    opacity: transparency[0] / 100 
                  }}
                  onClick={() => toast.info('This is a preview. Forms are not submittable in preview mode.')}

                >
                  Submit Form
                </Button>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Redirect URL Dialog */}
      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Set Redirect URL</DialogTitle>
            <DialogDescription>
              Enter the URL to which users should be redirected after form submission
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="mb-2 block">Redirect URL</Label>
              <Input
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full"
                placeholder="https://example.com/thank-you"
                type="url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Make sure to include the full URL (e.g., https://example.com)
              </p>
            </div>
            
            {redirectUrl && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  After submitting the form, users will be redirected to:
                </p>
                <p className="text-sm mt-1 break-all">
                  <strong>{redirectUrl}</strong>
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setRedirectUrl('');
                setShowRedirectDialog(false);
                toast.info('Redirect URL cleared');
              }}
            >
              Clear
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                if (redirectUrl) {
                  setShowRedirectDialog(false);
                  toast.success('Redirect URL saved successfully!');
                } else {
                  toast.error('Please enter a valid URL');
                }
              }}
            >
              Save URL
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}