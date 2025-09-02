# John Pye Auctions DOM Analysis Guide

Since the website blocks automated access, follow these steps to manually gather the required DOM structure information:

## Step 1: Run the Site Analyzer

1. Open the John Pye auction page in your browser:
   `https://www.johnpyeauctions.co.uk/Event/LotDetails/411466049/EINHELL-CLASSIC-BENCH-TYPE-CIRCULAR-SAW-MODEL-NO-TCTS-8-I-LOCATION-B6`

2. Open browser Developer Tools (F12)

3. Go to Console tab

4. Copy and paste the entire contents of `site-analyzer.js` into the console

5. Press Enter to run the analysis

6. Copy all the console output - this contains the DOM structure information needed

## Step 2: Manual Inspection Checklist

If the analyzer doesn't find elements, manually inspect using DevTools:

### A. Minimum Bid Element (`detail__minbid`)
- [ ] Right-click on the minimum bid amount → Inspect Element
- [ ] Note the exact HTML structure and CSS classes
- [ ] Check parent elements up to 3 levels
- [ ] Document the text format (e.g., "£25.00", "£1,250", etc.)

### B. Delivery Price Elements
Look for text containing:
- "Delivery"
- "Shipping" 
- "Postage"
- "Transport"
- "Collection"

For each found:
- [ ] Right-click → Inspect Element
- [ ] Note CSS classes and HTML structure
- [ ] Document exact text format
- [ ] Check if price is in same element or separate

### C. Page Layout Analysis
- [ ] Identify the main content container
- [ ] Find the best location to inject "Final Price" (near minimum bid)
- [ ] Check if elements load dynamically (watch for loading animations)

## Step 3: Key Information to Collect

Document these specific details:

1. **Minimum Bid Element:**
   ```
   Selector: ._______
   HTML: <div class="...">...</div>
   Text Format: £___
   Parent Container: ._______
   ```

2. **Delivery Price Element:**
   ```
   Selector: ._______
   HTML: <div class="...">...</div>
   Text Format: Delivery: £___
   Location: _______
   ```

3. **Injection Point:**
   ```
   Best location: after/before ._______
   Container: ._______
   ```

4. **Dynamic Loading:**
   ```
   Elements load dynamically: Yes/No
   Wait time needed: ___ ms
   Loading indicators: ._______
   ```

## Step 4: Test Different Pages

Repeat the analysis on 2-3 different auction items to ensure consistency:
- Different price ranges
- Different delivery options
- Different auction states (active, ended, etc.)

## Expected Output Format

After analysis, you should have:

```javascript
// Plugin configuration based on analysis
const SELECTORS = {
  minBid: '.detail__minbid',           // Confirmed selector
  delivery: '.delivery-price',          // Delivery price selector
  container: '.lot-details',            // Container for injection
  finalPrice: '.final-price-display'   // Where to inject final price
};

const TEXT_FORMATS = {
  currency: /£[\d,]+\.?\d*/,           // Currency format regex
  minBidPrefix: 'Minimum bid: ',       // Text before amount
  deliveryPrefix: 'Delivery: '         // Text before delivery cost
};
```

Run the site-analyzer.js script first, then use this guide for manual verification.