import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Type,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  ListOrdered,
  AlignLeft,
  Link,
  Hash,
  Upload,
  Settings,
  Sparkles,
  Save,
  MessageSquare,
  Palette,
  User,
  MapPin,
  Briefcase,
  Cake,
  CreditCard,
  List,
  FileText,
  DollarSign,
  Minus,
  RotateCcw,
  Heading,
  Space,
  Banknote,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { DraggableFieldTile } from './DraggableFieldTile';

type FormFieldsSidebarProps = {
  addField: (type: string, label?: string) => void;
  setShowAIAssistant: (show: boolean) => void;
  setIsDesignOptionsOpen: (open: boolean) => void;
  onNavigateToSettings?: () => void;
  contactsOpen: boolean;
  setContactsOpen: (open: boolean) => void;
  generalOpen: boolean;
  setGeneralOpen: (open: boolean) => void;
  choicesOpen: boolean;
  setChoicesOpen: (open: boolean) => void;
  serviceOpen: boolean;
  setServiceOpen: (open: boolean) => void;
  paymentsOpen: boolean;
  setPaymentsOpen: (open: boolean) => void;
  buttonsOpen: boolean;
  setButtonsOpen: (open: boolean) => void;
  layoutOpen: boolean;
  setLayoutOpen: (open: boolean) => void;
  aiToolsOpen: boolean;
  setAiToolsOpen: (open: boolean) => void;
};

