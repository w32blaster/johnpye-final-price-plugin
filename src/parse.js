/**
 * Extract currency amount from text
 * @param {string} text - Text containing currency
 * @returns {number|null} - Extracted amount or null if not found
 */
export function extractCurrency(text, pattern) {
    if (!text) return null;
    
    const matches = text.match(pattern);
    if (!matches) return null;
    
    // Get the first match and convert to number
    const match = matches[0];
    const numberStr = match.replace('£', '').replace(/,/g, '');
    const amount = parseFloat(numberStr);
    
    return isNaN(amount) ? null : amount;
}