// John Pye Auctions DOM Structure Analyzer
// Run this script in the browser console on a John Pye auction page
// to extract the DOM structure information needed for the plugin

(function() {
    console.log('=== John Pye Auctions DOM Structure Analysis ===');
    
    // 1. Find minimum bid element
    console.log('\n1. MINIMUM BID ELEMENT:');
    const minBidElement = document.querySelector('.detail__minbid');
    if (minBidElement) {
        console.log('✓ Found .detail__minbid element:');
        console.log('  HTML:', minBidElement.outerHTML);
        console.log('  Text:', minBidElement.textContent.trim());
        console.log('  Parent:', minBidElement.parentElement?.outerHTML);
        console.log('  All classes on element:', minBidElement.className);
        
        // Check for parent container structure
        let parent = minBidElement.parentElement;
        let level = 1;
        while (parent && level <= 3) {
            console.log(`  Parent level ${level}:`, parent.tagName, parent.className);
            parent = parent.parentElement;
            level++;
        }
    } else {
        console.log('✗ No element with class .detail__minbid found');
        // Try alternative selectors
        const alternatives = [
            '.minimum-bid',
            '.min-bid',
            '.starting-bid',
            '[class*="minbid"]',
            '[class*="minimum"]',
            '[class*="starting"]'
        ];
        
        console.log('  Trying alternative selectors:');
        alternatives.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`  ✓ Found with ${selector}:`, element.outerHTML);
            }
        });
    }
    
    // 2. Find delivery/shipping price elements
    console.log('\n2. DELIVERY/SHIPPING PRICE ELEMENTS:');
    const deliverySelectors = [
        '.delivery',
        '.shipping',
        '.postage',
        '.transport',
        '[class*="delivery"]',
        '[class*="shipping"]',
        '[class*="postage"]',
        '[class*="transport"]'
    ];
    
    let deliveryFound = false;
    deliverySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            if (element.textContent.includes('£') || element.textContent.toLowerCase().includes('delivery') || 
                element.textContent.toLowerCase().includes('shipping')) {
                console.log(`✓ Found delivery element with ${selector}[${index}]:`);
                console.log('  HTML:', element.outerHTML);
                console.log('  Text:', element.textContent.trim());
                deliveryFound = true;
            }
        });
    });
    
    if (!deliveryFound) {
        console.log('✗ No obvious delivery price elements found');
        // Search for any element containing delivery/shipping text
        const allElements = document.querySelectorAll('*');
        Array.from(allElements).forEach(element => {
            const text = element.textContent.toLowerCase();
            if ((text.includes('delivery') || text.includes('shipping') || text.includes('postage')) && 
                element.textContent.includes('£')) {
                console.log('  Potential delivery element:', element.outerHTML);
            }
        });
    }
    
    // 3. Analyze bid amount text format
    console.log('\n3. BID AMOUNT TEXT FORMATS:');
    const potentialBidElements = document.querySelectorAll('[class*="bid"], [class*="price"], [class*="amount"]');
    potentialBidElements.forEach((element, index) => {
        if (element.textContent.includes('£')) {
            console.log(`  Bid/Price element ${index}:`, element.textContent.trim());
            console.log(`    Classes:`, element.className);
            console.log(`    HTML:`, element.outerHTML);
        }
    });
    
    // 4. Find the best injection point
    console.log('\n4. SUGGESTED INJECTION POINTS:');
    if (minBidElement) {
        const container = minBidElement.closest('.detail, .lot-detail, .auction-detail, .item-detail');
        if (container) {
            console.log('✓ Found detail container:', container.className);
            console.log('  HTML:', container.outerHTML.substring(0, 200) + '...');
        }
        
        // Look for sibling elements where we could inject
        const siblings = Array.from(minBidElement.parentElement.children);
        console.log('  Sibling elements where final price could be injected:');
        siblings.forEach((sibling, index) => {
            console.log(`    ${index}: ${sibling.tagName}.${sibling.className}`);
        });
    }
    
    // 5. Check for dynamic loading
    console.log('\n5. DYNAMIC LOADING ANALYSIS:');
    
    // Check if there are any AJAX calls or dynamic content
    const scripts = document.querySelectorAll('script');
    let hasAjax = false;
    scripts.forEach(script => {
        if (script.textContent.includes('ajax') || script.textContent.includes('fetch') || 
            script.textContent.includes('XMLHttpRequest')) {
            hasAjax = true;
        }
    });
    
    console.log('  Has AJAX/dynamic content:', hasAjax);
    
    // Check for loading indicators
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [id*="loading"]');
    console.log('  Loading elements found:', loadingElements.length);
    
    // 6. Currency and number format analysis
    console.log('\n6. CURRENCY FORMAT ANALYSIS:');
    const allText = document.body.textContent;
    const currencyMatches = allText.match(/£[\d,]+\.?\d*/g);
    if (currencyMatches) {
        console.log('  Currency formats found:');
        [...new Set(currencyMatches)].slice(0, 10).forEach(match => {
            console.log(`    ${match}`);
        });
    }
    
    // 7. Page structure overview
    console.log('\n7. PAGE STRUCTURE OVERVIEW:');
    const mainContent = document.querySelector('main, #main, .main-content, .content');
    if (mainContent) {
        console.log('  Main content area:', mainContent.tagName + '.' + mainContent.className);
    }
    
    const detailSections = document.querySelectorAll('[class*="detail"], [class*="lot"], [class*="item"]');
    console.log('  Detail sections found:', detailSections.length);
    detailSections.forEach((section, index) => {
        if (index < 5) { // Only show first 5
            console.log(`    ${index}: ${section.tagName}.${section.className}`);
        }
    });
    
    console.log('\n=== Analysis Complete ===');
    console.log('Copy all this output and use it to build your plugin selectors.');
})();