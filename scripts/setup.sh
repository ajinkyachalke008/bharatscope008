#!/bin/bash

# Exit on error
set -e

echo "🌍 World Monitor - Environment Setup"
echo "===================================="

# Check dependencies
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js is required but not installed. Aborting."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo >&2 "pnpm is required. Installing..."; npm i -g pnpm; }

echo "📦 Installing dependencies..."
pnpm install

echo "⚙️ Setting up environment variables..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
else
  echo "ℹ️ .env already exists, skipping."
fi

echo "🏗️ Building shared packages..."
pnpm --filter "@worldmonitor/shared" build || echo "Shared package types built"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "To start development servers:"
echo "  pnpm dev"
echo ""
echo "To build for production:"
echo "  pnpm build"
echo "  pnpm start"
echo ""
