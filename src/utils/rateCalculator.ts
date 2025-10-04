/**
 * Util to to calc  and apply exchange rate
 *
 * Business logic for converting crypto amounts into NGN.
 * Depends on exchangeRates.ts to fetch rates (mock API).
 */

import { getExchangeRate } from "./mockExchangeRate";

/**
 * Calculate the NGN equivalent of a given crypto amount.
 *
 * @param amount - The crypto amount (e.g., 0.5 BTC).
 * @param cryptoType - The crypto symbol (BTC, ETH, USDT).
 * @returns Promise<number> - The converted NGN amount.
 *
 * @throws Error if the exchange rate cannot be retrieved.
 */
export const calculateRate = async (
  amount: number,
  cryptoType: string
): Promise<number> => {
  try {
    // Fetch exchange rate (async, simulating external API call)
    const rate = await getExchangeRate(cryptoType);

    // Perform conversion (crypto * NGN rate)
    const convertedAmount = amount * rate;

    return convertedAmount;
  } catch (error) {
    // Wrap and rethrow error for consistent error messages
    throw new Error(`Failed to calculate rate: ${(error as Error).message}`);
  }
};
