import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@worldmonitor/shared';
import { capitalize } from '@/utils/formatters';
import type { EventStats } from '@worldmonitor/shared';

interface CategoryBreakdownProps {
  stats: EventStats;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ stats }) => {
  const data = Object.entries(stats.byCategory)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({
      name: capitalize(name),
      value,
      color: CATEGORY_COLORS[name] || '#6b7280',
      icon: CATEGORY_ICONS[name] || '📌',
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Event Categories</h3>
      <div className="flex gap-4">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2236',
                  border: '1px solid #1f2937',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-32">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300">
                  {item.icon} {item.name}
                </span>
              </div>
              <span className="font-mono text-gray-400">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
