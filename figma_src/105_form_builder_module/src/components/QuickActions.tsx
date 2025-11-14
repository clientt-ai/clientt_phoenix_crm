import { useState } from 'react';
import { Plus, Globe, FileText, Download, Upload, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const actions = [
  {
    icon: FileText,
    label: 'Create New Form',
    colorClass: 'bg-primary',
  },
  {
    icon: Upload,
    label: 'Import Responses',
    colorClass: 'bg-green-500',
  },
  {
    icon: Zap,
    label: 'View Analytics',
    colorClass: 'bg-purple-500',
  },
];

export function QuickActions() {
  const [showSecondaryActions, setShowSecondaryActions] = useState(false);

  const handlePrimaryActionClick = () => {
    setShowSecondaryActions(true);
  };

  return (
    <Card className="p-5">
      <h3 className="mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              onClick={handlePrimaryActionClick}
              className="h-auto flex-col gap-2 p-3 hover:border-primary group"
            >
              <div
                className={`w-9 h-9 rounded-lg ${action.colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs">
                {action.label}
              </span>
            </Button>
          );
        })}
        {showSecondaryActions && secondaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col gap-2 p-3 hover:border-primary group"
            >
              <div
                className={`w-9 h-9 rounded-lg ${action.colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}