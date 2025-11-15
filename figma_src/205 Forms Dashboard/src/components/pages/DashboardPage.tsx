import { KPICard } from '../KPICard';
import { PerformanceChart } from '../PerformanceChart';
import { AIAssistant } from '../AIAssistant';
import { RecentFormsTable } from '../RecentFormsTable';
import { AIInsightsCards } from '../AIInsightsCards';
import { FileText, Send, Users, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';

type DashboardPageProps = {
  onCreateForm: (formData?: any) => void;
  onNavigate: (page: string) => void;
  searchQuery?: string;
};

export function DashboardPage({ onCreateForm, onNavigate, searchQuery = '' }: DashboardPageProps) {
  const [kpiDetailDialog, setKpiDetailDialog] = useState<{
    isOpen: boolean;
    type: 'forms' | 'submissions' | 'users' | 'conversion' | null;
  }>({ isOpen: false, type: null });

  const handleAIFormGenerated = (formData: any) => {
    // Navigate to form builder with AI-generated form
    onCreateForm(formData);
  };

  const openKpiDetail = (type: 'forms' | 'submissions' | 'users' | 'conversion') => {
    setKpiDetailDialog({ isOpen: true, type });
  };

  const closeKpiDetail = () => {
    setKpiDetailDialog({ isOpen: false, type: null });
  };

  const getKpiDetailContent = () => {
    const { type } = kpiDetailDialog;
    
    if (type === 'forms') {
      return {
        title: 'Total Forms Breakdown',
        description: 'All forms across your account',
        data: [
          { label: 'Active Forms', value: 130, percent: 83.3 },
          { label: 'Draft Forms', value: 18, percent: 11.5 },
          { label: 'Paused Forms', value: 8, percent: 5.2 },
        ],
        categories: [
          { label: 'Contact & Lead Forms', value: 62, percent: 39.7 },
          { label: 'Booking & Registration', value: 48, percent: 30.8 },
          { label: 'Newsletter & Subscriptions', value: 28, percent: 17.9 },
          { label: 'Feedback & Surveys', value: 18, percent: 11.6 },
        ]
      };
    } else if (type === 'submissions') {
      return {
        title: 'Total Submissions Breakdown',
        description: 'Form submissions across all forms',
        data: [
          { label: 'Newsletter Signup', value: 892, percent: 26.0 },
          { label: 'Contact Us', value: 523, percent: 15.3 },
          { label: 'Product Inquiry', value: 445, percent: 13.0 },
          { label: 'Webinar Registration', value: 423, percent: 12.3 },
          { label: 'Demo Booking Form', value: 312, percent: 9.1 },
          { label: 'Other Forms', value: 833, percent: 24.3 },
        ]
      };
    } else if (type === 'users') {
      return {
        title: 'Active Users Breakdown',
        description: 'Users who have interacted with your forms',
        data: [
          { label: 'New Users', value: 892, percent: 47.1 },
          { label: 'Returning Users', value: 654, percent: 34.6 },
          { label: 'Registered Users', value: 346, percent: 18.3 },
        ],
        categories: [
          { label: 'From Web Forms', value: 923, percent: 48.8 },
          { label: 'From Calendar', value: 584, percent: 30.9 },
          { label: 'From Chatbot', value: 246, percent: 13.0 },
          { label: 'Direct Access', value: 139, percent: 7.3 },
        ]
      };
    } else if (type === 'conversion') {
      return {
        title: 'Conversion Rate Analysis',
        description: 'Form completion and conversion metrics',
        data: [
          { label: 'Form Started', value: 5012, percent: 100 },
          { label: 'Form Completed', value: 3428, percent: 68.4 },
          { label: 'Partial Completion', value: 892, percent: 17.8 },
          { label: 'Abandoned', value: 692, percent: 13.8 },
        ],
        topPerformers: [
          { label: 'Demo Booking Form', value: 88, percent: 88 },
          { label: 'Newsletter Signup', value: 84, percent: 84 },
          { label: 'Product Inquiry', value: 75, percent: 75 },
          { label: 'Webinar Registration', value: 73, percent: 73 },
          { label: 'Contact Us', value: 62, percent: 62 },
        ]
      };
    }
    
    return { title: '', description: '', data: [] };
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Global KPI Cards - Expandable for future modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Forms Module KPIs */}
        <KPICard
          title="Total Forms"
          value="156"
          change={12}
          icon={FileText}
          colorClass="bg-[#2278c0]"
          onClick={() => openKpiDetail('forms')}
        />
        <KPICard
          title="Total Submissions"
          value="3,428"
          change={18.5}
          icon={Send}
          colorClass="bg-[#f43098]"
          onClick={() => openKpiDetail('submissions')}
        />
        <KPICard
          title="Active Users"
          value="1,892"
          change={8.2}
          icon={Users}
          colorClass="bg-[#00d3bb]"
          onClick={() => openKpiDetail('users')}
        />
        <KPICard
          title="Conversion Rate"
          value="68.4%"
          change={5.3}
          icon={TrendingUp}
          colorClass="bg-[#7C3AED]"
          onClick={() => openKpiDetail('conversion')}
        />
        
        {/* Future Module KPIs - Placeholder Structure
        When CRM, CPQ, Billing, or Support modules are activated, add their KPIs here:
        
        CRM Examples:
        - Total Contacts
        - Active Deals
        - Pipeline Value
        
        CPQ Examples:
        - Total Quotes
        - Quote Acceptance Rate
        - Average Deal Size
        
        Billing Examples:
        - Monthly Revenue
        - Active Subscriptions
        - Outstanding Invoices
        
        Support Examples:
        - Open Tickets
        - Avg Response Time
        - Customer Satisfaction
        */}
      </div>

      {/* Recent Forms Table */}
      <div className="mb-6">
        <RecentFormsTable onCreateForm={onCreateForm} onNavigate={onNavigate} />
      </div>

      {/* AI Assistant + Performance Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - AI Assistant */}
        <div className="lg:col-span-1">
          <AIAssistant onFormGenerated={handleAIFormGenerated} />
        </div>

        {/* Right Column - Performance Chart */}
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
      </div>

      {/* AI Insights - Full Width */}
      <AIInsightsCards onNavigate={onNavigate} />

      {/* KPI Detail Dialog */}
      <Dialog open={kpiDetailDialog.isOpen} onOpenChange={closeKpiDetail}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{getKpiDetailContent().title}</DialogTitle>
            <DialogDescription>
              {getKpiDetailContent().description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Main Data Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Overview</h4>
              {getKpiDetailContent().data.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm">
                      {item.value.toLocaleString()} ({item.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Categories Section (if available) */}
            {(getKpiDetailContent() as any).categories && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-medium">By Category</h4>
                {(getKpiDetailContent() as any).categories.map((item: any) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm">
                      {item.value} ({item.percent.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Top Performers Section (if available) */}
            {(getKpiDetailContent() as any).topPerformers && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-medium">Top Performers</h4>
                {(getKpiDetailContent() as any).topPerformers.map((item: any) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeKpiDetail}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                closeKpiDetail();
                onNavigate('Forms');
              }}
            >
              View Full Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}