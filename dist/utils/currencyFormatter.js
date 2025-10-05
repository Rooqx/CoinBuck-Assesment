"use strict";
/**
 * utils/currencyFormatter.ts
 *
 * Utility function to format numbers into Nigerian Naira (NGN) currency strings.
 * Uses Intl.NumberFormat for proper localization and formatting.
 *
 * Example:
 *   formatCurrency(1500)  -> "₦1,500.00"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = void 0;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2, // always show .00
        maximumFractionDigits: 2,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
