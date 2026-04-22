# 🚀 Project Description Prompt

I want to build a modern web application for managing work progress in an automotive repair workshop. The system should be designed as a scalable monolithic application using Next.js with TypeScript, combining both frontend and backend within the same project.

## 🧠 Core Idea

The application will be used by mechanics to register, track, and update the progress of repair jobs throughout the day. The system must be simple, fast, and optimized for mobile usage, as mechanics will interact with it frequently (multiple times per hour) and finally the system will be used by the owner of the workshop to see the progress of the jobs and the mechanics and for calculate the price absed in the spent time considering 50 bs per hour.

## ⚙️ Technical Requirements

### 🏗️ Architecture

* Monolithic architecture using Next.js (App Router)
* Backend handled via API routes
* Layered backend structure:

  * Controllers
  * Services (business logic)
  * Repositories (data access)
* Feature-based frontend structure (modular and scalable)
* Strong use of TypeScript across the entire application

### 📱 Platform

* The application must be a Progressive Web App (PWA)
* Installable on mobile devices (Android and iOS)
* Responsive design for both mobile and desktop
* Optimized UX for quick data entry (large buttons, minimal steps)

### 🌍 Internationalization

* Multi-language support (at least Spanish and English)
* Language-based routing (e.g., `/es`, `/en`)
* Use of structured translation files (JSON-based)

### 🎨 Theming & Customization

* Centralized color system using CSS variables
* Ability to dynamically change theme (light/dark or custom branding)
* Support for future multi-tenant customization (each workshop can have its own branding, colors, and language)

### 🗄️ Data Management

* Use a relational database (PostgreSQL or similar)
* Core entities:

  * Mechanics
  * Jobs (trabajos)
  * Progress logs (registros)
* Clean separation between business logic and database access

### ☁️ Deployment

* Deploy using a free-tier platform (preferably Vercel)
* Must stay within free limits for small-to-medium usage
* Backend handled via serverless functions

---

## 🎯 Functional Requirements

* Mechanics can:

  * Create new jobs
  * Update job progress
  * Log hourly work updates
  * Change job status (pending, in progress, completed)

* The system should:

  * Store all activity history
  * Allow quick and repeated interactions
  * Be reliable and fast under normal usage

---

## 🔮 Future Considerations

* Multi-tenant support (multiple workshops using the same platform)
* Custom branding per client
* Analytics and reporting dashboards
* Role-based access (admin, mechanic)
* Optional mobile app wrapper (APK via Capacitor)

---

## 🧩 Goals

* Build a production-ready system using modern best practices
* Keep the architecture clean, scalable, and maintainable
* Ensure excellent mobile usability
* Minimize infrastructure costs by leveraging serverless and free-tier services

---

## 💡 Summary

This project is a fullstack, mobile-first, PWA-based workshop management system built with Next.js, designed for real-world usage, scalability, and ease of use, with future potential to evolve into a SaaS platform.

## 🎨 UI Design & Color System

The application must implement a consistent and user-friendly visual design system optimized for real-world workshop usage. The primary color should be orange (`#f97316`), used exclusively for main actions such as creating, updating, or saving records, providing high visibility and a sense of urgency for frequent interactions. A hover/active variation of the primary color (`#ea580c`) should be used for interactive states.

Secondary colors should include dark gray (`#1f2937`) for structural elements such as navigation, layouts, and containers, and a light neutral background (`#f9fafb`) to ensure readability and reduce eye strain. Standard semantic colors must be used to represent system states: green (`#22c55e`) for success or completed actions, yellow (`#f59e0b`) for in-progress or warning states, and red (`#ef4444`) for errors or critical issues.

The color system should be centralized using CSS variables to allow easy global customization and support future multi-tenant branding, where each workshop can define its own color palette without modifying the core codebase. The design must prioritize clarity, contrast, and speed of use over aesthetics, ensuring optimal usability in mobile and high-light environments.

Additionally, a dark mode variant should be supported, using a darker background (`#0f172a`), darker structural color (`#111827`), and a lighter orange tone (`#fb923c`) to maintain proper contrast and accessibility.
