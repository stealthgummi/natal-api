# Easy Chart API

> The Headless Transparent Astrological Vector Overlay & Dossier Engine

High-precision astronomical ephemeris and publication-grade SVG astrology chart generator. Outputs transparent vector overlays with collision-avoidance and modern psychological interpretive starter dossiers.

## Brand Identity

- **Product Name:** Easy Chart API
- **Brand Color:** `#004aad` (Royal Sapphire Blue)
- **Cover Banner:** `easy-chart.png`
- **Flagship Reference Chart (Founder Easter Egg):** March 2, 1971 · 1:11 PM · Cincinnati, OH

## Endpoints

1. `POST /v1/chart.svg`
   - Returns pure transparent vector SVG overlay stream (`image/svg+xml`).
2. `POST /v1/chart/dossier`
   - Returns comprehensive psychological reading + transparent vector SVG + base64 data URI in one call.
3. `GET /v1/chart/sample.svg`
   - Instant reference chart stream.

## Local Server

```powershell
cd easy-chart-api
node server.js
```
Listens on `http://localhost:3033`.
