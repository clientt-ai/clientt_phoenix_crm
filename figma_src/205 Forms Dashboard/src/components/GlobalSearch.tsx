import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Globe, TrendingUp, ChevronRight, X } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

// Mock data - in a real app, this would come from a centralized data store
const formsData = [
  { id: 1, name: 'Contact Us Form', type: 'Contact', submissions: 234, status: 'Active' },
  { id: 2, name: 'Newsletter Signup', type: 'Email Capture', submissions: 1289, status: 'Active' },
  { id: 3, name: 'Product Inquiry', type: 'Lead Gen', submissions: 456, status: 'Active' },
  { id: 4, name: 'Customer Feedback', type: 'Survey', submissions: 89, status: 'Draft' },
  { id: 5, name: 'Job Application', type: 'Application', submissions: 145, status: 'Active' },
  { id: 6, name: 'Event Registration', type: 'Event', submissions: 567, status: 'Active' },
  { id: 7, name: 'Support Ticket', type: 'Support', submissions: 892, status: 'Active' },
  { id: 8, name: 'Quote Request', type: 'Lead Gen', submissions: 234, status: 'Paused' },
];

const landingPagesData = [
  { id: 1, name: 'Product Launch 2024', visits: 5234, submissions: 892, status: 'Active' },
  { id: 2, name: 'Spring Sale Campaign', visits: 8901, submissions: 1456, status: 'Active' },
  { id: 3, name: 'Webinar Registration', visits: 3456, submissions: 678, status: 'Active' },
  { id: 4, name: 'Free Trial Signup', visits: 12890, submissions: 2341, status: 'Active' },
  { id: 5, name: 'E-book Download', visits: 4567, submissions: 890, status: 'Draft' },
  { id: 6, name: 'Holiday Promo 2024', visits: 6789, submissions: 1234, status: 'Paused' },
];

const analyticsData = [
  { id: 1, name: 'Product Launch 2024', type: 'Landing Page', conversions: 892, visitors: 5234, rate: '17.04%' },
  { id: 2, name: 'Newsletter Signup', type: 'Form', conversions: 1289, visitors: 3456, rate: '37.30%' },
  { id: 3, name: 'Free Trial Signup', type: 'Landing Page', conversions: 2341, visitors: 12890, rate: '18.16%' },
  { id: 4, name: 'Event Registration', type: 'Form', conversions: 567, visitors: 1890, rate: '30.00%' },
  { id: 5, name: 'Spring Sale Campaign', type: 'Landing Page', conversions: 1456, visitors: 8901, rate: '16.36%' },
];

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', description: 'Overview and analytics' },
  { id: 'forms', name: 'Forms', description: 'Manage your forms' },
  { id: 'landing-pages', name: 'Landing Pages', description: 'Manage your landing pages' },
  { id: 'analytics', name: 'Analytics', description: 'View detailed analytics' },
  { id: 'settings', name: 'Settings', description: 'Account and preferences' },
];

type SearchResult = {
  id: string;
  name: string;
  category: 'Forms' | 'Landing Pages' | 'Analytics' | 'Navigation';
  metadata?: string;
  action: () => void;
};

type GlobalSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: string) => void;
};

export function GlobalSearch({ searchQuery, onSearchChange, onNavigate }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search across all data sources
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search forms
    formsData.forEach(form => {
      if (form.name.toLowerCase().includes(query) || form.type.toLowerCase().includes(query)) {
        allResults.push({
          id: `form-${form.id}`,
          name: form.name,
          category: 'Forms',
          metadata: `${form.type} • ${form.submissions} submissions`,
          action: () => {
            onNavigate('Forms');
            setIsOpen(false);
            onSearchChange('');
          },
        });
      }
    });

    // Search landing pages
    landingPagesData.forEach(page => {
      if (page.name.toLowerCase().includes(query)) {
        allResults.push({
          id: `page-${page.id}`,
          name: page.name,
          category: 'Landing Pages',
          metadata: `${page.visits.toLocaleString()} visits • ${page.submissions} submissions`,
          action: () => {
            onNavigate('Landing Pages');
            setIsOpen(false);
            onSearchChange('');
          },
        });
      }
    });

    // Search analytics/top performers
    analyticsData.forEach(item => {
      if (item.name.toLowerCase().includes(query)) {
        allResults.push({
          id: `analytics-${item.id}`,
          name: item.name,
          category: 'Analytics',
          metadata: `${item.type} • ${item.conversions} conversions • ${item.rate} rate`,
          action: () => {
            onNavigate('Analytics');
            setIsOpen(false);
            onSearchChange('');
          },
        });
      }
    });

    // Search navigation
    navigationItems.forEach(item => {
      if (item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) {
        allResults.push({
          id: `nav-${item.id}`,
          name: item.name,
          category: 'Navigation',
          metadata: item.description,
          action: () => {
            onNavigate(item.name);
            setIsOpen(false);
            onSearchChange('');
          },
        });
      }
    });

    setResults(allResults);
    setIsOpen(allResults.length > 0);
  }, [searchQuery, onNavigate, onSearchChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Forms':
        return <FileText className="w-4 h-4" />;
      case 'Landing Pages':
        return <Globe className="w-4 h-4" />;
      case 'Analytics':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 relative" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        type="text"
        placeholder="Search forms, pages, analytics..."
        className="pl-10 pr-10"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true);
          }
        }}
      />
      {searchQuery && (
        <button
          onClick={() => {
            onSearchChange('');
            setIsOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <ScrollArea className="max-h-[500px]">
            <div className="p-2">
              {/* Header */}
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>

              {/* Grouped Results */}
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category} className="mb-2 last:mb-0">
                  <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {categoryResults.length}
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    {categoryResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={result.action}
                        className="w-full px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-left group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm mb-0.5 truncate">
                              {result.name}
                            </div>
                            {result.metadata && (
                              <div className="text-xs text-muted-foreground truncate">
                                {result.metadata}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
