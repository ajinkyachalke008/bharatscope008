# World Monitor

A production-ready global intelligence dashboard combining real-time event tracking, geospatial visualization, and multi-source feed aggregation.

## Architecture

Built as a Turborepo monorepo with:
- **Client**: Vite + React, Zustand, Mapbox/SVG Map, TailwindCSS
- **Server**: Node.js + Express, WebSocket, Mock Data Providers
- **Shared**: Common TypeScript types and utilities

## Features

- **Real-time Map**: Global heatmap and event markers with critical pulse animations
- **Dashboard Grid**: Threat gauges, statistical breakdowns, and regional threat assessments
- **Intelligence Feed**: Merged stream of OSINT, SIGINT, news, and social data
- **Signal Alerts**: High-priority notifications with acknowledgment flow
- **Event Timeline**: Chronological log with severity and category filtering

## Quick Start (Development)

1. **Install dependencies:**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Setup environment:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. **Start development servers:**
   \`\`\`bash
   pnpm dev
   \`\`\`
   - Client available at: http://localhost:5173
   - API available at: http://localhost:4000

## Production Deployment

You can deploy the stack using the provided Docker Compose configuration:

\`\`\`bash
docker compose up -d --build
\`\`\`

This will build the Node.js server and an Nginx container serving the optimized React client.

## Author

**Ajinkya**
* **GitHub:** [@ajinkyachalke008](https://github.com/ajinkyachalke008)
* **Email:** [ajinkyachalke008@gmail.com](mailto:ajinkyachalke008@gmail.com)
