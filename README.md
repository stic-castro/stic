# 🚀 Fullstack Architecture (Next.js + PWA + Multitenant Ready)

## 🧠 Overview
Modern monolithic architecture using **Next.js (React + TypeScript)** with:
- Integrated backend (API routes)
- PWA support (installable app)
- Multilanguage (i18n)
- Customizable theming
- Scalable structure

---

# 🏗️ Architecture

## 🔷 High-Level Flow
```

Frontend (React UI)
↓
Hooks (logic)
↓
Services (API calls)
↓
API Routes (Next.js)
↓
Controllers
↓
Services (business logic)
↓
Repositories
↓
Database (PostgreSQL / Supabase)

```

---

# 📁 Project Structure

```

src/
├── app/                # Routes (Next.js App Router)
│   ├── api/            # API endpoints
│   └── [locale]/       # i18n routes
│
├── components/         # Reusable UI
│
├── features/           # Feature-based modules
│   └── trabajos/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
│
├── server/             # Backend logic
│   ├── controllers/
│   ├── services/
│   └── repositories/
│
├── domain/             # Business rules (optional clean layer)
│
├── lib/                # Utilities (db, auth, helpers)
│
├── messages/           # Translations (i18n)
│
├── config/             # Global configs

```

---

# ⚛️ Frontend Architecture

## Pattern: Feature-Based + Hooks

```

UI → Hooks → Services

```

- **UI (components):** visual layer
- **Hooks:** reusable logic
- **Services:** API communication

---

# 🔌 Backend Architecture

## Pattern: Layered Architecture

```

API Route → Controller → Service → Repository → DB

```

- **Controller:** handles HTTP
- **Service:** business logic
- **Repository:** DB access

---

# 📱 PWA (Progressive Web App)

## Features
- Installable on mobile
- Works like an app
- Offline support (limited)
- Runs on browser

## Setup
- `next-pwa`
- `manifest.json`
- Service Worker (auto)

## Notes
- Android: easy install
- iPhone: manual install via Safari

---

# 🌍 Multilanguage (i18n)

## Tool
- `next-intl`

## Structure
```

messages/
├── es.json
└── en.json

```

## Usage
```

t('trabajo.crear')

```

## Routing
```

/es/dashboard
/en/dashboard

```

---

# 🎨 Theming (Custom Colors)

## Pattern: Design System + CSS Variables

### globals.css
```

:root {
--color-primary: #f97316;
}

[data-theme='dark'] {
--color-primary: #22c55e;
}

```

### Tailwind config
```

colors: {
primary: 'var(--color-primary)'
}

```

---

## Dynamic Theme
- Use `next-themes`
- Change theme at runtime
- Store config in DB (optional)

---

# 🧩 Multitenant Ready (Optional)

Each client can have:
- Language
- Colors
- Logo

## Example Table
```

empresa_config

* primary_color
* secondary_color
* language

```

---

# 🗄️ Database (Suggested)

## Tables
```

mecanicos
trabajos
registros

```

---

# 📊 Vercel Free Limits (Important)

- ~1M API requests/month
- 100 GB transfer
- 4 hours CPU (serverless)

✅ Enough for small/medium apps

---

# 🧠 Patterns Used

- Layered Architecture
- Clean Architecture (adapted)
- Feature-Based Structure
- Repository Pattern
- Service Layer
- React Hooks Pattern

---

# ⚠️ Best Practices

✔ No business logic in components  
✔ No direct DB access from API routes  
✔ Use TypeScript everywhere  
✔ Centralize config (i18n, theme)  
✔ Keep features modular  

---

# 🚀 Final Stack

- Next.js (React + TypeScript)
- Vercel (deploy)
- Supabase (DB)
- next-intl (i18n)
- next-themes (theming)
- Tailwind CSS (UI)
- next-pwa (PWA)

---

# ✅ Result

- Web + Mobile (PWA)
- Multilanguage
- Custom branding
- Scalable architecture
- Production-ready