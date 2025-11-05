# Client-Side Code

This directory contains the modular client-side JavaScript for the Salla Bundle Modal.

## 📁 Directory Structure

```
client/
├── modal/                      # Source files (edit these)
│   ├── index.js               # Main modal application
│   └── modules/               # Extracted modules
│       └── feedbackSystem.js  # Audio & haptic feedback
│
└── build/                      # Generated files (do not edit)
    └── modal.bundle.js        # Built bundle served to clients
```

## 🛠️ Development Workflow

### Making Changes

1. **Edit source files** in `modal/` directory
2. **Rebuild the bundle:**
   ```bash
   npm run build:modal
   ```
3. **Restart the server** to serve the new bundle
4. **Test** in your browser

### Build Commands

```bash
# Development build (with source maps)
npm run build:modal

# Production build (minified)
npm run build:modal:prod

# Watch mode (auto-rebuild on changes)
npm run watch:modal
```

## 📦 Module System

### Creating a New Module

1. Create a new file in `modal/modules/`:

```javascript
// modal/modules/myModule.js
export function myFunction(param) {
  return param * 2;
}

export const myConstant = 42;
```

2. Import it in `modal/index.js`:

```javascript
// modal/index.js
import { myFunction, myConstant } from './modules/myModule.js';

// Use it
const result = myFunction(21); // 42
```

3. Rebuild:

```bash
npm run build:modal
```

### Existing Modules

#### `modules/feedbackSystem.js`
Handles user interaction feedback:
- **Audio feedback:** Web Audio API tones
- **Haptic feedback:** iOS Haptic Engine + Vibration API
- **Cross-platform:** Graceful degradation

**Usage:**
```javascript
import { feedbackSystem } from './modules/feedbackSystem.js';

// Initialize audio on user interaction
feedbackSystem.initAudio();

// Trigger feedback
feedbackSystem.triggerFeedback('click');    // Light tap
feedbackSystem.triggerFeedback('progress'); // Progress sound
feedbackSystem.triggerFeedback('complete'); // Completion sound
feedbackSystem.triggerFeedback('success');  // Success celebration
```

## 🎯 Best Practices

### Do's ✅
- ✅ Edit files in `modal/` directory
- ✅ Rebuild after every change
- ✅ Use ES module syntax (`import`/`export`)
- ✅ Keep modules small and focused
- ✅ Add JSDoc comments to exported functions
- ✅ Test in multiple browsers

### Don'ts ❌
- ❌ Edit files in `build/` directory (they're auto-generated)
- ❌ Use `require()` (use `import` instead)
- ❌ Add large dependencies (keep bundle size small)
- ❌ Use global variables (use modules)

## 🏗️ Architecture

### Entry Point: `modal/index.js`

The main file that:
- Imports all modules
- Defines the `SallaBundleModal` class
- Exposes the class to `window` for external use
- Handles modal lifecycle

### Modules: `modal/modules/`

Small, focused modules that:
- Export specific functionality
- Have no side effects on import
- Can be tested independently
- Follow single responsibility principle

### Build Output: `build/modal.bundle.js`

The bundled file that:
- Combines all modules into one file
- Wraps in IIFE (Immediately Invoked Function Expression)
- Exposes `window.SallaBundleModal`
- Is served to browsers via Express route

## 🔍 Debugging

### Development Mode

Source maps are included in development builds:

```bash
npm run build:modal
```

Browser DevTools will show original source files, not the bundle.

### Production Mode

Minified bundle without source maps:

```bash
npm run build:modal:prod
```

Use this for deployment to reduce file size.

## 📊 Bundle Analysis

Check bundle size:

```bash
# Windows
Get-Item src/client/build/modal.bundle.js | Select-Object Name, Length

# Linux/Mac
ls -lh src/client/build/modal.bundle.js
```

## 🧪 Testing

### Manual Testing

1. Start the server
2. Load a page with the bundle modal
3. Open browser DevTools
4. Check for console errors
5. Test user interactions

### Automated Testing (Future)

Structure is ready for:
- Unit tests (Jest/Vitest)
- Integration tests
- E2E tests (Playwright/Cypress)

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] All changes tested
- [ ] Production build created (`npm run build:modal:prod`)
- [ ] Bundle size acceptable (< 200KB recommended)
- [ ] No console errors
- [ ] Works in target browsers

### Deployment Steps

1. Build production bundle:
   ```bash
   npm run build:modal:prod
   ```

2. Commit both source and bundle:
   ```bash
   git add src/client/
   git commit -m "Update modal bundle"
   ```

3. Deploy server with new bundle

## 🐛 Troubleshooting

### Bundle not updating?

1. Check if build succeeded:
   ```bash
   npm run build:modal
   ```

2. Restart the server (it reads bundle on startup)

3. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)

### Build errors?

- Check for syntax errors in source files
- Ensure all imports have matching exports
- Verify file paths are correct

### Module not found?

- Ensure the module file exists
- Check import path (should be relative: `./modules/...`)
- Verify export syntax in the module

## 📚 Additional Resources

- [esbuild Documentation](https://esbuild.github.io/)
- [ES Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🤝 Contributing

When adding features:

1. **Create a new module** if it's a distinct feature
2. **Update this README** with usage examples
3. **Keep the bundle small** - avoid large dependencies
4. **Test thoroughly** before committing
5. **Document your code** with JSDoc comments

---

**Last updated:** November 5, 2025
**Bundle format:** IIFE (ES2017+)
**Build tool:** esbuild


