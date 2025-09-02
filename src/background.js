// John Pye Final Price Calculator - Background Script
// Handles extension lifecycle and provides basic functionality

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('John Pye Final Price Calculator installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // First time installation
        console.log('Extension installed for the first time');
        
        // Optional: Open welcome page or show notification
        // chrome.tabs.create({ url: 'https://www.johnpyeauctions.co.uk' });
    } else if (details.reason === 'update') {
        // Extension updated
        console.log('Extension updated from version:', details.previousVersion);
    }
});

// Handle extension icon click (when popup is not available)
chrome.action.onClicked.addListener((tab) => {
    // Check if we're on a John Pye auction page
    if (tab.url.includes('johnpyeauctions.co.uk/Event/LotDetails/')) {
        console.log('Extension icon clicked on John Pye lot details page');
        
        // Send a message to the content script to recalculate/refresh
        chrome.tabs.sendMessage(tab.id, {
            action: 'recalculate'
        }).catch((error) => {
            console.log('Could not send message to content script:', error);
        });
    } else {
        console.log('Extension icon clicked on non-target page, redirecting to John Pye');
        
        // Navigate to John Pye auctions homepage
        chrome.tabs.create({
            url: 'https://www.johnpyeauctions.co.uk'
        });
    }
});

// Listen for tab updates to detect navigation to target pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only proceed if the page has finished loading
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is a John Pye lot details page
        if (tab.url.includes('johnpyeauctions.co.uk/Event/LotDetails/')) {
            console.log('User navigated to John Pye lot details page:', tab.url);
            
            // Optional: Badge to indicate extension is active
            chrome.action.setBadgeText({
                tabId: tabId,
                text: '💰'
            });
            
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#28a745'
            });
        } else {
            // Clear badge on other pages
            chrome.action.setBadgeText({
                tabId: tabId,
                text: ''
            });
        }
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background script received message:', message);
    
    switch (message.action) {
    case 'priceCalculated':
        console.log('Price calculated:', message.data);
            
        // Update badge with final price if available
        if (sender.tab && message.data.finalPrice) {
            chrome.action.setBadgeText({
                tabId: sender.tab.id,
                text: `£${Math.round(message.data.finalPrice)}`
            });
        }
            
        sendResponse({ success: true });
        break;
            
    case 'error':
        console.error('Content script reported error:', message.error);
            
        // Update badge to indicate error
        if (sender.tab) {
            chrome.action.setBadgeText({
                tabId: sender.tab.id,
                text: '!'
            });
                
            chrome.action.setBadgeBackgroundColor({
                tabId: sender.tab.id,
                color: '#dc3545'
            });
        }
            
        sendResponse({ success: true });
        break;
            
    default:
        console.log('Unknown message action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('John Pye Final Price Calculator extension started');
});

// Cleanup on extension suspend (Manifest V3 service worker lifecycle)
self.addEventListener('beforeunload', () => {
    console.log('Background script unloading');
});

