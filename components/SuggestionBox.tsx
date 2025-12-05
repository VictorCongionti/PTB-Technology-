import React from 'react';

interface SuggestionBoxProps {
  asset: string;
  insight: string;
  trend: 'bullish' | 'bearish' | 'neutral';
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ asset, insight, trend }) => {
  return (
    <div className="col-span-1 lg:col-span-2 bg-[#7070ff]/10 border border-[#7070ff]/30 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <i className="fas fa-lightbulb text-accent2 text-lg"></i>
        <h3 className="text-lg font-bold text-white">Gemini Smart Insight</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all">
          <div className="text-xs text-gray-400 mb-1 font-medium">Focus Asset</div>
          <div className="text-base font-bold text-white">{asset}</div>
        </div>
        
        <div className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all">
          <div className="text-xs text-gray-400 mb-1 font-medium">Market Trend</div>
          <div className={`text-base font-bold ${trend === 'bullish' ? 'text-success' : trend === 'bearish' ? 'text-danger' : 'text-warning'}`}>
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all">
          <div className="text-xs text-gray-400 mb-1 font-medium">AI Analysis</div>
          <div className="text-sm font-medium leading-relaxed text-gray-200">
            {insight}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox;
