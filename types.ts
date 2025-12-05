export type SymbolKey = 'bitcoin' | 'ethereum' | 'tether' | 'binancecoin' | 'solana';

export interface CryptoConfig {
  cg: string;
  binance: string | null;
  label: string;
  icon: string;
}

export const SYMBOL_CONFIG: Record<SymbolKey, CryptoConfig> = {
  bitcoin: { cg: "bitcoin", binance: "btcusdt", label: "BTC/USD", icon: "BTC" },
  ethereum: { cg: "ethereum", binance: "ethusdt", label: "ETH/USD", icon: "ETH" },
  tether: { cg: "tether", binance: null, label: "USDT/USD", icon: "USDT" },
  binancecoin: { cg: "binancecoin", binance: "bnbusdt", label: "BNB/USD", icon: "BNB" },
  solana: { cg: "solana", binance: "solusdt", label: "SOL/USD", icon: "SOL" }
};

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h';

export interface PlanDetails {
  id: string;
  name: string;
  rate: number;
  min: number;
  max: number;
  days: number;
  desc: string;
}

export interface MarketTicker {
  symbol: string;
  price: number;
  change24h: number;
}

export interface OrderBookLevel {
  price: number;
  qty: number;
  total: number;
  side: 'bid' | 'ask';
}