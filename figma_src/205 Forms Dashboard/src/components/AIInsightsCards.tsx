import { TrendingUp, Info, Users, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric?: string;
  trend?: number;
  actionable?: boolean;
  onAction?: () => void;
}

function InsightCard({ icon, title, description, metric, trend, actionable, onAction }: InsightCardProps) {
  const isPositive = trend && trend > 0;

  const handleClick = () => {
    if (actionable && onAction) {
      onAction();
    }
  };

  return (
    <Card 
      className={`p-6 hover:shadow-lg transition-shadow ${actionable ? 'cursor-pointer hover:border-primary/50' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm">{title}</p>
            {metric && (
              <div className="flex items-center gap-1">
                <span className="text-sm">{metric}</span>
                {trend !== undefined && (
                  <span
                    className={`text-sm ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {isPositive ? '+' : ''}{trend}%
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {actionable && (
            <p className="text-xs text-primary mt-2">Click to learn more →</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function AIInsightsCards({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const handleTopPerformerClick = () => {
    if (onNavigate) {
      onNavigate('Forms');
    } else {
      toast.info('Product Inquiry Form Analytics', {
        description: 'This form has the highest conversion rate at 84.7%. Key factors: Simple design, clear CTA, optimized for mobile.',
      });
    }
  };

  const handleOptimizationClick = () => {
    if (onNavigate) {
      onNavigate('Forms');
    } else {
      toast.info('Optimization Tip', {
        description: 'Adding a progress indicator can increase form completion by up to 31%. Would you like to add this to your Contact Form?',
      });
    }
  };

  const handleEngagementClick = () => {
    if (onNavigate) {
      onNavigate('Analytics');
    } else {
      toast.success('Engagement Report', {
        description: 'Mobile traffic is trending up! Your responsive design is working well. Consider optimizing load times further for mobile users.',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#2278c0] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3>AI Insights & Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <InsightCard
          icon={
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          }
          title="Top Performing Form"
          description="Product Inquiry Form is your highest converter with 847 submissions this month"
          metric="847"
          trend={4.3}
          actionable={true}
          onAction={handleTopPerformerClick}
        />
        
        <InsightCard
          icon={
            <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
              <Info className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          }
          title="Optimization Suggestion"
          description="Consider adding a progress indicator to your Contact Form - multi-step forms show 31% higher completion rates"
          actionable={true}
          onAction={handleOptimizationClick}
        />
        
        <InsightCard
          icon={
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
          }
          title="Engagement Trend"
          description="Mobile submissions increased by 42% this week. Your forms are mobile-optimized and performing well"
          trend={42}
          actionable={true}
          onAction={handleEngagementClick}
        />
      </div>
    </div>
  );
}