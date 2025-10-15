// Unit tests for extractCurrency function
// This file tests the currency extraction functionality from content.js

import { extractCurrency } from './parse.js';
import { CONFIG } from './config.js';

// Simple test runner
describe('Check that the price is parsed accordingly', () => {
    const tests = [
        // Basic currency extraction
        { input: '£10.50', expected: 10.50, description: 'Basic currency with decimals' },
        { input: '£100', expected: 100, description: 'Basic currency without decimals' },
        { input: '£1,234.56', expected: 1234.56, description: 'Currency with comma separator' },
        { input: '£1,000', expected: 1000, description: 'Currency with comma, no decimals' },
        
        // Edge cases
        { input: null, expected: null, description: 'Null input' },
        { input: '', expected: null, description: 'Empty string' },
        { input: undefined, expected: null, description: 'Undefined input' },
        { input: 'No currency here', expected: null, description: 'Text without currency' },
        { input: '10.50', expected: null, description: 'Number without currency symbol' },
        { input: '$10.50', expected: null, description: 'Wrong currency symbol' },
        
        // Multiple currencies - should return first one
        { input: '£10.50 and £20.00', expected: 10.50, description: 'Multiple currencies - returns first' },
        { input: 'Price: £45.99, shipping: £5.00', expected: 45.99, description: 'Multiple currencies in sentence' },
        
        // Currency in different contexts
        { input: 'Minimum bid: £25.00', expected: 25.00, description: 'Currency in sentence context' },
        { input: 'Starting at £1,500.00 for this item', expected: 1500.00, description: 'Currency with comma in sentence' },
        { input: '  £75.50  ', expected: 75.50, description: 'Currency with whitespace' },
        
        // Invalid currency formats
        { input: '£', expected: null, description: 'Currency symbol only' },
        { input: '£abc', expected: null, description: 'Currency symbol with letters' },
        { input: '£10.5', expected: 10, description: 'Currency with one decimal place (regex only matches 2 decimals)' },
        { input: '£10.555', expected: 10.55, description: 'Currency with three decimal places (regex only matches 2)' },
        
        // Large numbers
        { input: '£999,999.99', expected: 999999.99, description: 'Large currency amount' },
        { input: '£1,234,567.89', expected: 1234567.89, description: 'Very large currency amount' }
    ];
    
    tests.forEach((test, index) => {

        it(index + ' ' + test.description, () => {

            // When:
            const result = extractCurrency(test.input, CONFIG.patterns.currency);
            
            // Then:
            expect(result).toBe(test.expected);
        });

    });

});
