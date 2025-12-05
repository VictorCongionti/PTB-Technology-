import { GoogleGenAI } from "@google/genai";
import { SymbolKey } from "../types";

// Note: In a real production app, this call should go through a backend to protect the API key.
// For this frontend-only demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const getMarketInsight = async (symbol: SymbolKey, price: number, change24h: number): Promise<string> => {
  if (!ai) {
    return generateOfflineInsight(symbol, change24h);
  }

  try {
    const prompt = `
      Analyze the current market for ${symbol}. 
      Current Price: $${price}. 
      24h Change: ${change24h}%. 
      
      Provide a 2-sentence concise trading insight for a dashboard. 
      Focus on technical sentiment (Bullish/Bearish) and a key support/resistance level.
      Do not include "Here is the insight" or similar preambles.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || generateOfflineInsight(symbol, change24h);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return generateOfflineInsight(symbol, change24h);
  }
};

const generateOfflineInsight = (symbol: SymbolKey, change: number): string => {
  const trend = change >= 0 ? "bullish" : "bearish";
  const action = change >= 0 ? "accumulating" : "consolidating";
  return `${symbol.toUpperCase()} is showing ${trend} momentum with market participants ${action} at current levels. Volatility remains expected in the short term.`;
};
