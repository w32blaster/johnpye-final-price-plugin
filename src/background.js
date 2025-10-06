// John Pye Final Price Calculator - Background Script
// Handles extension lifecycle and provides basic functionality

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
    console.log('John Pye Final Price Calculator installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // First time installation
        console.log('Extension installed for the first time');
    } else if (details.reason === 'update') {
        // Extension updated
        console.log('Extension updated from version:', details.previousVersion);
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background script received message:', message);
    
    switch (message.action) {
    case 'priceCalculated':
        console.log('Price calculated:', message.data);
        sendResponse({ success: true });
        break;
            
    case 'error':
        console.error('Content script reported error:', message.error);
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

