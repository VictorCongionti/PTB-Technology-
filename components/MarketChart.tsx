import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CandleData } from '../types';

interface MarketChartProps {
  data: CandleData[];
  loading: boolean;
  color: string;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, loading, color }) => {
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent2 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500">
        No Data Available
      </div>
    );
  }

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
  };

  const formatYAxis = (tickItem: number) => {
    return `$${tickItem.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  // Calculate min/max for better axis scaling
  const minPrice = Math.min(...data.map(d => d.low)) * 0.99;
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.01;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Price Chart */}
      <div className="flex-grow h-[70%]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              hide={true} 
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              orientation="right" 
              tick={{fill: '#9ca3af', fontSize: 11}}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={color} 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart (Mini) */}
      <div className="h-[30%] -mt-4 opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey="volume" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketChart;
