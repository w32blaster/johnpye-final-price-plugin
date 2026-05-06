import { extractCurrency } from './parse.js';
import { CONFIG } from './config.js';

// John Pye Final Price Calculator - Content Script
// This script runs on John Pye auction lot detail pages to calculate and display final prices
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
                const text = element.textContent.trim(); // this is number only, without a currency symbol
                const amount = extractCurrency(text);
                
                if (!isNaN(amount)) {
                    utils.debug('Found minimum bid (NumberPart):', { text, amount, element });
                    return amount;
                }
            }
            
            // Fallback: look in the container for any currency
            element = utils.findElement(CONFIG.selectors.minBidContainer);
            if (element) {
                const text = element.textContent.trim(); // with currency symbol
                const amount = extractCurrency(element.textContent.trim());
                
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
                        const amount = extractCurrency(priceText);
                        
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
            
            utils.debug('Delivery cost not found');
            return null;
        },

        /**
         * Detect the lot location from the shipping info panel
         * @returns {string|null} - Location string or null if not found
         */
        detectLocation: function() {
            const shippingInfoPanel = document.querySelector('.panel-body.description.shipping-info-panel');

            if (!shippingInfoPanel) {
                utils.debug('Shipping info panel not found');
                return null;
            }

            // Get the first paragraph's strong element
            const firstParagraph = shippingInfoPanel.querySelector('p strong');

            if (!firstParagraph) {
                utils.debug('Location information not found in shipping panel');
                return null;
            }

            const locationText = firstParagraph.textContent.trim();
            utils.debug('Found location text:', locationText);

            // Extract the location (first part before the dash)
            const locationMatch = locationText.match(/^([^-]+)/);
            if (locationMatch) {
                const location = locationMatch[1].trim();
                utils.debug('Extracted location:', location);
                return location;
            }

            return null;
        },

        /**
         * Check if the location is in Spain
         * @param {string} location - Location string to check
         * @returns {boolean} - True if location is Spain
         */
        isSpainLocation: function(location) {
            if (!location) return false;
            return location.toLowerCase().includes('spain');
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
         * Create and display a message for Spain locations
         * @returns {Element} - The created message element
         */
        createSpainLocationMessage: function() {
            const container = document.createElement('div');
            container.className = CONFIG.display.containerClass;
            utils.applyStyles(container, CONFIG.display.styles.container);

            const messageDiv = document.createElement('div');
            utils.applyStyles(messageDiv, {
                padding: '10px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                color: '#856404'
            });

            const messageText = document.createElement('p');
            messageText.textContent = 'Final Price Calculator is not available for items located in Spain.';
            messageText.style.margin = '0';
            messageText.style.fontWeight = 'bold';

            messageDiv.appendChild(messageText);
            container.appendChild(messageDiv);

            return container;
        },

        /**
         * Create and style the final price display element
         * @param {number} finalPrice - The calculated final price
         * @param {number} minBid - The minimum bid amount
         * @param {number|null} delivery - The delivery cost (null if not found)
         * @param {Object} breakdown - Calculation breakdown
         * @param {boolean} isVehicles - Whether we're on the vehicles site (no delivery)
         * @returns {Element} - The created display element
         */
        createPriceDisplay: function(finalPrice, minBid, delivery, breakdown, isVehicles) {
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
            
            // Create breakdown items safely using DOM manipulation
            const breakdownItems = [
                { label: 'Minimum bid:', value: utils.formatCurrency(minBid) },
                { label: 'VAT (20%):', value: utils.formatCurrency(breakdown.vat) },
                { label: 'Buyer\'s premium (25%):', value: utils.formatCurrency(breakdown.buyerPremium) },
                { label: 'VAT on premium (20%):', value: utils.formatCurrency(breakdown.vatBuyerPremium) }
            ];

            // Add delivery rows only for the auctions site
            if (!isVehicles) {
                const deliveryText = delivery !== null ? utils.formatCurrency(delivery) : 'Not found';
                breakdownItems.push({ label: 'Delivery:', value: deliveryText });
                if (delivery !== null) {
                    breakdownItems.push({
                        label: 'VAT on delivery (20%):',
                        value: utils.formatCurrency(breakdown.vatDelivery)
                    });
                }
            }
            
            // Create each breakdown item as a two-column div element
            breakdownItems.forEach(item => {
                const itemDiv = document.createElement('div');
                utils.applyStyles(itemDiv, CONFIG.display.styles.breakdownItem);
                
                const labelSpan = document.createElement('span');
                labelSpan.textContent = item.label;
                utils.applyStyles(labelSpan, CONFIG.display.styles.breakdownLabel);
                
                const valueSpan = document.createElement('span');
                valueSpan.textContent = item.value;
                utils.applyStyles(valueSpan, CONFIG.display.styles.breakdownValue);
                
                itemDiv.appendChild(labelSpan);
                itemDiv.appendChild(valueSpan);
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

                // Detect location
                const location = this.detectLocation();
                utils.debug('Detected location:', location);

                // Check if location is Spain
                if (location && this.isSpainLocation(location)) {
                    utils.debug('Spain location detected, showing message instead of calculator');

                    // Find injection point
                    const injectionPoint = this.findInjectionPoint();
                    if (!injectionPoint) {
                        utils.debug('Cannot display message: no suitable injection point found');
                        return;
                    }

                    // Create and inject Spain location message
                    const messageDisplay = this.createSpainLocationMessage();

                    // Insert after the minimum bid container within the form group
                    const minBidContainer = utils.findElement(CONFIG.selectors.minBidContainer);
                    if (minBidContainer && injectionPoint.contains(minBidContainer)) {
                        minBidContainer.insertAdjacentElement('afterend', messageDisplay);
                    } else {
                        injectionPoint.appendChild(messageDisplay);
                    }

                    utils.debug('Spain location message displayed successfully');
                    return;
                }

                // Proceed with UK location logic
                utils.debug('UK location detected, proceeding with calculation');

                // Find minimum bid
                const minBid = this.findMinimumBid();
                if (minBid === null) {
                    utils.debug('Cannot proceed: minimum bid not found');
                    return;
                }
                
                // Find delivery cost (vehicles site has no delivery — collection only)
                const isVehicles = this.isVehiclesSite();
                const delivery = isVehicles ? null : this.findDeliveryCost();

                // Calculate final price using the specified formula
                const vat = minBid * 0.2;
                const buyerPremium = minBid * 0.25;
                const vatBuyerPremium = buyerPremium * 0.2;
                const vatDelivery = isVehicles ? 0 : (delivery || 0) * 0.2;
                const finalPrice = minBid + vat + buyerPremium + vatBuyerPremium + (isVehicles ? 0 : (delivery || 0)) + vatDelivery;

                utils.debug('Price calculation:', {
                    minBid,
                    delivery,
                    isVehicles,
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
                const priceDisplay = this.createPriceDisplay(finalPrice, minBid, delivery, breakdown, isVehicles);
                
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
            // Detect location first
            const location = this.detectLocation();

            // Check if location is Spain
            if (location && this.isSpainLocation(location)) {
                window.johnPyePriceData = {
                    finalPrice: null,
                    minBid: null,
                    delivery: null,
                    error: 'Calculator not available for items in Spain'
                };
                utils.debug('Price data stored (Spain location):', window.johnPyePriceData);
                return;
            }

            const isVehicles = this.isVehiclesSite();
            const minBid = this.findMinimumBid();
            const delivery = isVehicles ? null : this.findDeliveryCost();
            let finalPrice = null;
            let error = null;

            if (minBid !== null) {
                const vat = minBid * 0.2;
                const buyerPremium = minBid * 0.25;
                const vatBuyerPremium = buyerPremium * 0.2;
                const vatDelivery = isVehicles ? 0 : (delivery || 0) * 0.2;
                finalPrice = minBid + vat + buyerPremium + vatBuyerPremium + (isVehicles ? 0 : (delivery || 0)) + vatDelivery;
            } else {
                error = 'Minimum bid not found';
            }

            window.johnPyePriceData = {
                finalPrice,
                minBid,
                delivery,
                isVehiclesSite: isVehicles,
                error
            };

            utils.debug('Price data stored:', window.johnPyePriceData);
        },

        /**
         * Check if we're on the John Pye Vehicles site
         * @returns {boolean}
         */
        isVehiclesSite: function() {
            return window.location.hostname.includes('johnpyevehicles.co.uk');
        },

        /**
         * Initialize the extension
         */
        init: function() {
            utils.debug('John Pye Final Price Calculator initializing...');

            // Check if we're on a supported page
            const onAuctionsPage = window.location.href.includes('johnpyeauctions.co.uk/Event/LotDetails/');
            const onVehiclesPage = window.location.href.includes('johnpyevehicles.co.uk/Event/LotDetails/');
            if (!onAuctionsPage && !onVehiclesPage) {
                utils.debug('Not on a supported lot details page, exiting');
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
