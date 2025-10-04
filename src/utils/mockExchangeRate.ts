/**
 * utils/exchangeRates.ts
 *
 * Mock exchange rate data for crypto → NGN conversions.
 * In a real-world app, this would come from a live provider (e.g., Binance, CoinGecko).
 * For now, we simulate it with static values and an async "fetch" for realism.
 */

import { AppError } from "../middlewares/error.middleware";

// A simple lookup object for mock exchange rates (Crypto → NGN)
const exchangeRates: Record<string, number> = {
  BTC: 15000000, // 1 BTC = 15M NGN
  ETH: 900000, // 1 ETH = 900K NGN
  USDT: 1500, // 1 USDT = 1.5K NGN
};

/**
 * Simulate fetching an exchange rate from an external API.
 * Added a small artificial delay to mimic network latency.
 *
 * @param cryptoType - The crypto symbol (BTC, ETH, USDT).
 * @returns Promise<number> - The exchange rate for that crypto in NGN.
 */
export const getExchangeRate = async (cryptoType: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rate = exchangeRates[cryptoType.toUpperCase()];
      if (!rate) {
        // Reject if the crypto type is unsupported
        return reject(
          new AppError(`Exchange rate for "${cryptoType}" not found.`, 404)
        );
      }
      resolve(rate);
    }, 200); // simulate ~200ms network delay
  });
};
