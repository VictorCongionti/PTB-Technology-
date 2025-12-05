import React, { useState, useEffect, useRef } from 'react';
import { SYMBOL_CONFIG, SymbolKey, Timeframe, CandleData, OrderBookLevel } from './types';
import { fetchHistoricalData } from './services/marketService';
import { getMarketInsight } from './services/geminiService';
import MarketChart from './components/MarketChart';
import Calculator from './components/Calculator';
import SuggestionBox from './components/SuggestionBox';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [activeSymbol, setActiveSymbol] = useState<SymbolKey>('bitcoin');
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1m');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [insight, setInsight] = useState<string>("Analyzing market data...");
  const [orderBook, setOrderBook] = useState<OrderBookLevel[]>([]);
  
  // Modal States
  const [activeModal, setActiveModal] = useState<'vl' | 'vl7' | null>(null);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  // Initial Load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSymbol, activeTimeframe]);

  // WebSocket Connection
  useEffect(() => {
    const config = SYMBOL_CONFIG[activeSymbol];
    if (!config.binance) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    // Connect to Binance Ticker Stream
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${config.binance}@ticker`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // c = close/current price, P = price change percent
      if (data.c && data.P) {
        const price = parseFloat(data.c);
        const change = parseFloat(data.P);
        setCurrentPrice(price);
        setPriceChange(change);
        
        // Simple mock order book update based on price for visual depth
        generateMockOrderBook(price);
      }
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeSymbol]);

  // Generate Insight when price stabilizes or symbol changes
  useEffect(() => {
    if (currentPrice > 0) {
      const timer = setTimeout(async () => {
        const text = await getMarketInsight(activeSymbol, currentPrice, priceChange);
        setInsight(text);
      }, 1000); // Debounce AI call
      return () => clearTimeout(timer);
    }
  }, [activeSymbol, currentPrice, priceChange]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchHistoricalData(activeSymbol, activeTimeframe);
    setCandles(data);
    
    if (data.length > 0) {
      const last = data[data.length - 1];
      if (!currentPrice) {
        setCurrentPrice(last.close);
        // Simple change calc for initial load if WS hasn't hit yet
        const first = data[0].close;
        setPriceChange(((last.close - first) / first) * 100);
      }
    }
    setLoading(false);
  };

  const generateMockOrderBook = (basePrice: number) => {
    // Generating visual depth since public WS depth stream is heavy
    const spread = basePrice * 0.001;
    const levels: OrderBookLevel[] = [];
    
    for (let i = 1; i <= 4; i++) {
        levels.push({ side: 'ask', price: basePrice + (spread * i), qty: Math.random() * 2, total: 0 });
        levels.push({ side: 'bid', price: basePrice - (spread * i), qty: Math.random() * 2, total: 0 });
    }
    setOrderBook(levels.sort((a, b) => b.price - a.price));
  };

  const config = SYMBOL_CONFIG[activeSymbol];
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-4 w-full">
        
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center font-extrabold text-lg">AF</div>
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2">AssetFlow</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Notifications">
              <i className="fas fa-bell"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent1 rounded-full animate-pulse-fast"></span>
            </button>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center text-sm font-bold">JD</div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">John Doe</div>
                <div className="text-xs text-gray-400">Premium User</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Left Panel: Market */}
          <div className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2">Live Market</h2>
              <button onClick={loadData} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar">
              {(Object.keys(SYMBOL_CONFIG) as SymbolKey[]).map((sym) => (
                <button
                  key={sym}
                  onClick={() => setActiveSymbol(sym)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    activeSymbol === sym 
                    ? 'bg-gradient-to-r from-accent1 to-accent2 text-white shadow-lg shadow-accent1/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {SYMBOL_CONFIG[sym].label}
                </button>
              ))}
            </div>

            {/* Price Box */}
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7070ff]/20 flex items-center justify-center text-accent2 font-bold text-sm">
                  {config.icon}
                </div>
                <div>
                  <div className="font-bold text-lg">{config.label}</div>
                  <div className="text-xs text-gray-400">Binance Real-Time</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-extrabold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Timeframe */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {(['1m', '5m', '15m', '1h', '4h'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTimeframe === tf 
                    ? 'bg-[#7070ff]/20 text-accent2 border border-[#7070ff]/30' 
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full rounded-xl overflow-hidden mb-4 border border-white/5 bg-[#0f0f1e]/50">
               <MarketChart data={candles} loading={loading} color={isPositive ? '#0cb981' : '#ef4444'} />
            </div>

            {/* Order Book Visualization (Heatmap style) */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-bold text-gray-400 mb-2">Live Order Flow</h4>
                <div className="grid grid-cols-2 gap-2">
                    {orderBook.slice(0, 6).map((level, i) => (
                        <div key={i} className={`flex justify-between text-xs p-1 rounded ${level.side === 'bid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                            <span>{level.price.toFixed(2)}</span>
                            <span className="opacity-70">{level.qty.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Right Panel: Calculator & Insight */}
          <div className="flex flex-col gap-6">
            <Calculator />
          </div>
        </div>

        {/* Suggestion Box */}
        <SuggestionBox 
            asset={config.label} 
            insight={insight} 
            trend={priceChange > 1 ? 'bullish' : priceChange < -1 ? 'bearish' : 'neutral'} 
        />

        {/* PTB Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            {/* VL Plan */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-t-4 border-t-accent1">
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-accent1/30">
                        <i className="fas fa-robot text-white"></i>
                    </div>
                    <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2 mb-2">PTB VL</h3>
                    <div className="text-lg font-bold text-gray-300 mb-4">Activation: $300</div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                        Premium Entry-Level Autonomous Trading Protocol with AI-powered trading ecosystem and automated execution.
                    </p>
                    <div className="w-full space-y-3 mb-6">
                        {['AI-powered ecosystem', 'Automated Execution', 'Capital Protection'].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                <i className="fas fa-check-circle text-success"></i>
                                {feat}
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setActiveModal('vl')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-accent1 to-accent2 font-bold text-white shadow-lg shadow-accent1/25 hover:shadow-accent1/40 hover:scale-[1.02] transition-all"
                    >
                        Learn More & Activate
                    </button>
                </div>
            </div>

            {/* VL7 Plan */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 border-t-4 border-t-accent2">
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent2 to-accent1 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-accent2/30">
                        <i className="fas fa-rocket text-white"></i>
                    </div>
                    <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2 mb-2">PTB VL7</h3>
                    <div className="text-lg font-bold text-gray-300 mb-4">Activation: $1500</div>
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                         Advanced High-Tier AI Trading Intelligence Protocol with enterprise-level features and multi-layer strategy.
                    </p>
                    <div className="w-full space-y-3 mb-6">
                        {['Enterprise PTB Model', 'Multi-layer Strategy', 'Advanced Pathways'].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                <i className="fas fa-check-circle text-success"></i>
                                {feat}
                            </div>
                        ))}
                    </div>
                    <button 
                         onClick={() => setActiveModal('vl7')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-accent1 to-accent2 font-bold text-white shadow-lg shadow-accent1/25 hover:shadow-accent1/40 hover:scale-[1.02] transition-all"
                    >
                        Learn More & Activate
                    </button>
                </div>
            </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/10 text-gray-500 text-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
                <i className="fas fa-shield-alt text-accent2"></i>
                <span>256-bit SSL Encryption • ISO 27001 Certified</span>
            </div>
            &copy; 2023 AssetFlow PTB Dashboard. All rights reserved.
        </footer>

        {/* Floating Button */}
        <div className="fixed bottom-28 right-5 z-40">
            <button 
                onClick={() => document.querySelector('.ptb-section')?.scrollIntoView({behavior: 'smooth'})}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 rounded-full text-white font-bold shadow-2xl shadow-accent1/50 hover:scale-105 hover:-translate-y-1 transition-all"
            >
                <i className="fas fa-bolt"></i>
                Activate PTB
            </button>
        </div>

        {/* Modals */}
        <Modal 
            isOpen={activeModal === 'vl'} 
            onClose={() => setActiveModal(null)}
            title="PTB VL - Premium Entry"
        >
            <div className="space-y-6 text-gray-300">
                <p>PTB VL is the foundational Personal Trade Bot tier designed for investors who want to enter the AI-powered trading ecosystem with a strong, cost-efficient starting point.</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-xs text-gray-400">Monthly Return</div>
                        <div className="text-xl font-bold text-success">15-25%</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-xs text-gray-400">Success Rate</div>
                        <div className="text-xl font-bold text-white">92%</div>
                    </div>
                </div>

                <ul className="space-y-2">
                    {['Real-time market synchronization', 'Algorithmic risk control', 'Seamless reinvestment routing'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <i className="fas fa-check text-success text-sm"></i>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <button className="w-full py-3 mt-4 rounded-xl bg-accent1 font-bold text-white hover:bg-accent1/90 transition-colors">
                    Confirm Activation ($300)
                </button>
            </div>
        </Modal>

        <Modal 
            isOpen={activeModal === 'vl7'} 
            onClose={() => setActiveModal(null)}
            title="PTB VL7 - Enterprise AI"
        >
            <div className="space-y-6 text-gray-300">
                <p>PTB VL7 is a premium-grade, enterprise-level PTB model engineered for investors who demand enhanced performance, deeper market penetration, and superior cycle optimization.</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-xs text-gray-400">Monthly Return</div>
                        <div className="text-xl font-bold text-success">25-40%</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center">
                        <div className="text-xs text-gray-400">Success Rate</div>
                        <div className="text-xl font-bold text-white">96%</div>
                    </div>
                </div>

                <ul className="space-y-2">
                    {['Elevated profit windows', 'Extended strategy bandwidth', 'Higher-frequency responsiveness'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <i className="fas fa-check text-success text-sm"></i>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <button className="w-full py-3 mt-4 rounded-xl bg-accent1 font-bold text-white hover:bg-accent1/90 transition-colors">
                    Confirm Activation ($1500)
                </button>
            </div>
        </Modal>

      </div>
    </div>
  );
};

export default App;
