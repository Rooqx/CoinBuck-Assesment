/**
 * Util to generate unique id
 *
 * Generates unique transaction IDs for logging, auditing, and DB storage.
 * Format: TXN-<UUID>
 *
 * Why UUID?
 *  - Practically collision-free, even at very high scale.
 *  - Easy to parse & log.
 *  - Better than random numbers or timestamps alone.
 */

import { randomUUID } from "crypto";

/**
 * Example output:
 *   TXN-3f9a1d1e0c4a4d6aa3c26f07f50c2e7b
 *
 * @returns string - Unique transaction ID.
 */
export const generateTransactionId = (): string => {
  // Use Node's built-in crypto API for UUID v4
  const uuid = randomUUID().replace(/-/g, "");
  //  console.log(uuid);
  return `TXN-${uuid}`;
};
