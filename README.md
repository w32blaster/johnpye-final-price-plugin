# John Pye Final Price Calculator Browser Extension

A professional cross-browser extension that automatically calculates and displays the total final price including VAT, buyer's premium, and delivery costs for John Pye auction items. This tool helps bidders understand the complete cost before placing bids.


![Screenshot of the widget under the bidding field](https://raw.githubusercontent.com/w32blaster/johnpye-final-price-plugin/refs/heads/update-readme/src/screenshot.png)

## Store links:
    - Mozilla addons: https://addons.mozilla.org/en-GB/firefox/addon/john-pye-price-calculator/

## Project Description and Purpose

John Pye Auctions displays minimum bid amounts on lot detail pages, but bidders must manually calculate additional costs like VAT (20%), buyer's premium (25% + VAT), and delivery charges. This extension automates that calculation, providing transparency and helping users make informed bidding decisions.

The extension runs exclusively on John Pye auction lot detail pages and integrates seamlessly with the existing page design, displaying the final price calculation in a clear, non-intrusive manner.

## Features

- **🎯 Automatic Detection**: Works on John Pye auction lot detail pages (`https://www.johnpyeauctions.co.uk/Event/LotDetails/*`)
- **💰 Complete Price Calculation**: Calculates final price including VAT, buyer's premium, and delivery costs
- **📊 Detailed Breakdown**: Shows itemized cost breakdown in extension popup
- **🎨 Clean Integration**: Non-intrusive display that matches the site's design language
- **🔄 Dynamic Updates**: Automatically recalculates when page content changes
- **🌐 Cross-Browser Support**: Compatible with both Chrome (Manifest V3) and Firefox (Manifest V2)
- **📱 Responsive Design**: Works on desktop and mobile browsers
- **🛡️ Privacy-Focused**: No data collection, works entirely client-side
- **⚡ Lightweight**: Minimal performance impact on page loading

## Installation Instructions

### Chrome Installation

1. **Download or Build**:
   - Download the latest release or clone the repository
   - If building from source, run `npm install && npm run build`

2. **Install Extension**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist/chrome` folder from the project directory
   - The extension will appear in your extensions list

3. **Verify Installation**:
   - Look for the John Pye calculator icon in your browser toolbar
   - Navigate to a John Pye lot details page to test functionality

### Firefox Installation

1. **Download or Build**:
   - Download the latest release or clone the repository  
   - If building from source, run `npm install && npm run build`

2. **Install Extension (Temporary)**:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox" in the left sidebar
   - Click "Load Temporary Add-on..."
   - Navigate to the `dist/firefox` folder
   - Select the `manifest.json` file
   - The extension will be installed temporarily

3. **Permanent Installation** (for signed extensions):
   - Download the `.xpi` file from releases
   - Drag and drop onto Firefox or use "Install Add-on From File"

## How to Use the Extension

1. **Navigate to John Pye Auctions**:
   - Go to `https://www.johnpyeauctions.co.uk`
   - Browse to any auction lot detail page

2. **Automatic Calculation**:
   - The extension automatically detects the minimum bid amount
   - It finds delivery costs from the shipping table
   - A green calculation box appears showing the final price

3. **View Detailed Breakdown**:
   - Click the extension icon in your browser toolbar
   - See itemized costs: minimum bid, VAT, buyer's premium, delivery, etc.
   - Use the refresh button to recalculate if needed

4. **Troubleshooting**:
   - If no calculation appears, check the extension popup for status
   - Use the browser console (F12) to view debug information
   - Try refreshing the page or clicking the popup refresh button

## Price Calculation Formula

The extension uses John Pye's official pricing structure to calculate the total final price:

### Formula Breakdown

```
Final Price = Minimum Bid + VAT + Buyer's Premium + VAT on Premium + Delivery + VAT on Delivery
```

### Detailed Calculation

1. **Minimum Bid**: Base auction price (extracted from page)
2. **VAT on Bid**: 20% of minimum bid
3. **Buyer's Premium**: 25% of minimum bid  
4. **VAT on Premium**: 20% of buyer's premium
5. **Delivery Cost**: Shipping/collection fee (extracted from page)
6. **VAT on Delivery**: 20% of delivery cost

### Example Calculation

For a £100 minimum bid item with £15 delivery:

```
Minimum Bid:           £100.00
VAT (20%):             £ 20.00
Buyer's Premium (25%): £ 25.00
VAT on Premium (20%):  £  5.00
Delivery:              £ 15.00
VAT on Delivery (20%): £  3.00
─────────────────────────────
Total Final Price:     £168.00
```

## Development Setup Instructions

### Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **npm**: Comes with Node.js
- **Git**: For version control

### Initial Setup

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd johnpye-final-price-plugin
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build Extensions**:
   ```bash
   npm run build
   ```

### Development Workflow

1. **Make Changes**: Edit files in the `src/` directory
2. **Rebuild**: Run `npm run build` 
3. **Test**: Reload extension in browser and test on John Pye pages
4. **Debug**: Use browser console and extension popup for debugging

### Available Scripts

```bash
# Build for both browsers
npm run build

# Build for specific browser
npm run build:chrome
npm run build:firefox

# Development mode with auto-rebuild
npm run dev

# Clean build directories  
npm run clean

# Package for distribution
npm run package

# Lint code
npm run lint
```

## Building from Source

### Quick Build

```bash
# Clone and setup
git clone <repository-url>
cd johnpye-final-price-plugin
npm install

# Build extensions
npm run build

# Extensions are now in dist/chrome and dist/firefox
```

### Project Structure

```
johnpye-final-price-plugin/
├── src/                          # Source files
│   ├── content.js               # Main content script logic
│   ├── background.js            # Background/service worker
│   ├── popup.html               # Extension popup interface
│   ├── popup.js                 # Popup functionality
│   ├── popup.css                # Popup styling
│   ├── styles.css               # Content script styles
│   ├── icons/                   # Extension icons
│   └── lib/                     # External libraries
├── manifests/                   # Browser-specific manifests
│   ├── chrome.json             # Chrome Manifest V3
│   └── firefox.json            # Firefox Manifest V2
├── dist/                        # Built extensions (generated)
│   ├── chrome/                 # Chrome extension files
│   └── firefox/                # Firefox extension files
├── testing/                     # Test files and samples
├── package.json                 # Node.js project configuration
└── README.md                    # This file
```

### Build Process

The build system:
1. Cleans previous build directories
2. Copies source files to browser-specific directories
3. Applies appropriate manifest files
4. Generates icons (if configured)
5. Creates installable packages for distribution

## Troubleshooting

### Extension Not Working

**Issue**: Extension icon appears but no price calculation shows

**Solutions**:
1. Verify you're on a John Pye lot details page (`/Event/LotDetails/...`)
2. Check browser console (F12 → Console) for error messages
3. Click extension icon and use "Refresh" button
4. Try disabling and re-enabling the extension

**Issue**: Extension icon not visible

**Solutions**:
1. Check browser's extension management page
2. Ensure extension is enabled
3. Try pinning the extension to toolbar
4. Restart browser

### Price Detection Issues

**Issue**: "Could not find minimum bid" error

**Solutions**:
1. Page structure may have changed - check console for debug info
2. Run the site analyzer tool (see Advanced Troubleshooting)
3. Report the issue with page URL and console output

**Issue**: "Could not find delivery cost" warning

**Solutions**:
1. Some lots may not have delivery costs listed
2. Extension will calculate without delivery if not found
3. Check if delivery information appears elsewhere on page

### Permission Problems

**Issue**: "Extension cannot access page" error

**Solutions**:
1. Ensure extension has permission for `https://www.johnpyeauctions.co.uk/*`
2. Check manifest.json includes correct host permissions
3. Try removing and reinstalling the extension

### Advanced Troubleshooting

**Site Structure Analysis**:
If the extension stops working after John Pye updates their website:

1. Navigate to a lot details page
2. Open browser console (F12 → Console)
3. Copy and paste contents of `site-analyzer.js` into console
4. Run the analysis to see current DOM structure
5. Update selectors in `src/content.js` based on findings
6. Rebuild and test

**Debug Mode**:
Enable detailed logging by modifying `src/content.js`:
```javascript
const CONFIG = {
    debug: true,  // Enable debug logging
    // ... rest of config
};
```

## Contributing Guidelines

### How to Contribute

1. **Fork the Repository**: Create your own fork on GitHub
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your improvements
4. **Test Thoroughly**: Test in both Chrome and Firefox
5. **Submit Pull Request**: Include detailed description of changes

### Development Standards

- **Code Style**: Follow existing code patterns and use ESLint
- **Browser Support**: Ensure compatibility with Chrome 88+ and Firefox 55+
- **Testing**: Test on multiple John Pye auction pages
- **Documentation**: Update README and code comments as needed

### Reporting Issues

When reporting bugs:
1. Include browser version and operating system
2. Provide the specific John Pye page URL
3. Share browser console output
4. Describe expected vs actual behavior
5. Include steps to reproduce

### Feature Requests

For new features:
1. Open an issue describing the feature
2. Explain the use case and benefits
3. Consider implementation complexity
4. Discuss with maintainers before coding

## License Information

### MIT License

Copyright (c) 2024 John Pye Final Price Calculator Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Additional Information

### Browser Compatibility

| Browser | Minimum Version | Manifest | Status |
|---------|----------------|----------|---------|
| Chrome  | 88+            | V3       | ✅ Supported |
| Firefox | 55+            | V2       | ✅ Supported |
| Edge    | 88+            | V3       | 🔄 Testing needed |
| Safari  | -              | -        | ❌ Not supported |

### Privacy and Security

- **No Data Collection**: Extension operates entirely client-side
- **No External Requests**: All calculations performed locally
- **Minimal Permissions**: Only requests access to John Pye auction pages
- **Open Source**: Full source code available for security review

### Disclaimer

This extension is not affiliated with John Pye Auctions Limited. It is an independent tool created to help users understand the complete cost structure of auction items by combining publicly available information displayed on their website. Users should always verify calculations and refer to John Pye's official terms and conditions for authoritative pricing information.

### Support

- **Documentation**: See additional files in project directory
- **Issues**: Report bugs and request features via GitHub issues
- **Development**: See `INSTALLATION.md` for detailed setup instructions
- **Site Analysis**: Use `site-analyzer.js` for debugging page structure changes

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: Community Contributors
