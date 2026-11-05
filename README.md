# 🌿 B-Liffe (Vasudha)

An offline-first progressive web application for biodiversity field surveys, ecological monitoring, and specimen data collection in zero-connectivity environments.

[![AWS CloudFront](https://img.shields.io/badge/AWS-CloudFront%20CDN-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](#-live-deployments)
[![GitHub Actions CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](#-continuous-deployment)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌐 Live Deployments

* 🚀 **Frontend (AWS S3 + CloudFront CDN):** [https://d2msowv3rhnqjt.cloudfront.net](https://d2msowv3rhnqjt.cloudfront.net)
  * **CloudFront Distribution ID:** `E22IM021D3GUIA`
  * **S3 Bucket:** `bliffe-frontend-dev`
* 🔌 **Backend (AWS Elastic Beanstalk):** `http://bliffe-api.ap-southeast-2.elasticbeanstalk.com`
  * **Interactive API Documentation:** `http://bliffe-api.ap-southeast-2.elasticbeanstalk.com/docs`
  * **Health Check Endpoint:** `http://bliffe-api.ap-southeast-2.elasticbeanstalk.com/health`

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
git clone https://github.com/veenaav/Vasudha_App.git
cd Vasudha_App

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Customize VITE_API_URL or Mapbox token in .env if needed

# 4. Run local server
npm run dev
```

---

## ☁️ Continuous Deployment (CI/CD)

The frontend is continuously built and deployed to **AWS S3** and distributed globally via **Amazon CloudFront** through GitHub Actions on every push to `main`.

### Deployment Flow:
1. Triggered on push to `main` branch.
2. Installs dependencies and runs `npm run build` using `VITE_BASE_URL="/"`.
3. Syncs build output (`dist/`) directly to private S3 bucket (`bliffe-frontend-dev`).
4. Automatically invalidates the CloudFront cache (`/*`) on distribution `E22IM021D3GUIA`.