export function FormFieldsSidebar({
  addField,
  setShowAIAssistant,
  setIsDesignOptionsOpen,
  onNavigateToSettings,
  contactsOpen,
  setContactsOpen,
  generalOpen,
  setGeneralOpen,
  choicesOpen,
  setChoicesOpen,
  serviceOpen,
  setServiceOpen,
  paymentsOpen,
  setPaymentsOpen,
  buttonsOpen,
  setButtonsOpen,
  layoutOpen,
  setLayoutOpen,
  aiToolsOpen,
  setAiToolsOpen,
}: FormFieldsSidebarProps) {
  return (
    <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pb-6 scrollbar-thin">
      <Card className="p-0">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg">Add Form Fields</h2>
          <p className="text-xs text-muted-foreground mt-1">Drag and drop fields to your form</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Contacts Category */}
          <Collapsible open={contactsOpen} onOpenChange={setContactsOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Contacts</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${contactsOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <DraggableFieldTile type="text" label="First Name" icon={User} onClick={() => addField('text', 'First Name')} />
                <DraggableFieldTile type="text" label="Last Name" icon={User} onClick={() => addField('text', 'Last Name')} />
                <DraggableFieldTile type="email" label="Email" icon={Mail} onClick={() => addField('email', 'Email')} />
                <DraggableFieldTile type="phone" label="Phone" icon={Phone} onClick={() => addField('phone', 'Phone')} />
                <DraggableFieldTile type="text" label="Address" icon={MapPin} onClick={() => addField('text', 'Address')} />
                <DraggableFieldTile type="text" label="Company" icon={Briefcase} onClick={() => addField('text', 'Company')} />
                <DraggableFieldTile type="text" label="Position" icon={Briefcase} onClick={() => addField('text', 'Position')} />
                <DraggableFieldTile type="date" label="Birthday" icon={Cake} onClick={() => addField('date', 'Birthday')} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* General Category */}
          <Collapsible open={generalOpen} onOpenChange={setGeneralOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">General</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${generalOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <DraggableFieldTile type="text" label="Short Answer" icon={Type} onClick={() => addField('text', 'Short Answer')} />
                <DraggableFieldTile type="textarea" label="Long Answer" icon={AlignLeft} onClick={() => addField('textarea', 'Long Answer')} />
                <DraggableFieldTile type="number" label="Number" icon={Hash} onClick={() => addField('number', 'Number')} />
                <DraggableFieldTile type="dropdown" label="Dropdown" icon={ListOrdered} onClick={() => addField('dropdown', 'Dropdown')} />
                <DraggableFieldTile type="date" label="Date" icon={Calendar} onClick={() => addField('date', 'Date')} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Choices Category */}
          <Collapsible open={choicesOpen} onOpenChange={setChoicesOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Choices</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${choicesOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <DraggableFieldTile type="checkbox" label="Checkbox" icon={CheckSquare} onClick={() => addField('checkbox', 'Checkbox')} />
                <DraggableFieldTile type="radio" label="Radio Buttons" icon={ListOrdered} onClick={() => addField('radio', 'Radio Buttons')} />
                <DraggableFieldTile type="dropdown" label="Multi-select" icon={List} onClick={() => addField('dropdown', 'Multi-select')} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Service Inquiry Category */}
          <Collapsible open={serviceOpen} onOpenChange={setServiceOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Service Inquiry</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${serviceOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <DraggableFieldTile type="file" label="File Upload" icon={Upload} onClick={() => addField('file', 'File Upload')} />
                <DraggableFieldTile type="url" label="URL" icon={Link} onClick={() => addField('url', 'URL')} />
                <DraggableFieldTile type="text" label="VAT ID" icon={Hash} onClick={() => addField('text', 'VAT ID')} />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Payments Category (Future) */}
          <Collapsible open={paymentsOpen} onOpenChange={setPaymentsOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Payments</span>
                <Badge variant="secondary" className="text-[10px] ml-auto mr-2">Future</Badge>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${paymentsOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <DraggableFieldTile type="payment" label="Payment Amount" icon={DollarSign} onClick={() => toast.info('Payment fields coming soon!')} disabled />
                <DraggableFieldTile type="currency" label="Currency" icon={Banknote} onClick={() => toast.info('Payment fields coming soon!')} disabled />
                <DraggableFieldTile type="card" label="Card Input" icon={CreditCard} onClick={() => toast.info('Payment fields coming soon!')} disabled />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Buttons Category */}
          <Collapsible open={buttonsOpen} onOpenChange={setButtonsOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Buttons</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${buttonsOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <button
                  onClick={() => toast.success('Submit button is always included')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Save className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-center">Submit</span>
                </button>

                <button
                  onClick={() => toast.info('Reset button added')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <RotateCcw className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-center">Reset</span>
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Layout Elements Category */}
          <Collapsible open={layoutOpen} onOpenChange={setLayoutOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <Heading className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Layout Elements</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${layoutOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 p-2">
                <button
                  onClick={() => {
                    addField('divider', 'Divider');
                    toast.info('Divider added');
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Minus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-center">Divider</span>
                </button>

                <button
                  onClick={() => {
                    addField('section-header', 'Section Title');
                    toast.info('Section header added');
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Heading className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-center">Section Header</span>
                </button>

                <button
                  onClick={() => {
                    addField('spacer', 'Spacer');
                    toast.info('Spacer added');
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Space className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-center">Spacer</span>
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-4" />

          {/* AI Tools & Settings Section */}
          <Collapsible open={aiToolsOpen} onOpenChange={setAiToolsOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">AI Tools & Settings</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${aiToolsOpen ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 mt-2 p-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setShowAIAssistant(true);
                          toast.info('AI Forms Assistant activated');
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all bg-gradient-to-r from-primary/5 to-secondary/5"
                      >
                        <Sparkles className="w-5 h-5 text-primary" />
                        <div className="flex-1 text-left">
                          <div className="text-sm">AI Forms Assistant</div>
                          <div className="text-xs text-muted-foreground">Generate or improve forms</div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">Generate or improve your form automatically</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <button
                  onClick={() => onNavigateToSettings?.()}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="text-sm">AI Chat Settings</div>
                    <div className="text-xs text-muted-foreground">Configure chatbot</div>
                  </div>
                </button>

                <button
                  onClick={() => setIsDesignOptionsOpen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <div className="text-sm">Theme & Design Options</div>
                    <div className="text-xs text-muted-foreground">Customize appearance</div>
                  </div>
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}