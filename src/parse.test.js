// Unit tests for extractCurrency function
// This file tests the currency extraction functionality from content.js

import { extractCurrency } from './parse.js';

// Simple test runner
describe('Check that the price is parsed accordingly', () => {
    const tests = [
        // Basic currency extraction
        { input: '£10.50', expected: 10.50, description: 'Basic currency with decimals' },
        { input: '£1,234.56', expected: 1234.56, description: 'Currency with comma separator' },
        { input: '1,234.56', expected: 1234.56, description: 'Currency without currency symbol is also accepted and parsed' },
        
        // Edge cases
        { input: null, expected: null, description: 'Null input' },
        { input: '', expected: null, description: 'Empty string' },
        { input: undefined, expected: null, description: 'Undefined input' },
        { input: 'No currency here', expected: null, description: 'Text without currency' },
                
        // Currency in different contexts
        { input: '  £75.50  ', expected: 75.50, description: 'Currency with whitespace' },
        
        // Invalid currency formats
        { input: '£', expected: null, description: 'Currency symbol only' },
        { input: '£abc', expected: null, description: 'Currency symbol with letters' },
        
        // Large numbers
        { input: '£999,999.99', expected: 999999.99, description: 'Large currency amount' },
        { input: '£1,234,567.89', expected: 1234567.89, description: 'Very large currency amount' },
        { input: '1,234,567.89', expected: 1234567.89, description: 'Very large currency amount without currency symbol' },
    
        // Delivery price
        { input: '£50.00 (£1.99 per additional lot)', expected: 50.00, description: 'Value with some additional comment' }
    ];
    
    tests.forEach((test, index) => {

        it(index + ' ' + test.description, () => {

            // When:
            const result = extractCurrency(test.input);
            
            // Then:
            expect(result).toBe(test.expected);
        });

    });

});
