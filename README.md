# 🌿 Vasudha

> **Biodiversity Field Data Collection App**  
> A lightweight, offline-first web application designed for field researchers to record observations, capture photos, and log GPS coordinates seamlessly—even in remote areas without internet connectivity.

---

## 📖 Overview

**Vasudha** is built for biodiversity surveys and wildlife monitoring. Field researchers can quickly log flora and fauna observations on mobile or desktop devices. All data is saved directly to the device's local database (IndexedDB), ensuring observations are preserved even when working offline in deep forest reserves.

---

## ✨ Features

- **Species Tracking**: Log common names, optional scientific names, and field notes.
- **Identification Status**: Categorize findings as *Identified*, *Unknown*, or *Needs verification* with visual status badges.
- **Automated Validation**: Ensures proper species details and enforces photo capture for unknown species.
- **GPS Coordinates**: Acquire device GPS coordinates and accuracy radius (± metres) with high-accuracy mode.
- **Multi-Photo Capture**:
  - Direct camera capture on mobile devices.
  - Gallery upload for existing photos.
  - Live thumbnail grid with individual photo removal.
- **Offline-First Storage**: Built on **Dexie.js** (IndexedDB) so data is never lost without a network connection.
- **Observation History**: View past observations sorted newest-first with formatted dates, coordinates, and photos.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Local Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (version **18.x** or higher recommended)
- `npm` (bundled with Node.js)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/veenaav/Vasudha_App.git
   cd Vasudha_App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the app**  
   Open your browser and navigate to:  
   👉 **`http://localhost:5173/`**

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server with Hot Module Replacement (HMR). |
| `npm run build` | Runs TypeScript type checking (`tsc`) and builds the production bundle into `dist/`. |
| `npm run lint` | Runs ESLint to verify code quality and style. |
| `npm run preview` | Serves the production build locally to test performance and assets. |

---

## 📁 Project Structure

```text
Vasudha_App/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI primitives (buttons, etc.)
│   │   ├── Header.tsx      # Application header
│   │   └── ObservationCard.tsx # Observation card with status pills & photos
│   ├── db/
│   │   └── database.ts     # Dexie.js IndexedDB schema and models
│   ├── pages/
│   │   └── Home.tsx        # Main observation form & history dashboard
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global Tailwind CSS styles
├── package.json            # Scripts and dependencies
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation
```

---

## 🔒 Privacy & Permissions

- **Location**: Vasudha requests browser geolocation access only when you tap **"Get My Location"**.
- **Camera/Files**: Vasudha accesses the camera or photo gallery only when you tap **"Take Photo"** or **"Upload from Gallery"**.
- **Data**: All observations remain stored locally on your device browser storage until exported or synced.
