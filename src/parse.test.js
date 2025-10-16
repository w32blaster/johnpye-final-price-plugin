// Unit tests for extractCurrency function
// This file tests the currency extraction functionality from content.js

import { extractCurrency } from './parse.js';

// Simple test runner
describe('Check that the price is parsed accordingly', () => {
    const tests = [
        // Basic currency extraction
        { input: '£10.50', expected: 10.50, description: 'Basic currency with decimals' },
        { input: '£100', expected: 100, description: 'Basic currency without decimals' },
        { input: '£1,234.56', expected: 1234.56, description: 'Currency with comma separator' },
        { input: '£1,000', expected: 1000, description: 'Currency with comma, no decimals' },
        { input: '1,234.56', expected: 1234.56, description: 'Currency without currency symbol is also accepted and parsed' },
        
        // Edge cases
        { input: null, expected: null, description: 'Null input' },
        { input: '', expected: null, description: 'Empty string' },
        { input: undefined, expected: null, description: 'Undefined input' },
        { input: 'No currency here', expected: null, description: 'Text without currency' },
        { input: '$10.50', expected: null, description: 'Wrong currency symbol' },
                
        // Currency in different contexts
        { input: '  £75.50  ', expected: 75.50, description: 'Currency with whitespace' },
        
        // Invalid currency formats
        { input: '£', expected: null, description: 'Currency symbol only' },
        { input: '£abc', expected: null, description: 'Currency symbol with letters' },
        { input: '£10.5', expected: null, description: 'Currency with one decimal place (regex only matches 2 decimals)' },
        { input: '£10.555', expected: null, description: 'Currency with three decimal places (regex only matches 2)' },
        
        // Large numbers
        { input: '£999,999.99', expected: 999999.99, description: 'Large currency amount' },
        { input: '£1,234,567.89', expected: 1234567.89, description: 'Very large currency amount' },
        { input: '1,234,567.89', expected: 1234567.89, description: 'Very large currency amount without currency symbol' }
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
