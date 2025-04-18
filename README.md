# SleepTracker – IoT Wearable Health Monitoring

SleepTracker is an system that combines an ESP32-S3–based wearable with a modern web dashboard to monitor biometric data such as heart rate, SpO2, and respiratory rate in real-time. It’s designed for lightweight, power-efficient overnight tracking and insightful visualization via a Next.js web interface.

---

## Features

- **ESP32-S3 Wearable** – Tracks HR and SpO₂, designed for low-power continuous monitoring
- **Wi-Fi** – Sends data directly to the local server
- **GenAI Insights** - Uses OpenAI's API to receive tailored insights and tips for users
- **REST + Realtime Dashboard** – Live graphing and summaries via Next.js + Chart.js
- **MongoDB Integration** – Stores historical data for long-term trends
- **User Authentication** – NextAuth with email/password login
- **Modern Stack** – Built with Next.js 13+, TailwindCSS, Chart.js, and MongoDB

---

## Tech Stack

| Component      | Technology                      |
|----------------|----------------------------------|
| Wearable       | ESP32-S3, Arduino Framework      |
| Data Transport | HTTP POST                |
| Backend/API    | Next.js (App Router), MongoDB    |
| Auth           | NextAuth.js (Credentials Provider) |
| Frontend       | React, TailwindCSS, Chart.js     |

---

