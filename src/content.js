// John Pye Final Price Calculator - Content Script
// This script runs on John Pye auction lot detail pages to calculate and display final prices
import { extractCurrency } from './parse.js';

 // Configuration based on DOM analysis
export const CONFIG = {
    // Selectors based on actual DOM analysis
    selectors: {
        minBid: '.detail__minbid .Bidding_Listing_MinPrice .NumberPart',
        minBidContainer: '.detail__minbid',
        delivery: [
            '.shipping-table td',
            '.table.shipping-table tbody tr td:last-child'
        ],
        container: '.form-group',
        priceContainer: '.detail__minbid'
    },
    
    // Text patterns for extracting prices
    patterns: {
        currency: /£([\d,]+(?:\.\d{2})?)/g,
        minBidText: /minimum\s+bid/i,
        deliveryText: /delivery|shipping|postage|transport/i
    },
    
    // Display configuration
    display: {
        finalPriceClass: 'johnpye-final-price',
        containerClass: 'johnpye-price-container',
        styles: {
            container: {
                margin: '10px 0',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                border: '2px solid #28a745',
                borderRadius: '6px',
                fontFamily: 'Arial, sans-serif'
            },
            label: {
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#28a745',
                marginRight: '8px'
            },
            price: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#dc3545'
            },
            breakdown: {
                fontSize: '14px',
                color: '#6c757d',
                marginTop: '4px'
            }
        }
    }
};


