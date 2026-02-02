# Building Executive IDE as a Mac App with Tauri

Executive IDE can be packaged as a native macOS application using Tauri, which creates lightweight, secure desktop apps.

## Prerequisites

Before building, you need to install on your Mac:

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

3. **Node.js** (v18 or later)
   ```bash
   # Using Homebrew
   brew install node
   ```

## Clone and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ericwilson-ux/executive-ide.git
   cd executive-ide
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up database (for development):
   - You'll need a PostgreSQL database
   - Set `DATABASE_URL` environment variable
   - Run `npm run db:push` to create tables

## Building the Mac App

### Development Mode

To run the app in development mode (with hot reload):

```bash
npx tauri dev
```

This will start both the web server and open the app in a native window.

### Production Build

To create a distributable .app bundle:

```bash
npx tauri build
```

The built app will be located at:
- `src-tauri/target/release/bundle/macos/Executive IDE.app`
- `src-tauri/target/release/bundle/dmg/Executive IDE_1.0.0_x64.dmg`

## App Icons

To add custom app icons, replace the placeholder icons in `src-tauri/icons/`:
- `32x32.png` - 32x32 pixels
- `128x128.png` - 128x128 pixels  
- `128x128@2x.png` - 256x256 pixels (Retina)
- `icon.icns` - macOS icon bundle
- `icon.ico` - Windows icon (optional)

You can generate these from a single high-resolution image using:
```bash
npx tauri icon path/to/your-logo.png
```

## Important: Backend Server Required

The Tauri app is a webview wrapper that connects to the backend server. **You must have the backend running** for the app to work:

```bash
# In one terminal, start the backend
npm run dev

# In another terminal, launch the Tauri app
npx tauri dev
```

For the production build, you'll need to either:
- Run the backend server separately and configure the app to connect to it
- Host the backend on a server and update the `devUrl` in `tauri.conf.json`

## Standalone Mode

For a completely standalone desktop app (no external server), you would need to:

1. Bundle the backend with the app using Tauri's sidecar feature
2. Use SQLite instead of PostgreSQL for local storage
3. Modify the app to run in offline-first mode

The current configuration assumes you'll run the backend server separately or connect to a hosted version.

## Troubleshooting

**Build fails with "cargo not found":**
```bash
source $HOME/.cargo/env
```

**Missing system dependencies:**
```bash
brew install pkg-config openssl
```

**App crashes on launch:**
- Ensure the backend server is running on port 5000
- Check that DATABASE_URL is configured

## Architecture

The Tauri app wraps the web frontend in a native WebView window. The architecture is:

```
┌─────────────────────────────────────┐
│         Tauri Native Shell          │
│  (Rust - secure, lightweight)       │
├─────────────────────────────────────┤
│           WebView Window            │
│  (Your React frontend)              │
├─────────────────────────────────────┤
│         Backend Server              │
│  (Node.js + Express + PostgreSQL)   │
└─────────────────────────────────────┘
```

For a fully standalone app, consider embedding the server or using Tauri's Rust backend for API calls.
