# 🌿 B-Liffe

An offline-first progressive web application for biodiversity field surveys, ecological monitoring, and specimen data collection in zero-connectivity environments.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-2ea44f?style=for-the-badge&logo=github)](https://veenaav.github.io/Vasudha_App/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

🔗 **Access the Live Web App:** [https://veenaav.github.io/Vasudha_App/](https://veenaav.github.io/Vasudha_App/)

---

## ⚡ Highlights

* **Offline-First Storage**: Saves all field notes, metadata, and photos directly in browser storage via Dexie.js (IndexedDB).
* **GPS & Leaflet Maps**: High-precision device geolocation tracking and Leaflet map pin placement (with optional Mapbox HD layers).
* **Photo Documentation**: Direct device camera capture and multi-photo uploads with identification tagging.
* **Darwin Core (DwC) Ready**: Clean JSON and CSV data exports formatted for global research repositories like GBIF.
* **Project Organization**: Structure observations by research projects, field surveys, and geographic wards.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* Modern browser with IndexedDB and Geolocation API support

### Setup

```bash
# 1. Clone repository
git clone [https://github.com/veenaav/Vasudha_App.git](https://github.com/veenaav/Vasudha_App.git)
cd Vasudha_App

# 2. Install dependencies
npm install

# 3. (Optional) Set up Mapbox token
cp .env.example .env
# Open .env and add VITE_MAPBOX_TOKEN if you have one; falls back to OpenStreetMap by default.

# 4. Run local server
npm run dev
