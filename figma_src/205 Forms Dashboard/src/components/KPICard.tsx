import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  colorClass?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function KPICard({ title, value, change, icon: Icon, colorClass = 'bg-primary', onClick, isActive }: KPICardProps) {
  const isPositive = change && change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card 
      className={`p-6 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : 'hover:shadow-lg'} ${isActive ? 'ring-2 ring-primary shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="mb-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <TrendIcon
                className={`w-4 h-4 ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              />
              <span
                className={`text-sm ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-8 h-8 text-[#ffffff]" />
        </div>
      </div>
    </Card>
  );
}
