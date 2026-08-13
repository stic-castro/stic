Great question — this is where most people mess up:
👉 they dump everything into one prompt and the AI produces messy code.

You want to **guide the AI like a senior dev would guide a junior**.

---

# 🧠 🧭 Strategy: Prompt in Phases (VERY IMPORTANT)

👉 Don’t ask for everything at once
👉 Build your system step by step

---

# 🏗️ Recommended Prompt Order

## 🟢 Phase 1 — Project Setup (Foundation)

👉 First prompt:

Create a Next.js project using TypeScript with the App Router. Set up a clean and scalable folder structure using a feature-based architecture. Include folders for app routes, features, server (controllers, services, repositories), lib, and config. Do not add business logic yet, only the structure and initial configuration.

---

## 🟢 Phase 2 — Core Architecture (Backend + Frontend base)

Implement a clean layered architecture for the backend inside Next.js API routes, including controllers, services, and repositories. Create an example module for "trabajos" (jobs) with a POST endpoint that follows this structure. Keep the code modular and scalable.

---

## 🟢 Phase 3 — Database Integration

Integrate a PostgreSQL database (or Supabase) into the project. Create models and repository logic for the following entities: mecanicos, trabajos, and registros. Ensure proper separation between database access and business logic.

---

## 🟢 Phase 4 — Frontend Feature Module

Create a frontend feature module for "trabajos" using a feature-based structure. Include components, hooks, and services. Implement a simple UI to create and list jobs, connecting to the existing API.

---

## 🟢 Phase 5 — PWA Setup

Convert the Next.js application into a Progressive Web App (PWA). Add manifest.json, configure next-pwa, and ensure the app is installable on mobile devices. Include basic offline support.

---

## 🟢 Phase 6 — Multilanguage (i18n)

Add internationalization support using next-intl. Configure language-based routing (e.g., /es and /en) and create translation files. Refactor the existing UI to use translation keys instead of hardcoded text.

---

## 🟢 Phase 7 — Theming (Colors System)

Implement a centralized theming system using CSS variables and Tailwind CSS. Use the following color palette:

* Primary: #f97316
* Primary hover: #ea580c
* Secondary: #1f2937
* Background: #f9fafb
* Success: #22c55e
* Warning: #f59e0b
* Error: #ef4444

Support dark mode using:

* Background: #0f172a
* Secondary: #111827
* Primary: #fb923c

Ensure all components use these variables instead of hardcoded colors.

---

## 🟢 Phase 8 — UX Optimization (Important for your case)

Optimize the UI for mobile-first usage, focusing on fast interactions. Use large buttons, minimal steps, and clear feedback for actions such as creating and updating jobs. Ensure the interface works efficiently in a workshop environment.

---

## 🟢 Phase 9 — Advanced Features (Later)

Extend the system with role-based access (admin and mechanic), activity history tracking, and improved validation. Keep the architecture clean and consistent with existing patterns.

---

# ⚠️ Golden Rules (CRITICAL)

## ❌ Don’t do this:

* Ask for everything in one prompt
* Mix UI + backend + DB in one instruction
* Skip architecture step

---

## ✅ Do this:

* Build step by step
* Review after each phase
* Refactor when needed

---

# 🧠 Pro Tip (this changes everything)

After each step, ask:

👉 *“Refactor this code to follow best practices and improve maintainability”*

---

# 🚀 Ideal Workflow

```txt
1. Generate
2. Review
3. Fix
4. Continue
```

---

# 🟢 Final Insight

👉 Think of the AI as:

* a junior developer
* very fast
* but needs direction

👉 Your job:

* define structure
* enforce order
* control complexity

---

# 🔥 If you want next

I can:
👉 turn this into a **Cursor / Windsurf optimized workflow**
👉 or give you a **single master prompt that orchestrates all phases automatically**
