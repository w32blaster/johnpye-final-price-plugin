import { CONFIG } from './config.js';

/**
 * Extract currency amount from text
 * @param {string} text - Text containing currency
 * @param {RegExp} pattern - Regular expression used to locate the currency).
 * @returns {number|null} - Extracted amount or null if not found
 */
export function extractCurrency(text) {
    if (!text) return null;

    const matches = text.match(CONFIG.patterns.currency);
    if (!matches) return null;
    
    // Get the first match and convert to number
    const match = matches[0];
    // Remove all the symbols, except numbers and dots

    const numberStr = match.replace(/[^0-9.-]/g, '');
    const amount = parseFloat(numberStr);
    
    return isNaN(amount) ? null : amount;
}