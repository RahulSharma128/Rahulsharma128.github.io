# Rahul Sharma - Projects & Architecture Deep Dive

## 🚀 Key Projects Showcase

### 1. Drobe — AI Fashion Try-On Platform (Flagship / Founder Project)
- **Category**: AI / Full-Stack / Mobile / SaaS
- **Type**: Founder & Sole Engineer
- **Live**: [https://drobe.live](https://drobe.live)
- **Tech Stack**: Flutter (Riverpod), Go (chi router), Next.js (×2 — admin portal + consumer PWA), PostgreSQL, Redis, Google Gemini / Vertex AI, Razorpay, TOTP 2FA, PM2, git submodules
- **Overview**:
  - Architected and built an AI-powered virtual try-on platform end-to-end as sole founding engineer, targeting Gen-Z and young professionals in India.
  - Designed a zone-aware virtual try-on system across 12 garment categories — engineering two distinct generation paths: a single-call multi-garment endpoint and a sequential outfit-layering flow to balance output quality vs. per-call API cost.
  - Built a coin-wallet monetisation system with Razorpay integration: HMAC-verified webhook handling and idempotent order processing as the primary revenue mechanism ahead of affiliate commissions.
  - Implemented production-grade admin security: mandatory TOTP 2FA, role-scoped route authorisation enforced at both middleware and startup-time route audit, and an audit log for all mutating admin actions. Independently audited the portal and resolved 13 issues including a stored XSS vulnerability and multiple broken auth-header integrations.
  - Migrated a monorepo to a multi-repo architecture (4 independent services) using git filter-repo with zero history loss, managed via git submodules.
  - Maintained 18/18 passing backend integration tests across auth, payments, and AI generation flows on a self-hosted PM2 deployment (no PaaS).
  - Ran a compliance audit on AI-generated content and third-party image sourcing; redesigned the product image pipeline to eliminate legal exposure before launch.
  - Conducted a full database audit identifying data-integrity, indexing, and soft-delete cleanup issues across an 18-table PostgreSQL schema, and shipped constraint/trigger fixes.

---

### 2. PathSynq — Pothole & Road Jerk Detector PWA

- **Category**: Mobile Progressive Web App (PWA) / Internet of Things (IoT) / Geospatial Sensing
- **Type**: Personal Engineering Project
- **Live Demo**: [http://pathsynq.rahulsh.me/](http://pathsynq.rahulsh.me/)
- **Tech Stack**: JavaScript (ES6+), Mapbox GL JS, HTML5 Sensors (Accelerometer API, Gyroscope API, Geolocation API), PWA Service Workers
- **Overview**:
  - PathSynq turns smartphones into mobile road condition sensors.
  - Using real-time device movement sensors (accelerometer & gyroscope), it detects road anomalies (potholes, bumps, sudden jerks) while driving.
  - Automatically tags sensor spikes with high-precision GPS coordinates and renders color-coded heatmaps on Mapbox GL JS for urban road quality mapping.

---

### 3. Drone Fleet Monitoring Ground Control Station (GCS)
- **Category**: Real-Time Telemetry & Geolocation System
- **Company**: Emvirt Solutions
- **Tech Stack**: WebSockets, Azure 3D Maps API, Google Maps Geolocation, Canvas API, Node.js, Express.js
- **Overview**:
  - Built an enterprise ground control station interface for tracking autonomous drone fleets in real time.
  - Handled low-latency bi-directional WebSocket streaming for telemetry data (altitude, speed, battery, GPS coordinates, flight status).
  - Rendered 3D flight paths and waypoints using Azure 3D Maps and Google Maps APIs with dynamic trajectory calculations.

---

### 4. Partner & Admin Analytics Dashboards
- **Category**: Web Application / Admin Analytics / Data Visualization
- **Company**: Smartgenx / Volyo Solutions
- **Tech Stack**: Next.js (React), Material-UI (MUI), Chart.js, ApexCharts, REST APIs
- **Overview**:
  - Architected high-throughput partner and administrator dashboards for monitoring multi-tenant platform metrics.
  - Designed interactive charts (line, bar, donut) using Chart.js and ApexCharts for financial tracking, user activity, and conversion funnels.
  - Integrated server-side rendering (SSR) and client-side caching for fast loading speeds across desktop and mobile browsers.

---

### 5. Enterprise Progressive Web App (PWA) Platform
- **Category**: Mobile Web Application / Push Notifications
- **Company**: Smartgenx / Volyo Solutions
- **Tech Stack**: Progressive Web Apps (PWA), Firebase Cloud Messaging (FCM), Service Workers, Web App Manifest
- **Overview**:
  - Transformed web platforms into installable PWAs with offline caching capabilities.
  - Implemented real-time Web Push Notifications via Firebase Service Workers, boosting user re-engagement and retention by over 30%.
