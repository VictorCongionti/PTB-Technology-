import React, { useState, useEffect } from 'react';
import { PlanDetails } from '../types';

const PLANS: PlanDetails[] = [
  { id: 'profit-guard', name: 'Profit-Guard', rate: 0.03, min: 200, max: 2999, days: 3, desc: 'Entry level quick turn' },
  { id: 'wealth-guard', name: 'Wealth-Guard', rate: 0.05, min: 3000, max: 20000, days: 5, desc: 'Balanced growth' },
  { id: 'binance-max', name: 'Binance Max', rate: 0.07, min: 20000, max: 999999, days: 130, desc: 'Long term scaling' },
];

const Calculator: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('profit-guard');
  const [amount, setAmount] = useState<number>(5000);
  const [results, setResults] = useState({ daily: 0, total: 0, return: 0 });

  useEffect(() => {
    const plan = PLANS.find(p => p.id === selectedPlanId) || PLANS[0];
    const safeAmount = Math.max(0, amount);
    
    const dailyProfit = safeAmount * plan.rate;
    const totalProfit = dailyProfit * plan.days;
    const totalReturn = safeAmount + totalProfit;

    setResults({
      daily: dailyProfit,
      total: totalProfit,
      return: totalReturn
    });
  }, [selectedPlanId, amount]);

  const handleDownload = () => {
    const plan = PLANS.find(p => p.id === selectedPlanId);
    const content = `AssetFlow PTB Calculation\n\nInvestment: $${amount}\nPlan: ${plan?.name}\nDaily Profit: $${results.daily.toFixed(2)}\nTotal Return: $${results.return.toFixed(2)}\n\nDate: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assetflow-calc-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2">
          PTB Profit Calculator
        </h2>
        <button 
          onClick={handleDownload}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:rotate-12 transition-all"
          title="Download Results"
        >
          <i className="fas fa-download text-text-secondary"></i>
        </button>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            className={`
              relative p-3 rounded-xl border cursor-pointer transition-all overflow-hidden
              ${selectedPlanId === plan.id 
                ? 'bg-accent1/10 border-accent1 before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-accent1 before:to-accent2' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1'}
            `}
          >
            <div className="font-bold text-sm mb-1">{plan.name}</div>
            <div className="text-lg font-extrabold text-accent1 mb-1">{(plan.rate * 100).toFixed(0)}% <span className="text-xs font-normal text-gray-400">Daily</span></div>
            <div className="text-xs text-gray-400">{plan.days} Days</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-400 mb-2">Investment Amount ($)</label>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white focus:outline-none focus:border-accent1 focus:ring-2 focus:ring-accent1/20 transition-all font-sans text-lg"
          placeholder="5000"
          min="200"
        />
      </div>

      {/* Results */}
      <div className="mt-auto bg-accent1/5 border border-accent1/20 rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-sm text-gray-400">Daily Profit</span>
          <span className="font-semibold">${results.daily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-sm text-gray-400">Total Profit</span>
          <span className="font-semibold">${results.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-sm text-gray-400">Total Return</span>
          <span className="text-lg font-bold text-accent1">${results.return.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