(function() {
    'use strict';


    // Utility functions
    const utils = {

        /**
         * Format currency for display
         * @param {number} amount - Amount to format
         * @returns {string} - Formatted currency string
         */
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP'
            }).format(amount);
        },

        /**
         * Find element using multiple selectors
         * @param {string[]} selectors - Array of selectors to try
         * @returns {Element|null} - Found element or null
         */
        findElement: function(selectors) {
            if (typeof selectors === 'string') {
                return document.querySelector(selectors);
            }
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) return element;
            }
            
            return null;
        },

        /**
         * Apply styles to an element
         * @param {Element} element - Element to style
         * @param {Object} styles - Style object
         */
        applyStyles: function(element, styles) {
            Object.assign(element.style, styles);
        },

        /**
         * Log debug information
         * @param {string} message - Debug message
         * @param {*} data - Additional data to log
         */
        debug: function(message, data) {
            console.log(`[John Pye Extension] ${message}`, data || '');
        }
    };

    // Main functionality
    const finalPriceCalculator = {
        /**
         * Find and extract minimum bid amount
         * @returns {number|null} - Minimum bid amount or null
         */
        findMinimumBid: function() {
            // First try the specific NumberPart selector
            let element = utils.findElement(CONFIG.selectors.minBid);
            
            if (element) {
                const text = element.textContent.trim();
                const amount = parseFloat(text);
                
                if (!isNaN(amount)) {
                    utils.debug('Found minimum bid (NumberPart):', { text, amount, element });
                    return amount;
                }
            }
            
            // Fallback: look in the container for any currency
            element = utils.findElement(CONFIG.selectors.minBidContainer);
            if (element) {
                const text = element.textContent.trim();
                const amount = extractCurrency(text, CONFIG.patterns.currency);
                
                if (amount !== null) {
                    utils.debug('Found minimum bid (container fallback):', { text, amount, element });
                    return amount;
                }
            }
            
            utils.debug('Minimum bid element not found');
            return null;
        },

        /**
         * Find and extract delivery cost
         * @returns {number|null} - Delivery cost or null
         */
        findDeliveryCost: function() {
            // Look for shipping table specifically
            const shippingTable = document.querySelector('.shipping-table');
            
            if (shippingTable) {
                // Find all rows in the shipping table
                const rows = shippingTable.querySelectorAll('tbody tr');
                let minDelivery = null;
                
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2) {
                        const descriptionCell = cells[0];
                        const priceCell = cells[1];
                        
                        const description = descriptionCell.textContent.trim().toLowerCase();
                        const priceText = priceCell.textContent.trim();
                        const amount = extractCurrency(priceText, CONFIG.patterns.currency);
                        
                        // Skip collection options (they contain "collection" in the description)
                        if (description.includes('collection')) {
                            utils.debug('Skipping collection option:', { description, amount });
                            continue;
                        }
                        
                        if (amount !== null) {
                            // Take the cheapest actual delivery option (not collection)
                            if (minDelivery === null || amount < minDelivery) {
                                minDelivery = amount;
                                utils.debug('Found delivery option:', { description, amount, priceText });
                            }
                        }
                    }
                }
                
                if (minDelivery !== null) {
                    utils.debug('Selected cheapest delivery:', minDelivery);
                    return minDelivery;
                }
            }
            
            // Fallback: search for any element containing delivery keywords and currency
            const allElements = document.querySelectorAll('*');
            
            for (const element of allElements) {
                const text = element.textContent.toLowerCase();
                
                if (CONFIG.patterns.deliveryText.test(text) && 
                    CONFIG.patterns.currency.test(element.textContent) &&
                    element.children.length === 0) { // Only leaf elements
                    
                    const amount = extractCurrency(element.textContent, CONFIG.patterns.currency);
                    
                    if (amount !== null) {
                        utils.debug('Found delivery cost (fallback):', { text, amount, element });
                        return amount;
                    }
                }
            }
            
            utils.debug('Delivery cost not found');
            return null;
        },

        /**
         * Find the best location to inject the final price display
         * @returns {Element|null} - Container element or null
         */
        findInjectionPoint: function() {
            // Find the minimum bid container
            const minBidContainer = utils.findElement(CONFIG.selectors.minBidContainer);
            
            if (minBidContainer) {
                // Use the parent form-group container
                const formGroup = minBidContainer.closest('.form-group');
                if (formGroup) {
                    utils.debug('Found injection point (form-group):', formGroup);
                    return formGroup;
                }
                
                // Fallback: use the parent element of the minimum bid container
                utils.debug('Using minimum bid container parent as injection point:', minBidContainer.parentElement);
                return minBidContainer.parentElement;
            }
            
            utils.debug('No suitable injection point found');
            return null;
        },

        /**
         * Create and style the final price display element
         * @param {number} finalPrice - The calculated final price
         * @param {number} minBid - The minimum bid amount
         * @param {number|null} delivery - The delivery cost (null if not found)
         * @param {Object} breakdown - Calculation breakdown
         * @returns {Element} - The created display element
         */
        createPriceDisplay: function(finalPrice, minBid, delivery, breakdown) {
            // Main container
            const container = document.createElement('div');
            container.className = CONFIG.display.containerClass;
            utils.applyStyles(container, CONFIG.display.styles.container);
            
            // Final price display
            const priceRow = document.createElement('div');
            
            const label = document.createElement('span');
            label.textContent = 'Final Price:';
            utils.applyStyles(label, CONFIG.display.styles.label);
            
            const price = document.createElement('span');
            price.textContent = utils.formatCurrency(finalPrice);
            price.className = CONFIG.display.finalPriceClass;
            utils.applyStyles(price, CONFIG.display.styles.price);
            
            priceRow.appendChild(label);
            priceRow.appendChild(price);
            container.appendChild(priceRow);
            
            // Breakdown display
            const breakdownDiv = document.createElement('div');
            utils.applyStyles(breakdownDiv, CONFIG.display.styles.breakdown);
            
            const deliveryText = delivery !== null ? utils.formatCurrency(delivery) : 'Not found';
            
            // Create breakdown items safely using DOM manipulation
            const breakdownItems = [
                { label: 'Minimum bid:', value: utils.formatCurrency(minBid) },
                { label: 'VAT (20%):', value: utils.formatCurrency(breakdown.vat) },
                { label: 'Buyer\'s premium (25%):', value: utils.formatCurrency(breakdown.buyerPremium) },
                { label: 'VAT on premium (20%):', value: utils.formatCurrency(breakdown.vatBuyerPremium) },
                { label: 'Delivery:', value: deliveryText }
            ];
            
            // Add VAT on delivery only if delivery cost was found
            if (delivery !== null) {
                breakdownItems.push({ 
                    label: 'VAT on delivery (20%):', 
                    value: utils.formatCurrency(breakdown.vatDelivery) 
                });
            }
            
            // Create each breakdown item as a div element
            breakdownItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.textContent = `${item.label} ${item.value}`;
                breakdownDiv.appendChild(itemDiv);
            });
            
            container.appendChild(breakdownDiv);
            
            return container;
        },

        /**
         * Main function to calculate and display final price
         */
        calculateAndDisplay: function() {
            try {
                utils.debug('Starting final price calculation...');
                
                // Remove any existing displays
                const existingDisplays = document.querySelectorAll(`.${CONFIG.display.containerClass}`);
                existingDisplays.forEach(display => display.remove());
                
                // Find minimum bid
                const minBid = this.findMinimumBid();
                if (minBid === null) {
                    utils.debug('Cannot proceed: minimum bid not found');
                    return;
                }
                
                // Find delivery cost
                const delivery = this.findDeliveryCost();
                
                // Calculate final price using the specified formula
                const vat = minBid * 0.2;
                const buyerPremium = minBid * 0.25;
                const vatBuyerPremium = buyerPremium * 0.2;
                const vatDelivery = (delivery || 0) * 0.2;
                const finalPrice = minBid + vat + buyerPremium + vatBuyerPremium + (delivery || 0) + vatDelivery;
                
                utils.debug('Price calculation:', {
                    minBid,
                    delivery,
                    vat: vat.toFixed(2),
                    buyerPremium: buyerPremium.toFixed(2),
                    vatBuyerPremium: vatBuyerPremium.toFixed(2),
                    vatDelivery: vatDelivery.toFixed(2),
                    finalPrice
                });
                
                // Find injection point
                const injectionPoint = this.findInjectionPoint();
                if (!injectionPoint) {
                    utils.debug('Cannot display: no suitable injection point found');
                    return;
                }
                
                // Create and inject display
                const breakdown = { vat, buyerPremium, vatBuyerPremium, vatDelivery };
                const priceDisplay = this.createPriceDisplay(finalPrice, minBid, delivery, breakdown);
                
                // Insert after the minimum bid container within the form group
                const minBidContainer = utils.findElement(CONFIG.selectors.minBidContainer);
                if (minBidContainer && injectionPoint.contains(minBidContainer)) {
                    minBidContainer.insertAdjacentElement('afterend', priceDisplay);
                } else {
                    injectionPoint.appendChild(priceDisplay);
                }
                
                utils.debug('Final price display injected successfully');
                
            } catch (error) {
                utils.debug('Error calculating final price:', error);
            }
        },

        /**
         * Store calculation data globally for popup access
         */
        storeCalculationData: function() {
            const minBid = this.findMinimumBid();
            const delivery = this.findDeliveryCost();
            let finalPrice = null;
            let error = null;

            if (minBid !== null) {
                const vat = minBid * 0.2;
                const buyerPremium = minBid * 0.25;
                const vatBuyerPremium = buyerPremium * 0.2;
                const vatDelivery = (delivery || 0) * 0.2;
                finalPrice = minBid + vat + buyerPremium + vatBuyerPremium + (delivery || 0) + vatDelivery;
            } else {
                error = 'Minimum bid not found';
            }

            window.johnPyePriceData = {
                finalPrice,
                minBid,
                delivery,
                error
            };

            utils.debug('Price data stored:', window.johnPyePriceData);
        },

        /**
         * Initialize the extension
         */
        init: function() {
            utils.debug('John Pye Final Price Calculator initializing...');
            
            // Check if we're on the right page
            if (!window.location.href.includes('johnpyeauctions.co.uk/Event/LotDetails/')) {
                utils.debug('Not on a lot details page, exiting');
                return;
            }
            
            // Wait for page to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.calculateAndDisplay(), 1000);
                });
            } else {
                // Page already loaded
                setTimeout(() => this.calculateAndDisplay(), 1000);
            }
            
            // Store data for popup to access
            this.storeCalculationData();
            
            utils.debug('Extension initialized successfully');
        }
    };

    // Start the extension
    finalPriceCalculator.init();

    // Make the calculator globally available for popup communication
    window.finalPriceCalculator = finalPriceCalculator;

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'getPriceData') {
            // Refresh data and return it
            finalPriceCalculator.storeCalculationData();
            const data = window.johnPyePriceData || {
                finalPrice: null,
                minBid: null,
                delivery: null,
                error: 'No data available'
            };
            
            sendResponse({ success: true, data: data });
        } else if (message.action === 'recalculate') {
            // Trigger recalculation and update display
            finalPriceCalculator.calculateAndDisplay();
            finalPriceCalculator.storeCalculationData();
            sendResponse({ success: true });
        }
        
        return true; // Keep the message channel open
    });

})();
