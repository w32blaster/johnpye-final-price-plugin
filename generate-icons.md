# Icon Generation Instructions

The project needs icons in PNG format for the browser extension. Since ImageMagick is not available, you have a few options:

## Option 1: Online SVG to PNG Converter
1. Take the `src/icons/icon.svg` file
2. Use an online converter like https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png
3. Convert to the following sizes:
   - 16x16 pixels → save as `icon16.png`
   - 32x32 pixels → save as `icon32.png` 
   - 48x48 pixels → save as `icon48.png`
   - 128x128 pixels → save as `icon128.png`
4. Place all PNG files in the `src/icons/` directory

## Option 2: Use Browser (Quick Method)
1. Open `src/icons/icon.svg` in a web browser
2. Take screenshots and resize to required dimensions
3. Save as PNG files with the correct names

## Option 3: Skip Icons (Temporary)
The extension will work without icons, but will show default browser extension icons.

## Option 4: Use Figma/Canva/Design Tool
1. Import the SVG
2. Export as PNG in the required sizes
3. Save to the icons directory

The SVG file contains a calculator-style icon with:
- Green circular background
- Calculator display showing £ symbol
- Calculator buttons
- Professional appearance suitable for an auction price calculator

Place the generated PNG files in: `src/icons/`