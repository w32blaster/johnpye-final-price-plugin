// John Pye Final Price Calculator - Content Script
// This script runs on John Pye auction lot detail pages to calculate and display final prices

(function() {
    'use strict';

    // Configuration based on DOM analysis
    const CONFIG = {
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

    // Utility functions
    const utils = {
        /**
         * Extract currency amount from text
         * @param {string} text - Text containing currency
         * @returns {number|null} - Extracted amount or null if not found
         */
        extractCurrency: function(text) {
            if (!text) return null;
            
            const matches = text.match(CONFIG.patterns.currency);
            if (!matches) return null;
            
            // Get the first match and convert to number
            const match = matches[0];
            const numberStr = match.replace('£', '').replace(/,/g, '');
            const amount = parseFloat(numberStr);
            
            return isNaN(amount) ? null : amount;
        },

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
                const amount = utils.extractCurrency(text);
                
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
                // Find all cells that might contain prices
                const cells = shippingTable.querySelectorAll('td');
                let minDelivery = null;
                
                for (const cell of cells) {
                    const text = cell.textContent.trim();
                    const amount = utils.extractCurrency(text);
                    
                    if (amount !== null) {
                        // Take the cheapest delivery option
                        if (minDelivery === null || amount < minDelivery) {
                            minDelivery = amount;
                            utils.debug('Found delivery option:', { text, amount, cell });
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
                    
                    const amount = utils.extractCurrency(element.textContent);
                    
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
            breakdownDiv.innerHTML = `
                <div>Minimum bid: ${utils.formatCurrency(minBid)}</div>
                <div>VAT (20%): ${utils.formatCurrency(breakdown.vat)}</div>
                <div>Buyer's premium (25%): ${utils.formatCurrency(breakdown.buyerPremium)}</div>
                <div>VAT on premium (20%): ${utils.formatCurrency(breakdown.vatBuyerPremium)}</div>
                <div>Delivery: ${deliveryText}</div>
                ${delivery !== null ? `<div>VAT on delivery (20%): ${utils.formatCurrency(breakdown.vatDelivery)}</div>` : ''}
            `;
            
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
                const finalPrice = Math.round(minBid + vat + buyerPremium + vatBuyerPremium + (delivery || 0) + vatDelivery);
                
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
                finalPrice = Math.round(minBid + vat + buyerPremium + vatBuyerPremium + (delivery || 0) + vatDelivery);
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