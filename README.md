# MuFitness Tracker

<div align="center">
  <p>A premium, mobile-first, and highly-performant Progressive Web App (PWA) for tracking outdoor activities like running, walking, and biking.</p>
</div>

---

## ⚡ Project Overview

MuFitness is built to rival industry leaders like Strava, offering a sleek **Neon Dark Mode** aesthetic powered by deep glassmorphism. It uses real-time Geolocation APIs combined with local device caching and InsForge to provide a seamless tracking experience.

### Key Features
*   **Real-time Geolocation Tracking**: Immersive full-screen map experience.
*   **Live Metrics Dashboard**: Tracks Distance (Haversine formula), Duration, Speed/Pace, and calculated Calories burned based on MET values.
*   **Strava-Style UI Shelf**: High visibility layout optimized for outdoor use, boasting a minimalist display that pops with custom neon animations.
*   **Robust Signal Handling**: Smart GPS timeouts and drop-out buffers ensure your data isn't lost during temporary signal loss.
*   **Cloud Synchronization**: Instant and secure backend storage powered by the **InsForge** BaaS.
*   **PWA Ready**: Installable directly to your phone's home screen for a native app feel.

---

## 📸 Application Previews

### The Dashboard
A centralized hub showing a live map preview and lifetime statistics. Focus on the custom glass panes and context-aware messaging.

![MuFitness Dashboard Preview](./public/preview-dashboard.png)

### The Tracking Experience
An ergonomic, bottom-heavy design built for active use. Features large interaction targets and high-contrast metrics superimposed over a live tracking map.

![MuFitness Tracking Preview](./public/preview-tracking.png)

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 15 (React 19)
*   **Styling**: Tailwind CSS v4 (with custom `@theme` variables)
*   **Mapping**: Leaflet + React-Leaflet
*   **Backend & DB**: InsForge SDK
*   **Icons**: Lucide React
*   **Progressive Web App**: `next-pwa`

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally.

### 1. Prerequisites
Ensure you have Node.js installed and an active [InsForge](https://insforge.com) project setup.

### 2. Clone & Install
```bash
git clone <repository_url>
cd mufitnesstracker
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your InsForge credentials:
```env
NEXT_PUBLIC_INSFORGE_URL="your-project-url"
NEXT_PUBLIC_INSFORGE_ANON_KEY="your-anon-api-key"
```

### 4. Database Schema Requirements
You need an `activities` table in your InsForge database with the following columns:
*   `id` (uuid, primary key)
*   `user_id` (uuid, foreign key to auth.users)
*   `type` (text: 'walk', 'run', 'bike')
*   `distance` (numeric, in km)
*   `duration` (numeric, in seconds)
*   `calories` (numeric)
*   `gps_path` (jsonb array)
*   `date` (timestamp)

### 5. Run the Application
The `package.json` contains a specific workaround for Next.js 16 caching logic with the PWA setup:

```bash
npm run dev
```

*Note: Access the application on physical devices using your local network IP (e.g., `http://192.168.1.2:3000`) for true GPS testing. Next.js configurations have been specifically tailored to allow this origin.*

---

## 🗺️ Project Structure

*   **/src/app/page.tsx**: The authenticated dashboard summarizing user activity.
*   **/src/app/track/page.tsx**: The primary real-time Strava-style tracking interface.
*   **/src/hooks/use-tracking.ts**: The brain of the app; handles the `navigator.geolocation.watchPosition` lifecycle, Haversine math, and timeout fallbacks.
*   **/src/components/map.tsx**: A heavily optimized, dynamic Leaflet wrapper that avoids SSR hydration errors.
*   **/src/lib/calories.ts**: Utility for calculating active calorie burn based on duration and activity type.

---

> **Note on Local Testing**: Browsers restrict Geolocation APIs on insecure (HTTP) origins unless on `localhost`. To test fully on a mobile device, you may need to use a tunneling service (like Localtunel or Ngrok) to serve your local dev environment over HTTPS.
