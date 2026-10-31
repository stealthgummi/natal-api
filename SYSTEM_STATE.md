# Easy Chart API — System & Infrastructure Reference

> **Last Updated:** October 31, 2026  
> **Status:** Live & Production Ready  
> **Repository:** `nightshade3271-ui/easy-chart-api`

---

## 1. Project Overview & Locations

* **Local Working Directory:** `c:\Users\jewel\Desktop\Tink\easy-chart-api`
* **Local Test Server:** `http://localhost:3033` (Run via `node server.js` or `start.bat`)
* **Live Vercel Production Gateway:** `https://easy-chart-api.vercel.app`
* **GitHub Repository:** [https://github.com/nightshade3271-ui/easy-chart-api](https://github.com/nightshade3271-ui/easy-chart-api)
  * **Default Branch:** `main`
  * **Git Remote:** `https://github.com/nightshade3271-ui/easy-chart-api.git`

---

## 2. Brand Identity & Design Tokens

* **Product Name:** `Easy Chart API`
* **Primary Brand Hex:** `#004aad` (Royal Sapphire Blue)
* **Contrast Colors:** `#FFFFFF` (White) and `#000000` (Black)
* **Brand Assets:**
  * Banner / Marketplace Cover: [`easy-chart.png`](file:///c:/Users/jewel/Desktop/Tink/easy-chart-api/easy-chart.png)
  * Brand Config File: [`brand.json`](file:///c:/Users/jewel/Desktop/Tink/easy-chart-api/brand.json)
* **Founder Easter Egg:** March 2, 1971 · 1:11 PM · Cincinnati, OH
  * *Sun:* 11.5° Pisces (9th House)
  * *Moon:* 25.0° Taurus (11th House, Exalted)
  * *Rising (ASC):* 7.8° Cancer
  * *Embedded Sample File:* [`overlay_sample.svg`](file:///c:/Users/jewel/Desktop/Tink/easy-chart-api/overlay_sample.svg)

---

## 3. Live Endpoints Specification

### Endpoint 1: Transparent Vector Overlay
* **Path:** `POST /v1/chart.svg`
* **Local URL:** `http://localhost:3033/v1/chart.svg`
* **Production URL:** `https://easy-chart-api.vercel.app/v1/chart.svg`
* **Headers:** `Content-Type: application/json`
* **Request Payload:**
  ```json
  {
    "birth_data": {
      "date": "1994-08-18",
      "time": "14:15",
      "city": "Miami"
    }
  }
  ```
* **Response:** Pure vector SVG (`Content-Type: image/svg+xml`)
  * `background: transparent;`
  * Multi-colored aspect chords (Trines: Cyan `#00F0FF`, Squares: Red `#FF3366`, Oppositions: Violet `#B57CFF`, Sextiles: Green `#00E599`, Conjunctions: Gold `#FFB800`).
  * Zodiac band color-coded by elements (Fire, Earth, Air, Water).
  * Planetary collision avoidance (stellium leader lines).
  * Dimensions: `width="800" height="800" viewBox="0 0 800 800"`.
  * Pure ASCII XML character entities (`&#9800;` to `&#9811;`, `&#9737;` to `&#9799;`, `&#176;`).

---

### Endpoint 2: Visual Overlay + Interpretive Starter Dossier
* **Path:** `POST /v1/chart/dossier`
* **Local URL:** `http://localhost:3033/v1/chart/dossier`
* **Production URL:** `https://easy-chart-api.vercel.app/v1/chart/dossier`
* **Headers:** `Content-Type: application/json`
* **Request Payload:**
  ```json
  {
    "birth_data": {
      "date": "1971-03-02",
      "time": "13:11",
      "city": "Cincinnati"
    }
  }
  ```
* **Response:** `application/json`
  * `meta`: Resolved location, IANA timezone, historical UTC time.
  * `dossier.overview`: Archetype title & dominant elements.
  * `dossier.the_big_three`: Sun, Moon, Rising archetypes, house domains, and psychological interpretations.
  * `dossier.inner_counsel`: Mercury, Venus, Mars, Jupiter, Saturn placements and dynamics.
  * `aspects`: Aspect matrix with exact orb degrees and tightness metrics.
  * `visual_package.overlay_svg`: Raw SVG string.
  * `visual_package.overlay_data_uri`: Base64 data URI for instant `<img>` insertion.

---

### Endpoint 3: Public Reference Sample
* **Path:** `GET /v1/chart/sample.svg`
* **Production URL:** `https://easy-chart-api.vercel.app/v1/chart/sample.svg`
* **Response:** Returns the Founder's reference chart as vector SVG.

---

### Endpoint 4: System Health Check
* **Path:** `GET /`
* **Production URL:** `https://easy-chart-api.vercel.app/`
* **Response:**
  ```json
  {
    "status": "online",
    "product": "Easy Chart API - Headless Transparent Vector Overlay Engine",
    "version": "1.0.0",
    "brand_color": "#004aad",
    "endpoints": [
      "POST /v1/chart.svg",
      "POST /v1/chart/dossier",
      "GET /v1/chart/sample.svg"
    ]
  }
  ```

---

## 4. RapidAPI Hub Configuration

* **API Name:** Easy Chart API
* **Base URL:** `https://easy-chart-api.vercel.app`
* **OpenAPI Spec File:** [`rapidapi-openapi.json`](file:///c:/Users/jewel/Desktop/Tink/easy-chart-api/rapidapi-openapi.json)
* **Health Check URL:** `https://easy-chart-api.vercel.app /`
* **Firewall / Security Gate:**
  * Middleware in [`lib/auth.js`](file:///c:/Users/jewel/Desktop/Tink/easy-chart-api/lib/auth.js) checks `x-rapidapi-proxy-secret`.
  * If `RAPIDAPI_PROXY_SECRET` is set in Vercel Environment Variables, direct unauthenticated requests are blocked with `403 Forbidden`.
  * If the environment variable is not set, requests pass freely for testing.
* **Monetization Tiers:**
  * **BASIC:** $0.00 / month (Taste-test tier: 25-50 calls, hard limit).
  * **PRO:** $19.00 / month (5,000 requests, $0.005 overage).
  * **ULTRA:** $59.00 / month (25,000 requests, $0.003 overage).
  * **MEGA:** $149.00 / month (100,000 requests, $0.002 overage).

---

## 5. Architecture & File Directory

```text
easy-chart-api/
├── api/
│   ├── chart.js            # Serverless handler for POST /v1/chart.svg
│   ├── dossier.js          # Serverless handler for POST /v1/chart/dossier
│   ├── sample.js           # Serverless handler for GET /v1/chart/sample.svg
│   └── index.js            # Serverless handler for GET / healthcheck
├── lib/
│   ├── ephemeris.js        # NASA JPL DE405 / VSOP87 astronomical engine
│   ├── engine.js           # Transparent vector SVG renderer & collision de-clustering
│   ├── geo.js              # Offline global city & historical DST timezone resolver
│   ├── interpretations.js  # 12 Signs x 3 Archetypes + 12 Houses + Inner Planets
│   └── auth.js             # RapidAPI proxy secret validator
├── brand.json              # Official brand tokens (#004aad, assets, easter egg)
├── easy-chart.png          # Official 16:9 brand banner & marketplace graphic
├── index.html              # Local interactive visual test harness
├── my_chart_viewer.html    # Founder chart multi-skin viewer
├── overlay_sample.svg      # Founder March 2, 1971 SVG file
├── package.json            # Node project configuration
├── rapidapi-openapi.json   # OpenAPI 3.0 specification for RapidAPI import
├── server.js               # Zero-dependency local Node server (Port 3033)
└── vercel.json             # Vercel serverless routing and CORS configuration
```

---

## 6. Technical Insights & Quirks

1. **Why Pure ASCII XML Entities are Required:**
   JavaScript's `btoa()` in browser applications fails when encoding raw UTF-8 characters outside Latin-1 (such as `♈` or `☉`). All celestial glyphs in `lib/engine.js` are encoded as XML numeric character entities (`&#9800;` - `&#9811;`, `&#9737;` - `&#9799;`, `&#176;`) so any client in any language can safely process and Base64-encode the payload.
2. **Transparent Overlay Styling:**
   The SVG has no background rectangles (`fill="none"`) and unitless pixel dimensions (`width="800" height="800"`). Clients drop it directly onto custom background images, CSS gradients, or native mobile cards using standard `<img>` or inline SVG tags.
3. **RapidAPI Test Console vs. Real Client Usage:**
   In RapidAPI's web test console, the "Response ➔ Text" tab displays the exact raw string returned by the API. The "Response ➔ Image" tab attempts an in-browser canvas render which depends on browser cache and sandbox policies; actual client apps (React, iOS Swift, Flutter, Python, cURL) consume the endpoint via standard HTTP requests with zero issues.
