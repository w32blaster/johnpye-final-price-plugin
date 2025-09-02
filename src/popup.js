// John Pye Final Price Calculator - Popup Script
// Handles the extension popup interface and communication with content scripts

(function() {
    'use strict';
    
    // DOM elements
    let statusIndicator, statusText, priceSection, errorSection;
    let finalPriceEl, minBidEl, deliveryCostEl, errorTextEl, errorDetailsEl;
    let refreshBtn, settingsBtn;
    
    // State
    let currentTab = null;
    let priceData = null;
    
    // Initialize popup
    function init() {
        // Get DOM elements
        statusIndicator = document.getElementById('statusIndicator');
        statusText = document.getElementById('statusText');
        priceSection = document.getElementById('priceSection');
        errorSection = document.getElementById('errorSection');
        finalPriceEl = document.getElementById('finalPrice');
        minBidEl = document.getElementById('minBid');
        deliveryCostEl = document.getElementById('deliveryCost');
        errorTextEl = document.getElementById('errorText');
        errorDetailsEl = document.getElementById('errorDetails');
        refreshBtn = document.getElementById('refreshBtn');
        settingsBtn = document.getElementById('settingsBtn');
        
        // Add event listeners
        refreshBtn.addEventListener('click', handleRefresh);
        settingsBtn.addEventListener('click', handleSettings);
        
        // Get current tab and check if it's a John Pye lot page
        getCurrentTab().then(tab => {
            currentTab = tab;
            checkPageAndCalculate();
        });
        
        console.log('Popup initialized');
    }
    
    // Get current active tab
    function getCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }
    
    // Check if current page is a John Pye lot page and calculate price
    function checkPageAndCalculate() {
        if (!currentTab || !currentTab.url) {
            updateStatus('error', '⚠️', 'Unable to access page');
            return;
        }
        
        const isJohnPyePage = currentTab.url.includes('johnpyeauctions.co.uk/Event/LotDetails/');
        
        if (!isJohnPyePage) {
            updateStatus('inactive', '📍', 'Not on a John Pye lot page');
            showError('Navigate to a John Pye auction lot details page to use this extension.', 
                `Current page: ${new URL(currentTab.url).hostname}`);
            return;
        }
        
        updateStatus('active', '⏳', 'Calculating price...');
        calculatePrice();
    }
    
    // Send message to content script to calculate price
    function calculatePrice() {
        if (!currentTab) return;
        
        // Send message to content script
        chrome.tabs.sendMessage(currentTab.id, {
            action: 'getPriceData'
        }).then(response => {
            if (response && response.success) {
                handlePriceData(response.data);
            } else {
                handleCalculationError(response?.error || 'Failed to get price data');
            }
        }).catch(error => {
            console.error('Error sending message to content script:', error);
            handleCalculationError('Content script not responding. Try refreshing the page.');
        });
    }
    
    // Handle successful price calculation
    function handlePriceData(data) {
        priceData = data;
        
        if (data.finalPrice !== null && data.minBid !== null) {
            updateStatus('active', '✅', 'Price calculated');
            showPriceData(data);
        } else {
            updateStatus('error', '❌', 'Price calculation failed');
            
            let errorMsg = 'Unable to find required price information';
            let details = [];
            
            if (data.minBid === null) {
                details.push('• Minimum bid not found');
            }
            if (data.delivery === null) {
                details.push('• Delivery cost not found');
            }
            
            showError(errorMsg, details.join('\n'));
        }
    }
    
    // Handle calculation error
    function handleCalculationError(error) {
        updateStatus('error', '❌', 'Calculation failed');
        showError('Price calculation failed', error);
    }
    
    // Update status display
    function updateStatus(type, indicator, text) {
        const statusEl = document.querySelector('.status');
        
        // Remove existing status classes
        statusEl.classList.remove('active', 'error', 'inactive');
        statusIndicator.classList.remove('loading');
        
        // Add new status
        statusEl.classList.add(type);
        statusIndicator.textContent = indicator;
        statusText.textContent = text;
        
        if (indicator === '⏳') {
            statusIndicator.classList.add('loading');
        }
    }
    
    // Show price data
    function showPriceData(data) {
        // Hide error section
        errorSection.style.display = 'none';
        
        // Format currency
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP'
            }).format(amount);
        };
        
        // Update price display
        finalPriceEl.textContent = formatCurrency(data.finalPrice);
        minBidEl.textContent = formatCurrency(data.minBid);
        
        if (data.delivery !== null) {
            deliveryCostEl.textContent = formatCurrency(data.delivery);
        } else {
            deliveryCostEl.textContent = 'Not found';
            deliveryCostEl.style.color = '#ffc107';
        }
        
        // Show price section
        priceSection.style.display = 'block';
    }
    
    // Show error message
    function showError(message, details) {
        // Hide price section
        priceSection.style.display = 'none';
        
        // Update error display
        errorTextEl.textContent = message;
        errorDetailsEl.textContent = details || '';
        
        // Show error section
        errorSection.style.display = 'block';
    }
    
    // Handle refresh button click
    function handleRefresh() {
        updateStatus('active', '⏳', 'Refreshing...');
        priceSection.style.display = 'none';
        errorSection.style.display = 'none';
        
        // Reload content script
        chrome.tabs.sendMessage(currentTab.id, {
            action: 'recalculate'
        }).then(() => {
            // Wait a bit then recalculate
            setTimeout(calculatePrice, 1000);
        }).catch(error => {
            console.error('Error refreshing:', error);
            handleCalculationError('Failed to refresh. Try reloading the page.');
        });
    }
    
    // Handle settings button click
    function handleSettings() {
        // For now, just show an alert. In the future, this could open an options page
        alert('Settings panel coming soon!\n\nFor now, you can:\n• Use the Refresh button to recalculate\n• Check the browser console for debug information');
    }
    
    // Update content script to handle messages from popup
    function injectContentScriptHandler() {
        const script = `
            (function() {
                // Listen for messages from popup
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    if (message.action === 'getPriceData') {
                        // Get current price data
                        const data = {
                            finalPrice: window.johnPyePriceData?.finalPrice || null,
                            minBid: window.johnPyePriceData?.minBid || null,
                            delivery: window.johnPyePriceData?.delivery || null,
                            error: window.johnPyePriceData?.error || null
                        };
                        
                        sendResponse({ success: true, data: data });
                    } else if (message.action === 'recalculate') {
                        // Trigger recalculation
                        if (window.finalPriceCalculator && window.finalPriceCalculator.calculateAndDisplay) {
                            window.finalPriceCalculator.calculateAndDisplay();
                        }
                        
                        sendResponse({ success: true });
                    }
                    
                    return true;
                });
            })();
        `;
        
        chrome.tabs.executeScript(currentTab.id, {
            code: script
        }).catch(error => {
            console.error('Error injecting script:', error);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Helper function to format time ago
    function timeAgo(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }
    
})();