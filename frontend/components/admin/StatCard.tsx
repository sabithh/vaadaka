import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'blue'
}: StatCardProps) {
  const colorMap = {
    blue: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    purple: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    green: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    red: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  };

  const selectedColor = colorMap[color];

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl hover:border-neutral-700 transition-all flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${selectedColor.bg} border ${selectedColor.border}`}>
          <Icon className={selectedColor.text} size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded bg-neutral-800 ${trendUp ? 'text-green-400' : 'text-gray-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
