# Installation Guide

## Quick Start

1. **Generate Icons** (Optional but recommended):
   - Follow instructions in `generate-icons.md` to create PNG icons
   - Or skip this step to use default browser icons

2. **Build the Extension**:
   ```bash
   npm install
   npm run build
   ```

3. **Install in Browser**:

### Chrome Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/chrome` folder from this project
5. The extension is now installed!

### Firefox Installation
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the `dist/firefox` folder
5. Select the `manifest.json` file
6. The extension is now installed!

## Testing the Extension

1. Navigate to a John Pye auction lot details page:
   `https://www.johnpyeauctions.co.uk/Event/LotDetails/[lot-number]/[lot-name]`

2. The extension should automatically:
   - Detect the minimum bid amount
   - Find the delivery cost
   - Calculate and display the final price
   - Show a green box with the calculation

3. Click the extension icon in your browser toolbar to:
   - See the current status
   - View price breakdown
   - Refresh the calculation
   - Access settings (coming soon)

## Troubleshooting

### Extension Not Appearing
- Make sure you selected the correct folder (`dist/chrome` or `dist/firefox`)
- Check the browser's extension management page for error messages
- Verify that the `manifest.json` file is present in the selected folder

### No Price Calculation Showing
1. Check that you're on a John Pye lot details page
2. Open browser console (F12) and look for debug messages
3. Try clicking the extension icon and use the "Refresh" button
4. The page structure might have changed - see "Advanced Troubleshooting" below

### Permission Denied Errors
- The extension should automatically request permissions for `https://www.johnpyeauctions.co.uk/*`
- If prompted, click "Allow" to grant the necessary permissions

## Advanced Troubleshooting

If the extension can't find price information, you can analyze the page structure:

1. Navigate to a John Pye lot details page
2. Open browser console (F12 → Console tab)
3. Copy and paste the contents of `site-analyzer.js` from this project
4. Press Enter to run the analysis
5. Copy the console output and use it to update the selectors in `src/content.js`

## Development Mode

For ongoing development:

1. Make changes to files in the `src/` directory
2. Run `npm run build` to rebuild
3. Go to your browser's extensions page
4. Click the "Reload" button for the extension
5. Refresh any John Pye pages you have open

## Packaging for Distribution

To create installable packages:

```bash
npm run package
```

This creates:
- `johnpye-extension-chrome.zip` - for Chrome Web Store
- `johnpye-extension-firefox.zip` - for Firefox Add-ons

## Need Help?

1. Check the browser console for error messages
2. Review the `README.md` for detailed documentation
3. Use the `site-analyzer.js` tool to debug DOM structure issues
4. Check that your browser version meets the minimum requirements:
   - Chrome 88+
   - Firefox 55+