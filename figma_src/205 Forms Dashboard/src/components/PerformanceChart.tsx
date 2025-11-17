import { Card } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

const data = [
  { name: 'Mon', submissions: 45 },
  { name: 'Tue', submissions: 52 },
  { name: 'Wed', submissions: 48 },
  { name: 'Thu', submissions: 68 },
  { name: 'Fri', submissions: 75 },
  { name: 'Sat', submissions: 35 },
  { name: 'Sun', submissions: 40 },
];

export function PerformanceChart() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="mb-1">Form Submissions This Week</h3>
        <p className="text-sm text-muted-foreground">
          Daily breakdown of form responses
        </p>
      </div>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2278c0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2278c0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: isDark ? '#ffffff' : '#18181b' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: isDark ? '#ffffff' : '#18181b' }} style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Area
            type="monotone"
            dataKey="submissions"
            stroke="#2278c0"
            strokeWidth={3}
            fill="url(#colorSubmissions)"
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </Card>
  );
}
