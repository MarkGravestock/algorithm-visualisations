# Ice Cream Sales ML Predictor - Vanilla JavaScript

A pure JavaScript implementation with **no build step required**. Just open `index.html` in your browser!

## Features

✅ **Zero Build Tools** - No npm, Vite, webpack, or transpilation needed
✅ **CDN Dependencies** - TensorFlow.js and Chart.js loaded from CDN
✅ **Functionally Equivalent** - Same ML algorithms as the TypeScript version
✅ **Two ML Strategies**:
  - Custom gradient descent implementation
  - TensorFlow.js neural network
✅ **Interactive Training** - Real-time visualization with configurable parameters
✅ **Data Management** - Generate, view, and delete data points

## Quick Start

### Option 1: Direct File Opening
Simply open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Option 2: Local Server (Recommended)
For best results, serve with a local HTTP server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## File Structure

```
machine-learning-vanilla/
├── index.html          # Main HTML with UI and styles
├── ml.js              # ML implementations (Custom & TensorFlow)
├── app.js             # Application logic and charts
└── README.md          # This file
```

## How It Works

### Dependencies (Loaded from CDN)
- **TensorFlow.js 4.15.0** - For neural network implementation
- **Chart.js 4.4.1** - For data visualization

### ML Implementations

#### 1. Custom Gradient Descent
Pure JavaScript implementation:
- Feature normalization for numerical stability
- Batch gradient descent with configurable learning rate
- Manual parameter updates
- No external ML library dependencies

#### 2. TensorFlow.js
Neural network approach:
- Single dense layer (linear regression)
- SGD optimizer
- Automatic differentiation
- Leverages GPU acceleration when available

### Data Generation
Generates realistic ice cream sales data:
```
sales ≈ 2 × temperature + 30 (with random noise)
```
- Temperature: 15-40°C
- Sales: Whole numbers with realistic variance

## Comparison with TypeScript Version

| Feature | TypeScript/React/Vite | Vanilla JavaScript |
|---------|----------------------|-------------------|
| Build Step | Required (npm build) | None |
| Dependencies | npm packages | CDN links |
| File Size | ~6.8 MB bundle | ~3 KB source |
| Browser Compatibility | Modern browsers | Modern browsers |
| Development Experience | TypeScript, React, Hot reload | Plain JS, manual refresh |
| ML Functionality | ✅ Same | ✅ Same |
| Visualization | ✅ Chart.js | ✅ Chart.js |
| 2D/3D Support | ✅ Both 1D and 2D | 1D only (simpler) |

## Advantages of No-Build Version

1. **Instant Start** - No installation, dependencies, or build process
2. **Simple Deployment** - Just upload 3 files to any web server
3. **Easy Debugging** - Inspect and modify code directly in browser DevTools
4. **Educational** - Clear, readable code without transpilation artifacts
5. **Minimal Overhead** - No node_modules, build tools, or configuration files

## Disadvantages

1. **No Type Safety** - Missing TypeScript's compile-time checks
2. **No JSX** - Manual DOM manipulation instead of declarative React
3. **No Hot Reload** - Manual page refresh needed for changes
4. **No Code Splitting** - All code loaded at once (though it's small)
5. **Limited Features** - Simplified version (1D only, no 2D/3D)

## Configuration

All training parameters are adjustable via UI:
- **Data Points**: 10-500 training samples
- **Epochs**: 10-1000 training iterations
- **Learning Rate**: 0.001-0.1 step size
- **Delay**: 0-1000ms visualization speed

## Browser Compatibility

Requires modern browser with:
- ES6+ JavaScript support
- Fetch API
- Canvas 2D API
- WebGL (for TensorFlow.js GPU acceleration)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Custom Algorithm**: Fast, runs entirely in JavaScript
- **TensorFlow.js**: Slightly slower initialization, GPU-accelerated training
- **Visualization**: Smooth at 0ms delay, adjustable for educational purposes

## Troubleshooting

### CDN Loading Issues
If dependencies fail to load:
1. Check internet connection
2. Try alternative CDN URLs
3. Download libraries locally and update `<script>` tags

### TensorFlow.js Errors
If TensorFlow.js fails:
- Check browser console for WebGL errors
- Try switching to Custom strategy
- Ensure browser supports WebGL

### Chart Not Updating
- Clear browser cache
- Check console for JavaScript errors
- Ensure Chart.js loaded successfully

## License

MIT

## Credits

Created as a simplified, no-build alternative to the TypeScript/React version for:
- Quick demonstrations
- Educational purposes
- Deployment scenarios where build tools aren't available
- Understanding ML fundamentals without framework overhead
