# 🌿 Vasudha (വസുധ)

> **Biodiversity Field Data Collection App**  
> A mobile-first, offline-ready progressive web application developed for biodiversity surveys, ecological monitoring, and field researchers to capture species observations, multi-angle photos, and GPS coordinates—even in remote forest reserves without internet connectivity.

---

## 📖 Project Overview

**Vasudha** is an intuitive field data collection platform designed for conservationists, botanists, zoologists, and citizen scientists. Conducting biodiversity surveys in remote or protected areas often means operating with zero network coverage. Vasudha solves this by offering an offline-first architecture powered by client-side browser storage (IndexedDB).

### Key Highlights
- **Offline-First Resilience**: All field records, attached photos, and metadata are persisted locally using **Dexie.js** (IndexedDB wrapper). Never lose findings in zero-connectivity areas.
- **Darwin Core (DwC) Standards Support**: Built-in support for Darwin Core-aligned biodiversity data export and sharing.
- **Interactive Geospatial Mapping**: Integrated Leaflet and Mapbox maps with pinpoint coordinate picking, high-accuracy device geolocation, and accuracy radius tracking.
- **Multi-Media Documentation**: Capture live field photos or upload from device gallery with tag-based classification and preview cards.
- **Project & Ward/Survey Management**: Organize observations by projects, wards, and dedicated surveys.
- **Mobile-Responsive App Experience**: Includes splash screens, bottom navigation drawer, account management, profile badges, and responsive layouts tailored for mobile field devices.

---

## ✨ Features

- 🌿 **Species & Specimen Observation**:
  - Record Common Names, Scientific Names, Life Stage, Sex, and detailed field notes.
  - Tag selector for quick categorization (flora, fauna, habit, threats, phenology).
- 🧭 **Location & Geolocation**:
  - Instant device GPS coordinate retrieval with accuracy rating (± meters).
  - Interactive map picker ([Leaflet](https://leafletjs.com/) + [Mapbox](https://www.mapbox.com/)) with drag-and-drop pin positioning.
- 📸 **Rich Media Capture**:
  - Direct camera capture on mobile and tablet devices.
  - Multi-photo gallery uploads with preview carousel and instant delete controls.
  - Identification status tagging: *Identified*, *Unknown*, or *Needs Verification*.
- 📂 **Projects & Surveys**:
  - Manage multiple conservation projects and localized ward surveys.
  - Associate observations directly with ongoing field studies.
- 💾 **Data Export & Sync**:
  - Darwin Core compatible JSON/CSV export for integration with research repositories (e.g., GBIF / local databases).
  - Offline sync status dashboard.
- 👤 **User Profiles & Roles**:
  - Local researcher profile management with customizable avatars and researcher credentials.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build & Tooling** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), Base UI, Lucide React icons |
| **Local Database** | [Dexie.js](https://dexie.org/) (IndexedDB) |
| **Mapping & Geospatial** | [Leaflet](https://leafletjs.com/), Mapbox Outdoors / OpenStreetMap tiles |

---

## 🚀 Local Setup & Installation

Follow the steps below to set up and run Vasudha on your local development machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version **18.x** or higher, LTS recommended)
- `npm` (comes bundled with Node.js) or `pnpm` / `yarn`
- Modern web browser (Chrome, Edge, Firefox, or Safari) with IndexedDB and Geolocation API support

### 1. Clone the Repository

```bash
git clone https://github.com/veenaav/Vasudha_App.git
cd Vasudha_App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Vasudha comes with an optional Mapbox integration for high-definition topographic and outdoor tiles.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. (Optional) Open `.env` and configure your Mapbox public token:
   ```env
   # Mapbox Public Access Token (Get one at https://account.mapbox.com/)
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```
   > **Note**: If `VITE_MAPBOX_TOKEN` is omitted, the app will gracefully fall back to free standard OpenStreetMap tiles.

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Access the Application

Once the development server starts, navigate to:
```
http://localhost:5173
```
You can view the mobile view by opening Developer Tools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`) and toggling the device toolbar (`Ctrl+Shift+M` / `Cmd+Shift+M`).

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev** | `npm run dev` | Runs the Vite development server with Hot Module Replacement (HMR). |
| **Build** | `npm run build` | Validates TypeScript types (`tsc -b`) and builds the optimized production assets in `dist/`. |
| **Lint** | `npm run lint` | Runs ESLint across the codebase to check code quality and rules. |
| **Preview** | `npm run preview` | Runs a local web server to preview the built `dist/` production files. |

---

## 📁 Directory Structure

```text
Vasudha_App/
├── public/                 # Static public assets (icons, brand marks, fallback images)
├── src/
│   ├── components/         # Reusable presentation components
│   │   ├── layout/         # TopBar, BottomNav, NavigationDrawer, AppLayout
│   │   ├── ui/             # Generic atomic UI elements (Button, Select, Dialogs)
│   │   ├── LocationPickerMap.tsx # Leaflet & Mapbox location picker
│   │   └── ObservationCard.tsx   # Observation display card
│   ├── context/            # React Context providers (ProfileContext)
│   ├── db/                 # Dexie.js database schemas, migrations, and tables
│   ├── features/           # Feature-based business logic & custom hooks
│   │   ├── observations/   # Observation creation, hooks, and validation
│   │   ├── profile/        # Researcher profile management
│   │   └── projects/       # Projects and surveys tracking
│   ├── lib/                # Utility helpers, Darwin Core export, tag catalogs
│   ├── pages/              # Routed page components
│   │   ├── SplashScreen.tsx
│   │   ├── WelcomePage.tsx
│   │   ├── HomePage.tsx
│   │   ├── ObservationFormPage.tsx
│   │   ├── ObservationsPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   └── OfflineSyncPage.tsx
│   ├── App.tsx             # Application route configurations
│   ├── main.tsx            # Main React DOM mounting entry point
│   └── index.css           # Global Tailwind CSS and style imports
├── .env.example            # Sample environment variables template
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🔒 Permissions & Security

- **Geolocation**: Vasudha requests browser location permissions only when using the GPS locate button or map picker.
- **Camera & Storage**: Access to the camera or file gallery is only invoked upon explicit user tap.
- **Privacy First**: Observations and media remain saved locally inside your browser's IndexedDB and are never shared or uploaded without user confirmation.
