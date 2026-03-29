# 🇬🇭 Ghana Tourism Portal

> A full-stack tourism platform showcasing Ghana's iconic tourist destinations and cultural events. Built with **Django REST Framework** + **React 18 / Vite**, featuring a glass-morphism admin dashboard and a polished public-facing website — fully responsive from mobile to desktop.

![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=black)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [Seeding Data](#-seeding-data)
- [Testing](#-testing)
- [Deployment](#-deployment)
  - [Backend (Render)](#backend-render)
  - [Frontend (Vercel)](#frontend-vercel)
- [Design System](#-design-system)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

Ghana Tourism Portal is a modern web application designed to promote and manage Ghana's rich cultural heritage and tourist attractions. The platform serves two audiences:

1. **Public visitors** — Browse 34+ tourist sites across all regions of Ghana, view upcoming cultural events, explore photo galleries, and discover travel stories.
2. **Administrators** — Manage sites, events, and media through a sleek glass-morphism admin dashboard with full CRUD operations, media uploads to Cloudinary, and JWT-secured access.

---

## 🌐 Live Demo

| Layer    | URL                                                |
| -------- | -------------------------------------------------- |
| Frontend | [tourism-xyz.vercel.app](https://tourism-xyz.vercel.app) |
| Backend  | [tourism-j3nz.onrender.com](https://tourism-j3nz.onrender.com) |

> **Note:** The Render free tier may cold-start in ~30 seconds on first request.

---

## ✨ Features

### Public Website

| Feature | Description |
|---------|-------------|
| **Hero Section** | Full-viewport hero with auto-cycling background images sourced from all uploaded media, animated stats counters, and scroll-dots navigation |
| **Destinations** | Filterable card grid of 34+ Ghana tourist sites with tab-based region filtering, image-cycling cards with dot indicators, and smooth entrance animations |
| **Events Section** | Editorial layout with a featured event spotlight and a compact list of upcoming events, with countdown timers and status badges |
| **Stories** | Curated travel stories in a glass-morphism card layout |
| **Newsletter** | Email subscription section with a glassmorphic form |
| **Event Detail** | Dedicated event page with hero banner, info bar (date, price, status, location), photo gallery with lightbox navigation, linked site card, sidebar with quick facts and related events |
| **Site Detail** | Dedicated site page with hero image cycler, about section, photo gallery with lightbox, events at this site grid, sidebar with facts and share button |
| **Scroll Reveal** | `IntersectionObserver`-based reveal animations with staggered children |
| **Responsive** | Optimized for phones (≤480px), tablets (≤768px), and desktops with fluid breakpoints |

### Admin Dashboard

| Feature | Description |
|---------|-------------|
| **Glass-Morphism UI** | Dark glass cards over an elephant photography background with gold accent palette |
| **Dashboard Home** | Stat cards (total events, sites, media, upcoming events), recent events table, featured sites grid, quick-action shortcuts, recent media strip with thumbnails |
| **Events CRUD** | Full create/edit/delete with modal forms, search, filter by status/site, sortable table, pagination |
| **Sites CRUD** | Full create/edit/delete, search, filter by featured status, region-based location filter |
| **Media Library** | Grid/list toggle view, filter by type (image/video) and parent, upload modal with drag-and-drop file zone, delete with confirmation |
| **Mobile Sidebar** | Hamburger-toggled slide-over drawer with overlay backdrop on screens ≤768px |
| **Toast Notifications** | Stacked, auto-dismissing success/error/info toasts |
| **JWT Auth** | Login with token rotation, automatic refresh on 401, session-expiry event broadcasting |

### Backend API

| Feature | Description |
|---------|-------------|
| **RESTful ViewSets** | Full CRUD for Events, Sites, EventMedia, and SiteMedia via DRF `ModelViewSet` |
| **Custom Actions** | `/featured`, `/upcoming`, `/past`, `/by-slug/{slug}`, `/{id}/media`, `/{id}/upload`, `/{id}/events` |
| **Filtering** | `django-filter` integration: date ranges, price ranges, featured flag, location search, media type |
| **Search & Ordering** | Full-text search across title/description/location; ordering by date, price, name, created_at |
| **Pagination** | `PageNumberPagination` with configurable `?page_size=N` (max 100) |
| **Cloudinary Storage** | All media uploads stored in Cloudinary with auto-detected media type, file-type validation, and 50MB size limit |
| **JWT Authentication** | `SimpleJWT` with access/refresh token pair, token rotation, blacklisting, and custom claims |
| **Admin Panel** | Django admin with inline media previews, thumbnails, date hierarchy, and bulk actions |
| **Data Seeding** | Management command to populate 34 real Ghana tourist sites |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.12+** | Runtime |
| **Django 6.0** | Web framework |
| **Django REST Framework 3.17** | API layer |
| **SimpleJWT 5.5** | Token-based authentication |
| **django-filter 25.2** | Querystring filtering |
| **django-cors-headers 4.9** | Cross-origin resource sharing |
| **Cloudinary + django-cloudinary-storage** | Cloud media hosting |
| **Pillow 12.1** | Image processing |
| **Gunicorn 25.3** | Production WSGI server |
| **SQLite** | Database (dev) |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.2** | UI library |
| **Vite 5** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client (available, but custom `fetch`-based client used) |
| **CSS Modules** | Admin component styling (scoped) |
| **Plain CSS** | Public component styling (BEM-like naming) |
| **Inter** | Primary typeface (Google Fonts) |

### Infrastructure
| Service | Role |
|---------|------|
| **Render** | Backend hosting (Web Service) |
| **Vercel** | Frontend hosting (Static Site) |
| **Cloudinary** | Media CDN & storage |
| **GitHub** | Source control |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────────┐  │
│  │   Public Site        │    │   Admin Dashboard          │  │
│  │   (React SPA)        │    │   (React SPA)              │  │
│  │                      │    │                            │  │
│  │  /                   │    │  /admin/login               │  │
│  │  /events/:slug       │    │  /admin        (Dashboard)  │  │
│  │  /sites/:slug        │    │  /admin/events              │  │
│  │                      │    │  /admin/sites               │  │
│  │                      │    │  /admin/media               │  │
│  └──────────┬───────────┘    └─────────────┬──────────────┘  │
│             │                              │                 │
│             └──────────┬───────────────────┘                 │
│                        │  API calls (fetch)                  │
│                        │  Authorization: Bearer <JWT>        │
└────────────────────────┼─────────────────────────────────────┘
                         │
                    ┌────▼─────┐
                    │  Vercel  │  (SPA hosting + rewrites)
                    └────┬─────┘
                         │  HTTPS
                    ┌────▼─────────────────────────────┐
                    │        Django API (Render)        │
                    │                                   │
                    │  /api/events/    (EventViewSet)   │
                    │  /api/sites/     (SiteViewSet)    │
                    │  /api/event-media/                │
                    │  /api/site-media/                 │
                    │  /api/auth/login|logout|me|...    │
                    │  /health/                         │
                    │                                   │
                    │  ┌───────────┐  ┌──────────────┐  │
                    │  │  SQLite   │  │  Cloudinary   │  │
                    │  │ (Database)│  │ (Media CDN)   │  │
                    │  └───────────┘  └──────────────┘  │
                    └──────────────────────────────────┘
```

### Request Flow

1. **Development:** Vite dev server (port 3000) proxies `/api/*` requests to Django (port 8000)
2. **Production:** React reads `VITE_API_URL` env var and calls the Render backend directly; Vercel serves the SPA with a catch-all rewrite for client-side routing

### Authentication Flow

```
Login → POST /api/auth/login/ → { access, refresh, user }
  ↓
Store tokens in localStorage
  ↓
Every API call → Authorization: Bearer <access>
  ↓
On 401 → Auto-refresh via POST /api/auth/refresh/
  ↓
If refresh fails → Dispatch 'auth:expired' event → Redirect to login
  ↓
Logout → POST /api/auth/logout/ (blacklists refresh) → Clear tokens
```

---

## 📁 Project Structure

```
tourism/
├── README.md
├── .gitignore
│
├── backend/                          # Django project
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                          # Backend env vars (not in git)
│   ├── db.sqlite3                    # SQLite database
│   │
│   ├── tourism_backend/              # Django project config
│   │   ├── settings.py               # All settings (DB, CORS, JWT, Cloudinary, DRF)
│   │   ├── urls.py                   # Root URL config (auth + app routes)
│   │   ├── auth_views.py             # Login, Logout, Me, Register, UserList views
│   │   ├── pagination.py             # StandardPagination (page_size=10, max=100)
│   │   ├── wsgi.py / asgi.py         # Server entry points
│   │   └── __init__.py
│   │
│   ├── tourism_events/               # Main app
│   │   ├── models.py                 # TouristSite, Event, EventMedia, TouristSiteMedia
│   │   ├── views.py                  # 4 ViewSets with custom actions
│   │   ├── serializers.py            # Full + List serializers for each model
│   │   ├── filters.py                # EventFilter, TouristSiteFilter, MediaFilters
│   │   ├── validators.py             # File type/size validation (50MB, images+videos)
│   │   ├── urls.py                   # DRF router registration
│   │   ├── admin.py                  # Django admin with inline media previews
│   │   ├── management/commands/
│   │   │   └── seed_sites.py         # Seed 34 Ghana tourist sites
│   │   └── tests/
│   │       ├── helpers.py            # Factories & base test case
│   │       ├── test_auth.py          # Auth endpoint tests
│   │       ├── test_events.py        # Event CRUD tests
│   │       ├── test_filters.py       # Filter/search/ordering tests
│   │       └── test_media.py         # Media upload/validation tests
│   │
│   └── app_health_check/             # Health check endpoint (/health/)
│       └── views.py
│
└── frontend/                          # React + Vite project
    ├── package.json
    ├── vite.config.js                 # Dev proxy config
    ├── vercel.json                    # Vercel SPA rewrites
    ├── index.html                     # Viewport meta, entry point
    ├── .env.development               # VITE_API_URL= (empty, uses proxy)
    ├── .env.production                # VITE_API_URL=https://tourism-j3nz.onrender.com
    ├── .env.example                   # Template for env vars
    │
    └── src/
        ├── main.jsx                   # React DOM render
        ├── App.jsx                    # Router, public site, admin routes
        ├── App.css                    # App-level styles
        ├── index.css                  # Global CSS (tokens, container, buttons, scrollbar)
        │
        ├── api/
        │   └── client.js              # TourismAPIClient — fetch-based, JWT auto-refresh
        │
        ├── hooks/
        │   └── useScrollReveal.js     # IntersectionObserver scroll animation hook
        │
        ├── utils/
        │   └── helpers.js             # formatDate, truncateText, formatCurrency, debounce
        │
        ├── components/                # Public site components
        │   ├── Header.jsx / .css      # Sticky glass header with mobile burger nav
        │   ├── Hero.jsx / .css        # Full-viewport hero with media cycler
        │   ├── Destinations.jsx / .css # Filterable site card grid with tab filter
        │   ├── EventsSection.jsx / .css # Featured + list layout
        │   ├── Stories.jsx / .css     # Travel stories grid
        │   ├── Newsletter.jsx / .css  # Email subscription form
        │   └── Footer.jsx / .css      # Multi-column footer
        │
        ├── pages/                     # Public detail pages
        │   ├── EventDetail.jsx / .css # Full event page with lightbox gallery
        │   └── SiteDetail.jsx / .css  # Full site page with image cycler
        │
        └── admin/                     # Admin dashboard
            ├── styles/
            │   ├── tokens.css         # Design tokens (colors, spacing, radii, shadows)
            │   └── admin.css          # Admin base styles + Inter font import
            │
            ├── context/
            │   ├── AuthContext.jsx     # JWT auth state, login/logout, session restore
            │   └── ToastContext.jsx    # Toast notification state
            │
            ├── components/
            │   ├── layout/
            │   │   ├── DashboardLayout.jsx / .module.css  # Shell with sidebar toggle
            │   │   ├── Sidebar.jsx / .module.css          # Nav drawer (mobile slide-over)
            │   │   └── TopBar.jsx / .module.css           # Page title, user info, hamburger
            │   │
            │   └── ui/
            │       ├── Badge.jsx / .module.css
            │       ├── Button.jsx / .module.css
            │       ├── EmptyState.jsx / .module.css
            │       ├── Modal.jsx / .module.css
            │       ├── Spinner.jsx / .module.css
            │       ├── StatCard.jsx / .module.css
            │       └── Toast.jsx / .module.css
            │
            └── pages/
                ├── Login.jsx / .module.css       # Login page (Ghana flag SVG)
                ├── Dashboard.jsx / .module.css   # Stats, recent events, quick actions
                ├── Events.jsx / .module.css      # Events table + CRUD modals
                ├── Sites.jsx / .module.css       # Sites table + CRUD modals
                └── Media.jsx / .module.css       # Media gallery + upload modal
```

---

## 📊 Data Models

### Entity Relationship

```
┌──────────────────┐         ┌──────────────────┐
│   TouristSite    │         │      Event       │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │    ┌───►│ id (PK)          │
│ name             │    │    │ title            │
│ slug (unique)    │    │    │ slug (unique)    │
│ description      │    │    │ description      │
│ location         │    │    │ location         │
│ is_featured      │    │    │ date             │
│ created_at       │    │    │ price            │
│ updated_at       │    │    │ is_featured      │
│                  │    │    │ tourist_site (FK)─┼───┐
└──────┬───────────┘    │    │ created_at       │   │
       │                │    │ updated_at       │   │
       │ 1:N            │    └──────┬───────────┘   │
       │                │           │                │ N:1
       ▼                │           │ 1:N            │
┌──────────────────┐    │           ▼                │
│ TouristSiteMedia │    │    ┌──────────────────┐    │
├──────────────────┤    │    │   EventMedia     │    │
│ id (PK)          │    │    ├──────────────────┤    │
│ tourist_site (FK)┼────┘    │ id (PK)          │    │
│ file (Cloudinary)│         │ event (FK)───────┼────┘
│ media_type       │         │ file (Cloudinary)│
│ caption          │         │ media_type       │
│ created_at       │         │ caption          │
└──────────────────┘         │ created_at       │
                             └──────────────────┘
```

### Model Details

| Model | Key Fields | Notes |
|-------|-----------|-------|
| **TouristSite** | `name`, `slug`, `description`, `location`, `is_featured` | Slug auto-generated from name, unique enforced. Properties: `media_count`, `upcoming_events_count` |
| **Event** | `title`, `slug`, `description`, `location`, `date`, `price`, `is_featured`, `tourist_site` (FK) | Custom managers: `Event.upcoming.all()`, `Event.past.all()`. Properties: `is_past`, `is_upcoming`, `media_count` |
| **EventMedia** | `event` (FK), `file` (CloudinaryField), `media_type`, `caption` | Stored in `tourism/events/`. Type auto-detected on save. Validated: image/video types only, ≤50MB |
| **TouristSiteMedia** | `tourist_site` (FK), `file` (CloudinaryField), `media_type`, `caption` | Stored in `tourism/tourist_sites/`. Same validation as EventMedia |

### Supported Media Types

| Images | Videos |
|--------|--------|
| JPEG, PNG, WebP, GIF, BMP, TIFF | MP4, MOV, AVI, MPEG, WebM, OGG, 3GP, MKV |

---

## 📡 API Reference

### Base URL
- **Development:** `http://localhost:8000/api/`
- **Production:** `https://tourism-j3nz.onrender.com/api/`

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login/` | Public | Login with username/password → `{ access, refresh, user }` |
| `POST` | `/api/auth/refresh/` | Public | Exchange refresh token for new access token |
| `POST` | `/api/auth/logout/` | Bearer | Blacklist refresh token |
| `GET` | `/api/auth/me/` | Bearer | Current user profile |
| `PUT` | `/api/auth/me/` | Bearer | Update email, first/last name |
| `POST` | `/api/auth/register/` | Admin | Create new user (admin-only) |
| `GET` | `/api/auth/users/` | Admin | List all users (admin-only) |

### Events Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/events/` | Public | Paginated list (lightweight serializer) |
| `GET` | `/api/events/{id}/` | Public | Full detail with nested media |
| `POST` | `/api/events/` | Bearer | Create event |
| `PATCH` | `/api/events/{id}/` | Bearer | Partial update |
| `DELETE` | `/api/events/{id}/` | Bearer | Delete event |
| `GET` | `/api/events/featured/` | Public | Featured events only |
| `GET` | `/api/events/upcoming/` | Public | Future events (soonest first) |
| `GET` | `/api/events/past/` | Public | Past events (most recent first) |
| `GET` | `/api/events/by-slug/{slug}/` | Public | Retrieve by SEO slug |
| `GET` | `/api/events/{id}/media/` | Public | All media for one event |
| `POST` | `/api/events/{id}/upload/` | Bearer | Upload image/video files |

**Query Parameters:**
```
?search=        title, description, location (full-text)
?is_featured=   true | false
?date_after=    YYYY-MM-DD
?date_before=   YYYY-MM-DD
?date=          YYYY-MM-DD (exact day)
?price_min=     number
?price_max=     number
?tourist_site=  id (FK)
?ordering=      date | price | created_at (prefix - for desc)
?page=          page number
?page_size=     results per page (max 100)
```

### Tourist Sites Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/sites/` | Public | Paginated list |
| `GET` | `/api/sites/{id}/` | Public | Full detail with nested media |
| `POST` | `/api/sites/` | Bearer | Create site |
| `PATCH` | `/api/sites/{id}/` | Bearer | Partial update |
| `DELETE` | `/api/sites/{id}/` | Bearer | Delete site |
| `GET` | `/api/sites/featured/` | Public | Featured sites only |
| `GET` | `/api/sites/by-slug/{slug}/` | Public | Retrieve by SEO slug |
| `GET` | `/api/sites/{id}/media/` | Public | All media for one site |
| `GET` | `/api/sites/{id}/events/` | Public | All events at this site |
| `POST` | `/api/sites/{id}/upload/` | Bearer | Upload image/video files |

**Query Parameters:**
```
?search=        name, description, location
?is_featured=   true | false
?location=      case-insensitive contains match
?ordering=      name | created_at (prefix - for desc)
?page=          page number
?page_size=     results per page (max 100)
```

### Media Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/event-media/` | Public | List event media (`?event=3&media_type=image`) |
| `DELETE` | `/api/event-media/{id}/` | Bearer | Delete media record |
| `GET` | `/api/site-media/` | Public | List site media (`?tourist_site=3&media_type=video`) |
| `DELETE` | `/api/site-media/{id}/` | Bearer | Delete media record |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health/` | Returns health status |

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.12+
- **Node.js** 18+ & npm 9+
- **Cloudinary account** (free tier works) — [cloudinary.com](https://cloudinary.com)
- **Git**

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/rocksonowusu/tourism.git
cd tourism/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True

# Cloudinary credentials (from your Cloudinary dashboard)
CLOUD_NAME=your-cloud-name
API_KEY=your-api-key
API_SECRET=your-api-secret
EOF

# Run migrations
python manage.py migrate

# Create a superuser (admin account)
python manage.py createsuperuser

# Seed 34 Ghana tourist sites
python manage.py seed_sites

# Start the development server
python manage.py runserver
```

The API is now running at `http://localhost:8000/api/`.

### 2. Frontend Setup

```bash
# Open a new terminal
cd tourism/frontend

# Install dependencies
npm install

# The default .env.development already works for local dev:
# VITE_API_URL= (empty — Vite proxies /api to localhost:8000)

# Start the dev server
npm run dev
```

The app is now running at `http://localhost:3000`.

### Quick Login

Navigate to `http://localhost:3000/admin/login` and sign in with the superuser credentials you created above.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SECRET_KEY` | Yes | Django secret key for cryptographic signing |
| `DEBUG` | No | `True` for development (default), `False` for production |
| `CLOUD_NAME` | Yes | Cloudinary cloud name |
| `API_KEY` | Yes | Cloudinary API key |
| `API_SECRET` | Yes | Cloudinary API secret |
| `FRONTEND_URL` | No | Production frontend URL (e.g., `https://your-app.vercel.app`) for CORS |

### Frontend (`frontend/.env.development` / `.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API base URL. Leave empty in dev (Vite proxy handles it). Set to full URL in production. |
| `VITE_API_TIMEOUT` | No | API request timeout in ms (default: `30000`) |

---

## 🌱 Seeding Data

The project includes a management command that seeds 34 real tourist sites across all regions of Ghana:

```bash
cd backend

# Seed sites (skips existing ones by name)
python manage.py seed_sites

# Clear all existing sites first, then seed
python manage.py seed_sites --clear
```

**Seeded regions include:** Greater Accra, Central Region, Ashanti Region, Eastern Region, Volta Region, Western Region, Northern Region, Bono Region, and Upper East Region.

**Notable sites:** Cape Coast Castle, Elmina Castle, Kakum National Park, Lake Volta, Mole National Park, Wli Waterfalls, Larabanga Mosque, and more.

---

## 🧪 Testing

The backend includes a comprehensive test suite covering authentication, CRUD operations, filtering, and media uploads:

```bash
cd backend

# Run all tests
python manage.py test

# Run specific test modules
python manage.py test tourism_events.tests.test_auth
python manage.py test tourism_events.tests.test_events
python manage.py test tourism_events.tests.test_filters
python manage.py test tourism_events.tests.test_media

# Run with verbose output
python manage.py test -v 2
```

### Test Coverage

| Module | Coverage |
|--------|----------|
| `test_auth.py` | Login, token refresh, logout, /me profile, admin-only registration, user listing |
| `test_events.py` | CRUD, featured/upcoming/past filters, slug lookup, media attachment |
| `test_filters.py` | Date range, price range, featured, location, search, ordering |
| `test_media.py` | Upload validation, file type/size checks, Cloudinary integration |

---

## 🚢 Deployment

### Backend (Render)

1. **Create a Web Service** on [render.com](https://render.com)
2. **Connect your GitHub repo** → set root directory to `backend`
3. **Configure:**
   - **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command:** `gunicorn tourism_backend.wsgi:application`
4. **Set Environment Variables:**
   ```
   DJANGO_SECRET_KEY=<strong-random-key>
   DEBUG=False
   CLOUD_NAME=<your-cloudinary-cloud-name>
   API_KEY=<your-cloudinary-api-key>
   API_SECRET=<your-cloudinary-api-secret>
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Frontend (Vercel)

1. **Import project** on [vercel.com](https://vercel.com)
2. **Set root directory** to `frontend`
3. **Framework Preset:** Vite
4. **Set Environment Variable:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. The included `vercel.json` handles SPA routing rewrites automatically:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### CORS Configuration

The backend automatically allows:
- `localhost:3000` and `127.0.0.1:3000` (development)
- Any `*.vercel.app` domain (regex match)
- The `FRONTEND_URL` environment variable value

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--gold-rich` | `#C5A028` | Primary accent, CTA buttons, highlights |
| `--gold-soft` | `#D4AF37` | Borders, focus rings |
| `--gold-warm` | `#E5B83C` | Active nav items, badges |
| `--gold-antique` | `#B8860B` | Hover states |
| `--gold-pale` | `#FBF3D5` | Light backgrounds, badge fills |
| `--ash-deep` | `#2C2C2C` | Primary text (public site) |
| `--ash-medium` | `#6B6B6B` | Secondary text, captions |
| `--white-off` | `#F9F7F2` | Page backgrounds |

### Typography

- **Font Family:** Inter (Google Fonts), system fallbacks
- **Scale:** 11px (`--text-xs`) → 30px (`--text-3xl`)
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700–800 (titles)

### Glass Morphism

| Context | Background | Blur |
|---------|-----------|------|
| **Admin cards** | `rgba(10, 8, 2, 0.45)` | `blur(16px) saturate(1.3)` |
| **Admin sidebar** | `rgba(18, 14, 6, 0.55)` | `blur(20px) saturate(1.4)` |
| **Public cards** | `rgba(255, 255, 255, 0.75)` | `blur(10px) saturate(1.2)` |
| **Public header** | `rgba(255, 255, 255, 0.78)` | `blur(16px) saturate(1.3)` |

### Responsive Breakpoints

| Width | Target |
|-------|--------|
| `≤ 480px` | Small phones |
| `≤ 560px` | Large phones |
| `≤ 640px` | Phablets |
| `≤ 768px` | Tablets (admin sidebar collapses) |
| `≤ 900px` | Small laptops (detail page sidebar stacks) |
| `≤ 960px` | Tablets landscape |
| `≤ 1100px` | Laptops (grids reduce columns) |

---

## 📸 Screenshots

> Add screenshots of the public homepage, event detail page, admin dashboard, and mobile views here.

| Page | Description |
|------|-------------|
| Public Home | Hero + Destinations + Events + Stories |
| Event Detail | Hero banner + info bar + gallery + sidebar |
| Site Detail | Image cycler + about + events grid + sidebar |
| Admin Login | Ghana flag SVG with glass card |
| Admin Dashboard | Stat cards + recent events + quick actions |
| Admin Events | Searchable/filterable table with modal forms |
| Admin Media | Gallery grid with upload modal |
| Mobile Admin | Hamburger menu + slide-over drawer |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Code Conventions

- **Backend:** PEP 8, type hints where practical, docstrings on all views/serializers
- **Frontend (Admin):** CSS Modules (`.module.css`), component-per-file
- **Frontend (Public):** BEM-like CSS naming (`block__element--modifier`), component-per-file
- **Git:** Conventional commits preferred (`feat:`, `fix:`, `style:`, `docs:`)

---

## 📄 License

This project is for educational and portfolio purposes. All Ghana tourist site descriptions in the seed data are original content.

---

<p align="center">
  Built with ❤️ for 🇬🇭 Ghana
</p>
