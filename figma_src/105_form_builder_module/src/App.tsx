import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatbotWidget } from './components/ChatbotWidget';
import { DashboardPage } from './components/pages/DashboardPage';
import { FormsPage } from './components/pages/FormsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { FormBuilderPage } from './components/pages/FormBuilderPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { CalendarBuilderPage } from './components/pages/CalendarBuilderPage';
import { CalendarIntegrationPage } from './components/pages/CalendarIntegrationPage';
import { ChatbotPage } from './components/pages/ChatbotPage';
import { ContactsPage } from './components/pages/ContactsPage';
import { Alert, AlertDescription } from './components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { SignOutDialog } from './components/SignOutDialog';
import { toast } from 'sonner';

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [settingsTab, setSettingsTab] = useState<string>('profile');
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(true); // Demo: Set to false to test calendar alert
  const [aiGeneratedFormData, setAiGeneratedFormData] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john.doe@clientt.com');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  
  // Integration states
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  
  // Saved forms state
  const [savedForms, setSavedForms] = useState<any[]>([]);

  const handleCreateForm = (formData?: any) => {
    setAiGeneratedFormData(formData || null);
    setIsCreatingForm(true);
  };

  const handleCreateCalendar = () => {
    setIsCreatingCalendar(true);
  };

  const handleBackFromBuilder = () => {
    setIsCreatingForm(false);
    setIsCreatingCalendar(false);
    setActivePage('Dashboard'); // Navigate back to Dashboard
  };

  const handlePageNavigation = (page: string, tab?: string) => {
    setActivePage(page);
    if (page === 'Settings' && tab) {
      setSettingsTab(tab);
    }
    setGlobalSearchQuery(''); // Clear search when navigating
    // Exit any builder mode when navigating via sidebar
    setIsCreatingForm(false);
    setIsCreatingCalendar(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleHelpSupport = () => {
    setShowChatbot(true);
    toast.info('Opening support chatbot...');
  };

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = () => {
    // In a real app, this would clear auth tokens and redirect to login
    toast.success('Signed out successfully');
    setShowSignOutDialog(false);
    // Optionally reset to default state
    setActivePage('Dashboard');
  };

  const renderPage = () => {
    if (isCreatingForm) {
      return <FormBuilderPage 
        onBack={handleBackFromBuilder} 
        onCreateCalendar={handleCreateCalendar} 
        formData={aiGeneratedFormData}
        googleConnected={googleConnected}
        outlookConnected={outlookConnected}
        chatbotEnabled={chatbotEnabled}
        onNavigateToSettings={() => {
          setActivePage('Settings');
          setSettingsTab('integrations');
        }}
        onSaveForm={(formData) => {
          setSavedForms([...savedForms, formData]);
          setIsCreatingForm(false);
          setActivePage('Forms');
        }}
      />;
    }

    if (isCreatingCalendar) {
      return <CalendarBuilderPage onBack={handleBackFromBuilder} />;
    }

    // Module-based routing
    // When adding new modules (CRM, CPQ, Billing, Support), add their page routes here
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage onCreateForm={handleCreateForm} onNavigate={setActivePage} searchQuery={globalSearchQuery} />;
      
      // Forms Module Pages
      case 'Forms':
        return <FormsPage onCreateForm={handleCreateForm} searchQuery={globalSearchQuery} onNavigate={setActivePage} savedForms={savedForms} />;
      case 'Contacts':
        return <ContactsPage crmEnabled={false} />;
      case 'Calendar Integration':
        return <CalendarIntegrationPage />;
      case 'Chatbot':
        return <ChatbotPage />;
      
      // System Pages
      case 'Settings':
        return <SettingsPage 
          profilePhoto={profilePhoto}
          onProfilePhotoChange={setProfilePhoto}
          userName={userName}
          onUserNameChange={setUserName}
          userEmail={userEmail}
          onUserEmailChange={setUserEmail}
          initialTab={settingsTab}
          googleConnected={googleConnected}
          onGoogleConnectedChange={setGoogleConnected}
          outlookConnected={outlookConnected}
          onOutlookConnectedChange={setOutlookConnected}
          chatbotEnabled={chatbotEnabled}
          onChatbotEnabledChange={setChatbotEnabled}
        />;
      case 'Notifications':
        return <NotificationsPage />;
      
      // Future Module Pages (add cases when modules are activated)
      // CRM: case 'CRM Contacts': return <ContactsPage crmEnabled={true} />;
      // CPQ: case 'Quotes': return <QuotesPage ... />;
      // Billing: case 'Invoices': return <InvoicesPage ... />;
      // Support: case 'Tickets': return <TicketsPage ... />;
      
      default:
        return <DashboardPage onCreateForm={handleCreateForm} onNavigate={setActivePage} searchQuery={globalSearchQuery} />;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Toaster />
        {/* Sidebar - Hidden when in builder mode */}
        {!isCreatingForm && !isCreatingCalendar && (
          <Sidebar activePage={activePage} onNavigate={handlePageNavigation} isOpen={isSidebarOpen} />
        )}

        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          onNavigate={handlePageNavigation}
          profilePhoto={profilePhoto}
          userName={userName}
          userEmail={userEmail}
          onHelpSupport={handleHelpSupport}
          onSignOut={handleSignOut}
        />

        {/* Main Content - Full width when sidebar is hidden or in builder mode */}
        <main className={`pt-16 p-8 transition-all duration-300 ${
          (isCreatingForm || isCreatingCalendar) ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-0')
        }`}>
          {renderPage()}
        </main>

        {/* Chatbot Widget */}
        <ChatbotWidget autoOpen={showChatbot} calendarConnected={calendarConnected} />

        {/* Sign Out Confirmation Dialog */}
        <SignOutDialog
          open={showSignOutDialog}
          onOpenChange={setShowSignOutDialog}
          onConfirm={confirmSignOut}
        />
      </div>
    </DndProvider>
  );
}