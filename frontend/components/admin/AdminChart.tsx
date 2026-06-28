'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface AdminChartProps {
  data: ChartData[];
  type?: 'line' | 'area';
  title?: string;
  dataKey?: string;
  color?: string;
}

export default function AdminChart({ 
    data, 
    type = 'area', 
    title = 'Analytics',
    dataKey = 'value',
    color = '#3b82f6' // tailwind blue-500
}: AdminChartProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
      <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis 
                  dataKey="name" 
                  stroke="#737373" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
              />
              <YAxis 
                  stroke="#737373" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
              />
              <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#color-${dataKey})`} 
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis 
                  dataKey="name" 
                  stroke="#737373" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
              />
              <YAxis 
                  stroke="#737373" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
              />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
              />
              <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color} 
                  strokeWidth={2} 
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
