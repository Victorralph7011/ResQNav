<div align="center">

# 🚨 ResQNav

### *AI-Driven Dynamic Routing for Smart Cities*

> **Clear paths for emergency vehicles. Reroute commuters. Save lives.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-5-396CB2?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)

---

</div>

## 🔥 The Problem

Every year, **12.4 billion hours** are lost to urban traffic congestion. When an emergency strikes, ambulances and fire trucks are trapped in the same gridlock as commuters — costing lives that could have been saved with just **8 seconds** of cleared road.

## ✅ The Solution

**ResQNav** is a full-stack, AI-powered ecosystem that:

- **Detects incidents** via a Gemini-powered chatbot with image & GPS verification
- **Clears priority corridors** by dynamically overriding traffic signals
- **Reroutes commuters** in real-time around active emergency zones using OSRM routing
- **Provides a live radar** map showing active incidents, corridors, and city-wide routing

---

## 🎯 Core Features

| Feature | Description |
|---|---|
| 🤖 **AI Incident Chatbot** | Gemini-powered chat engine — report incidents with geotagged images, live GPS, and voice. Verified in under 3 seconds. |
| 🗺️ **Dynamic Priority Maps** | Dark-mode MapLibre GL maps with real-time green corridor overrides and OSRM-based turn-by-turn navigation. |
| 🚦 **Signal Override System** | Simulated IoT traffic signal control — priority green waves for emergency vehicles along computed corridors. |
| 📡 **Live Radar Dashboard** | City-wide incident monitoring with pulsing markers, corridor status badges, and real-time ETA overlays. |
| 🌦️ **Environment Data Fusion** | Live weather, AQI, wind speed, and crowd density integrated into routing decisions — recalculated every 8 seconds. |
| 🔐 **Role-Based Auth** | Firebase Authentication with separate flows for **Commuters** and **Emergency Responders**. Google OAuth supported. |
| 🎨 **Cinematic UI** | Scroll-driven parallax particles, Framer Motion reveals, glassmorphic cards, and a custom cursor — all on a premium dark theme. |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component architecture & UI rendering |
| **Vite 8** | Lightning-fast dev server & HMR |
| **Tailwind CSS 4** | Utility-first styling with dark-mode aesthetic |
| **Framer Motion 12** | Scroll-driven animations, parallax effects, page transitions |
| **MapLibre GL** | Open-source vector map rendering (dark mode via CSS invert) |
| **React Router 7** | Client-side routing with protected routes |
| **Lucide React** | Modern icon library |
| **React Markdown** | Rendering AI chatbot responses with GFM support |

### Backend
| Technology | Purpose |
|---|---|
| **Express 5** | REST API server |
| **Firebase Admin SDK** | Server-side auth verification & Firestore access |
| **Google Generative AI** | Gemini API for incident verification & chat intelligence |
| **Multer** | Multipart file upload handling (incident images) |
| **Axios** | HTTP client for external API calls |

### APIs & Services
| Service | Purpose |
|---|---|
| **Firebase Auth** | User authentication (email/password + Google OAuth) |
| **Firebase Firestore** | Real-time database for chats, incidents, and user data |
| **OpenWeather API** | Live weather and air quality data |
| **OSRM** | Open Source Routing Machine for turn-by-turn directions |
| **OpenFreeMap** | Free vector tile server for MapLibre styling |

---

## 📁 Project Architecture

```
ResQNav/
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   └── images/                  # Static assets (city-grid, showcase images)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx        # Authentication modal overlay
│   │   │   ├── ChatbotModal.jsx     # Floating chatbot demo modal
│   │   │   ├── CustomCursor.jsx     # Interactive custom cursor
│   │   │   ├── Footer.jsx           # Site footer
│   │   │   ├── Navbar.jsx           # Global navigation bar
│   │   │   ├── ParticleBackground.jsx # Scroll-driven parallax particles
│   │   │   └── ProtectedRoute.jsx   # Auth-guarded route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Firebase auth state provider
│   │   ├── firebase/                # Firebase client config
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page (hero, map sequence, showcase)
│   │   │   ├── Navigation.jsx       # Live navigation with OSRM routing
│   │   │   ├── ChatApp.jsx          # Full AI chatbot interface
│   │   │   ├── LiveRadar.jsx        # City-wide incident radar
│   │   │   ├── Emergency.jsx        # Emergency responder dashboard
│   │   │   ├── Features.jsx         # Feature showcase page
│   │   │   ├── Product.jsx          # Product overview page
│   │   │   ├── HowItWorks.jsx       # How it works explainer
│   │   │   ├── TechStack.jsx        # Technology stack page
│   │   │   ├── CommuterAuth.jsx     # Commuter sign-in/sign-up
│   │   │   ├── ExtremityAuth.jsx    # Responder sign-in/sign-up
│   │   │   ├── MapDemo.jsx          # Interactive map demo
│   │   │   └── ChatbotDemo.jsx      # Chatbot demo page
│   │   ├── App.jsx                  # Root component & router
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles & animations
│   ├── .env                         # Client environment variables
│   └── package.json
│
├── server/                          # Express Backend
│   ├── config/                      # Firebase Admin & API configs
│   ├── controllers/
│   │   └── chatController.js        # Gemini AI chat logic
│   ├── middleware/                   # Auth & validation middleware
│   ├── routes/
│   │   ├── alertRoutes.js           # Emergency alert endpoints
│   │   ├── chatRoutes.js            # AI chat endpoints
│   │   ├── incidentRoutes.js        # Incident CRUD & verification
│   │   └── weatherRoutes.js         # Weather & AQI data proxy
│   ├── server.js                    # Express app entry point
│   ├── .env                         # Server environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A [Firebase project](https://console.firebase.google.com/) with Auth & Firestore enabled
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- An [OpenWeather](https://openweathermap.org/api) API key

### 1. Clone the Repository

```bash
git clone https://github.com/Victorralph7011/ResQNav.git
cd ResQNav
```

### 2. Set Up Environment Variables

Create `.env` files in both `client/` and `server/` directories:

**`client/.env`**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**`server/.env`**
```env
# Server Port
PORT=5000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key_here"

# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_api_key

# Google Maps (server-side)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 4. Run the Application

Open **two terminals** and run:

```bash
# Terminal 1 — Frontend (Vite dev server)
cd client
npm run dev
```

```bash
# Terminal 2 — Backend (Express server)
cd server
node server.js
```

The client will be available at **`http://localhost:5173`** and the API server at **`http://localhost:5000`**.

---

## 🖼️ Screenshots

<div align="center">

| Landing Page | Live Navigation |
|---|---|
| Cinematic hero with parallax particles & scroll-driven reveals | Dark-mode MapLibre with OSRM turn-by-turn routing |

| AI Chatbot | Live Radar |
|---|---|
| Gemini-powered incident verification with image upload | City-wide incident monitoring with real-time markers |

</div>

---

## 🔮 Future Scope

- 🏥 **Hospital & Ambulance Fleet Integration** — Real-time ambulance tracking with nearest-hospital routing and bed availability checks via government health APIs.
- 📱 **Mobile App (React Native)** — Cross-platform mobile client with push notifications for commuter rerouting alerts and responder dispatch.
- 🧠 **Predictive Congestion Modeling** — ML-based traffic prediction using historical data to pre-clear corridors before incidents escalate.

---

## 👥 Contributors

<a href="https://github.com/Victorralph7011">
  <img src="https://github.com/Victorralph7011.png" width="60" style="border-radius: 50%;" alt="Victorralph7011"/>
</a>

---

<div align="center">

**Built with 🖤 for cities that never stop moving.**

</div>
