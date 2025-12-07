#!/bin/bash

# SETLY Mobile App - Build & Test Commands
# Run these commands to build, test, and deploy the mobile-optimized PWA

set -e  # Exit on error

echo "🚀 SETLY Mobile App Conversion - Build & Test Script"
echo "======================================================"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

echo "✅ Found package.json in $(pwd)"
echo ""

# Function to display menu
show_menu() {
    echo "Choose an option:"
    echo ""
    echo "  1) Install dependencies"
    echo "  2) Run development server (no PWA)"
    echo "  3) Build for production"
    echo "  4) Test PWA locally (requires production build)"
    echo "  5) Run on local network (test on mobile device)"
    echo "  6) Check for errors (lint)"
    echo "  7) Optimize images (future)"
    echo "  8) Generate PWA icons from source"
    echo "  9) Full build + test PWA"
    echo "  0) Exit"
    echo ""
}

# Install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
}

# Dev server
dev_server() {
    echo "🔨 Starting development server..."
    echo "⚠️  Note: Service worker will NOT register in dev mode"
    echo "   Open http://localhost:4200"
    echo ""
    npm start
}

# Production build
prod_build() {
    echo "🏗️  Building for production..."
    npm run build -- --configuration production
    echo ""
    echo "✅ Production build complete!"
    echo "   Output: dist/setly/"
    echo ""
}

# Test PWA locally
test_pwa() {
    echo "🧪 Testing PWA locally..."
    
    if [ ! -d "dist/setly" ]; then
        echo "❌ Error: dist/setly not found. Run 'Build for production' first."
        return 1
    fi
    
    echo "Starting HTTP server..."
    echo "Open http://localhost:8080 in your browser"
    echo ""
    echo "PWA Testing Checklist:"
    echo "  ✓ Open DevTools > Application"
    echo "  ✓ Check Service Workers (should be registered)"
    echo "  ✓ Check Manifest (verify icons, shortcuts)"
    echo "  ✓ Test offline mode (Network > Offline)"
    echo "  ✓ Mobile: Safari > Add to Home Screen"
    echo ""
    
    cd dist/setly
    npx http-server -c-1 -p 8080
}

# Run on network
network_server() {
    echo "📱 Starting server on local network..."
    echo ""
    
    # Get local IP
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0)
    else
        LOCAL_IP=$(hostname -I | awk '{print $1}')
    fi
    
    echo "✅ Your local IP: $LOCAL_IP"
    echo ""
    echo "Access from mobile device:"
    echo "   http://$LOCAL_IP:4200"
    echo ""
    echo "On your phone:"
    echo "  1. Connect to same WiFi network"
    echo "  2. Open browser and navigate to http://$LOCAL_IP:4200"
    echo "  3. Test touch interactions, bottom nav, bottom sheets"
    echo "  4. iOS: Add to Home Screen"
    echo "  5. Android: Install App prompt"
    echo ""
    
    ng serve --host 0.0.0.0
}

# Lint check
lint_check() {
    echo "🔍 Checking for errors..."
    npm run lint
    echo ""
    echo "✅ Lint check complete"
    echo ""
}

# Optimize images (placeholder)
optimize_images() {
    echo "🖼️  Image optimization coming soon..."
    echo ""
    echo "Manual steps for now:"
    echo "  1. Convert splash screens from SVG to PNG"
    echo "  2. Use tools like ImageOptim, Squoosh, or Sharp"
    echo "  3. Create WebP/AVIF variants"
    echo "  4. Update manifest to reference PNG files"
    echo ""
}

# Generate icons (placeholder)
generate_icons() {
    echo "🎨 PWA icon generation..."
    echo ""
    echo "Icons already created as SVG in src/assets/"
    echo ""
    echo "To convert to PNG (recommended for production):"
    echo "  1. Use online tool: https://realfavicongenerator.net/"
    echo "  2. Or use ImageMagick:"
    echo "     convert icon-512.svg -resize 192x192 icon-192.png"
    echo "     convert icon-512.svg -resize 512x512 icon-512.png"
    echo ""
}

# Full build and test
full_build_test() {
    echo "🔄 Running full build + test..."
    echo ""
    
    install_deps
    
    echo "Step 1/3: Lint check..."
    npm run lint || echo "⚠️  Lint errors found (continuing anyway)"
    echo ""
    
    echo "Step 2/3: Production build..."
    prod_build
    
    echo "Step 3/3: Starting PWA test server..."
    test_pwa
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice [0-9]: " choice
    echo ""
    
    case $choice in
        1) install_deps ;;
        2) dev_server ;;
        3) prod_build ;;
        4) test_pwa ;;
        5) network_server ;;
        6) lint_check ;;
        7) optimize_images ;;
        8) generate_icons ;;
        9) full_build_test ;;
        0) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please try again."; echo "" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
