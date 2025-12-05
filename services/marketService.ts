import { CandleData, SYMBOL_CONFIG, SymbolKey, Timeframe } from '../types';

// CoinGecko API (Demo Key can be passed in headers if available, otherwise using public)
const CG_BASE_URL = 'https://api.coingecko.com/api/v3';

export const fetchHistoricalData = async (symbol: SymbolKey, timeframe: Timeframe): Promise<CandleData[]> => {
  const cfg = SYMBOL_CONFIG[symbol];
  
  // Mapping timeframe to days for CoinGecko
  let days = '1';
  if (timeframe === '1h') days = '7';
  if (timeframe === '4h') days = '30';

  try {
    const response = await fetch(`${CG_BASE_URL}/coins/${cfg.cg}/ohlc?vs_currency=usd&days=${days}`);
    
    if (!response.ok) {
       // Graceful fallback for rate limits
       console.warn('Rate limit hit or API error, generating fallback data');
       return generateFallbackData(days);
    }

    const data = await response.json();
    
    // CoinGecko OHLC format: [time, open, high, low, close]
    // Note: CG Public API doesn't return volume in OHLC, generating synthetic volume for visual
    return data.map((d: number[]) => ({
      time: d[0],
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
      volume: Math.random() * 1000 // Synthetic volume
    }));
  } catch (error) {
    console.error("Error fetching historical data", error);
    return generateFallbackData(days);
  }
};

const generateFallbackData = (daysStr: string): CandleData[] => {
  const now = Date.now();
  const days = parseInt(daysStr);
  const data: CandleData[] = [];
  let price = 50000;
  
  for (let i = 0; i < 100; i++) {
    const time = now - (days * 24 * 60 * 60 * 1000) + (i * (days * 24 * 60 * 60 * 10));
    const volatility = price * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    data.push({
      time,
      open: price,
      high: price + Math.abs(change),
      low: price - Math.abs(change),
      close: price + change,
      volume: Math.random() * 500 + 100
    });
    price += change;
  }
  return data;
};
