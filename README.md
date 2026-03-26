# Tourism Platform

A full-stack tourism destination and events management platform. The backend is a RESTful API built with Django REST Framework, and the frontend is a React single-page application with an integrated admin dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Authentication](#authentication-endpoints)
  - [Tourist Sites](#tourist-sites-endpoints)
  - [Events](#events-endpoints)
  - [Media](#media-endpoints)
  - [Health Check](#health-check)
- [Database Models](#database-models)
- [Authentication Flow](#authentication-flow)
- [Admin Dashboard](#admin-dashboard)
- [Running Tests](#running-tests)
- [Deployment](#deployment)

---

## Overview

The Tourism Platform enables administrators to manage tourist destinations and events, upload rich media (images and videos), and expose all content through a public-facing website. Content editors use the built-in admin dashboard while visitors can browse featured destinations, upcoming events, and search or filter all available content.

---

## Features

- **Tourist Sites Management** – Create, update, and delete destination listings with descriptions, locations, and featured flags
- **Events Management** – Schedule and manage events tied to destinations with dates, pricing, and featured flags
- **Media Uploads** – Attach multiple images and videos to sites and events via Cloudinary CDN
- **Automatic Event Filtering** – Events are automatically classified as upcoming or past based on the current date
- **SEO-Friendly Slugs** – Auto-generated URL slugs for sites and events
- **Full-text Search** – Search across title/name, description, and location fields
- **Advanced Filtering & Ordering** – Filter by featured status, date range, price, media type, and more
- **Pagination** – Configurable page size (default 10 per page)
- **JWT Authentication** – Secure token-based auth with automatic token rotation and refresh
- **Admin Dashboard** – React-based admin panel for content management
- **Public Website** – Visitor-facing pages for browsing destinations and events
- **Health Check Endpoint** – Simple liveness probe for infrastructure monitoring

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.8+ | Runtime |
| Django | 6.0.3 | Web framework |
| Django REST Framework | 3.17.1 | API layer |
| SimpleJWT | 5.5.1 | JWT authentication |
| Cloudinary | latest | Media storage & CDN |
| django-cors-headers | 4.9.0 | CORS support |
| django-filter | 25.2 | Query filtering |
| Pillow | 12.1.1 | Image processing |
| python-dotenv | 1.2.2 | Environment variable loading |
| SQLite3 | built-in | Default database |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| Vite | 5.0.0 | Build tool & dev server |
| React Router | 7.13.2 | Client-side routing |
| Axios | 1.6.0 | HTTP client |
| ESLint | latest | Code linting |

---

## Project Structure

```
tourism/
├── backend/
│   ├── tourism_backend/        # Django project configuration
│   │   ├── settings.py         # Application settings
│   │   ├── urls.py             # Root URL configuration
│   │   ├── auth_views.py       # Authentication endpoints
│   │   └── pagination.py       # Custom pagination config
│   ├── tourism_events/         # Main Django application
│   │   ├── models.py           # TouristSite, Event, and Media models
│   │   ├── views.py            # API ViewSets
│   │   ├── serializers.py      # DRF serializers
│   │   ├── filters.py          # Custom filter backends
│   │   ├── validators.py       # Field validators
│   │   ├── urls.py             # App URL routing
│   │   ├── tests/              # Test suite
│   │   ├── migrations/         # Database migrations
│   │   └── management/         # Management commands (e.g. seed_sites)
│   ├── app_health_check/       # Health monitoring app
│   ├── manage.py               # Django CLI entry point
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/client.js       # Axios API client with token interceptors
│   │   ├── components/         # Shared UI components
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── pages/          # Dashboard, Events, Sites, Media, Login pages
│   │   │   ├── components/     # Admin-specific components
│   │   │   ├── context/        # Auth & Toast context providers
│   │   │   └── hooks/          # Admin custom hooks
│   │   ├── hooks/              # Shared custom hooks
│   │   ├── utils/              # Helper utilities
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Application entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example            # Environment variable template
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Python** 3.8 or higher
- **Node.js** 16 or higher and **npm**
- A [Cloudinary](https://cloudinary.com/) account (free tier is sufficient for development)

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create your environment file
cp ../.env.example .env
# Edit .env and fill in the required values (see Environment Variables)

# 5. Apply database migrations
python manage.py migrate

# 6. Create a superuser for the Django admin
python manage.py createsuperuser

# 7. (Optional) Seed the database with sample tourist sites
python manage.py seed_sites

# 8. Start the development server
python manage.py runserver
# API is now available at http://localhost:8000
```

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install JavaScript dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# 4. Start the development server
npm run dev
# App is now available at http://localhost:3000
```

The Vite dev server automatically proxies all `/api` requests to `http://localhost:8000`, so no additional CORS configuration is needed during local development.

---

## Environment Variables

### Backend (`.env` inside `backend/`)

| Variable | Required | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | Yes (production) | Django secret key – use a long random string |
| `DEBUG` | No | Enable debug mode (default: `True`) |
| `CLOUD_NAME` | Yes | Cloudinary cloud name |
| `API_KEY` | Yes | Cloudinary API key |
| `API_SECRET` | Yes | Cloudinary API secret |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend base URL (default: `http://localhost:8000`) |
| `VITE_API_TIMEOUT` | No | Request timeout in milliseconds (default: `30000`) |

---

## API Reference

All API responses are JSON. Authenticated endpoints require an `Authorization: Bearer <access_token>` header.

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login/` | Public | Log in with username and password, returns JWT tokens |
| `POST` | `/api/auth/refresh/` | Public | Exchange a refresh token for a new access token |
| `POST` | `/api/auth/logout/` | Public | Blacklist a refresh token |
| `GET` | `/api/auth/me/` | Required | Get the current user's profile |
| `PUT` | `/api/auth/me/` | Required | Update email, first name, or last name |
| `POST` | `/api/auth/register/` | Admin | Create a new API user |
| `GET` | `/api/auth/users/` | Admin | List all users |

**Login example:**
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "yourpassword"
}
```

```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "is_staff": true
  }
}
```

---

### Tourist Sites Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/sites/` | Public | List all sites (paginated) |
| `POST` | `/api/sites/` | Required | Create a new tourist site |
| `GET` | `/api/sites/{id}/` | Public | Retrieve a site with nested media |
| `PUT` | `/api/sites/{id}/` | Required | Full update |
| `PATCH` | `/api/sites/{id}/` | Required | Partial update |
| `DELETE` | `/api/sites/{id}/` | Required | Delete a site |
| `GET` | `/api/sites/featured/` | Public | Featured sites only |
| `GET` | `/api/sites/by-slug/{slug}/` | Public | Retrieve a site by its URL slug |
| `GET` | `/api/sites/{id}/media/` | Public | List all media for a site |
| `GET` | `/api/sites/{id}/events/` | Public | List all events for a site |
| `POST` | `/api/sites/{id}/upload/` | Required | Upload one or more images/videos to a site |

**Query Parameters (list endpoint):**
- `search` – full-text search across name, description, and location
- `location` – filter by location string
- `is_featured` – `true` or `false`
- `ordering` – field name to sort by (prefix with `-` for descending, e.g. `-created_at`)

---

### Events Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events/` | Public | List all events (paginated) |
| `POST` | `/api/events/` | Required | Create a new event |
| `GET` | `/api/events/{id}/` | Public | Retrieve an event with nested media |
| `PUT` | `/api/events/{id}/` | Required | Full update |
| `PATCH` | `/api/events/{id}/` | Required | Partial update |
| `DELETE` | `/api/events/{id}/` | Required | Delete an event |
| `GET` | `/api/events/featured/` | Public | Featured events only |
| `GET` | `/api/events/upcoming/` | Public | Future events ordered by date ascending |
| `GET` | `/api/events/past/` | Public | Past events ordered by date descending |
| `GET` | `/api/events/by-slug/{slug}/` | Public | Retrieve an event by its URL slug |
| `GET` | `/api/events/{id}/media/` | Public | List all media for an event |
| `POST` | `/api/events/{id}/upload/` | Required | Upload one or more images/videos to an event |

**Query Parameters (list endpoint):**
- `search` – full-text search across title, description, and location
- `is_featured` – `true` or `false`
- `date_after` – filter events on or after a date (ISO 8601)
- `date_before` – filter events on or before a date (ISO 8601)
- `price_min` / `price_max` – filter by price range
- `tourist_site` – filter by associated site ID
- `ordering` – e.g. `date`, `-date`, `price`, `-price`

---

### Media Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/event-media/` | Public | List event media |
| `GET` | `/api/event-media/{id}/` | Public | Retrieve event media detail |
| `POST` | `/api/event-media/` | Required | Create an event media record |
| `PATCH` | `/api/event-media/{id}/` | Required | Update media caption |
| `DELETE` | `/api/event-media/{id}/` | Required | Delete media |
| `GET` | `/api/site-media/` | Public | List site media |
| `GET` | `/api/site-media/{id}/` | Public | Retrieve site media detail |
| `POST` | `/api/site-media/` | Required | Create a site media record |
| `PATCH` | `/api/site-media/{id}/` | Required | Update media caption |
| `DELETE` | `/api/site-media/{id}/` | Required | Delete media |

**Query Parameters:**
- `event` / `tourist_site` – filter by parent resource ID
- `media_type` – `image` or `video`

---

### Health Check

```http
GET /health/
```

```json
{ "status": "ok" }
```

---

## Database Models

### TouristSite

| Field | Type | Notes |
|---|---|---|
| `id` | Auto integer | Primary key |
| `name` | CharField(255) | |
| `slug` | SlugField | Unique, auto-generated from name |
| `description` | TextField | |
| `location` | CharField(255) | |
| `is_featured` | BooleanField | Default: `False` |
| `created_at` | DateTimeField | Auto-set on create |
| `updated_at` | DateTimeField | Auto-set on update |

Computed properties: `media_count`, `upcoming_events_count`

### Event

| Field | Type | Notes |
|---|---|---|
| `id` | Auto integer | Primary key |
| `title` | CharField(255) | |
| `slug` | SlugField | Unique, auto-generated from title |
| `description` | TextField | |
| `location` | CharField(255) | |
| `date` | DateTimeField | Nullable |
| `price` | DecimalField(10, 2) | |
| `is_featured` | BooleanField | Default: `False` |
| `tourist_site` | ForeignKey(TouristSite) | Nullable |
| `created_at` | DateTimeField | Auto-set on create |
| `updated_at` | DateTimeField | Auto-set on update |

Custom managers: `objects` (all), `upcoming` (future events), `past` (past events)  
Computed properties: `is_past`, `is_upcoming`, `media_count`

### TouristSiteMedia / EventMedia

| Field | Type | Notes |
|---|---|---|
| `id` | Auto integer | Primary key |
| `file` | CloudinaryField | Stored under `tourism/tourist_sites/` or `tourism/events/` |
| `media_type` | CharField | `image` or `video`, auto-detected |
| `caption` | CharField(255) | Optional |
| `tourist_site` / `event` | ForeignKey | CASCADE delete |
| `created_at` | DateTimeField | Auto-set on create |

Computed properties: `file_url`, `is_image`, `is_video`

---

## Authentication Flow

The platform uses **JWT Bearer Token** authentication provided by SimpleJWT.

```
1. Client sends POST /api/auth/login/ with { username, password }
2. Server returns { access (1 day), refresh (30 days), user }
3. Client stores tokens (e.g. localStorage)
4. Client includes header on protected requests:
       Authorization: Bearer <access_token>
5. When access token expires (401 response), client sends:
       POST /api/auth/refresh/ with { refresh: <refresh_token> }
6. Server returns new access + rotated refresh token
7. Client retries original request with new access token
8. On logout, client sends POST /api/auth/logout/ with { refresh: <refresh_token> }
   Server blacklists the refresh token
```

The frontend Axios client handles steps 5–7 automatically via response interceptors.

---

## Admin Dashboard

The admin dashboard is accessible at `http://localhost:3000/admin/login`.

Sign in with the superuser credentials created during setup. The dashboard provides:

- **Dashboard** – Overview statistics (total sites, events, media)
- **Tourist Sites** – Create, edit, delete, and upload media to destinations
- **Events** – Schedule and manage events with full CRUD and media uploads
- **Media** – Browse, filter, and delete all uploaded images and videos

The Django admin interface (at `/admin/`) is also available for database-level management.

---

## Running Tests

```bash
# Navigate to the backend directory and activate your virtual environment
cd backend
source venv/bin/activate

# Run the full test suite
python manage.py test tourism_events.tests

# Run a specific test module
python manage.py test tourism_events.tests.test_models
```

---

## Deployment

### Backend

1. Set `DEBUG=False` and a strong `DJANGO_SECRET_KEY` in your environment.
2. Update `ALLOWED_HOSTS` in `settings.py` to include your production domain.
3. Update `CORS_ALLOWED_ORIGINS` in `settings.py` to include your production frontend URL.
4. Collect static files: `python manage.py collectstatic`
5. Serve with a production WSGI server such as **Gunicorn**:
   ```bash
   gunicorn tourism_backend.wsgi:application --bind 0.0.0.0:8000
   ```

### Frontend

```bash
cd frontend
npm run build
# Serve the contents of the dist/ directory with any static file host
# (Netlify, Vercel, Nginx, etc.)
```

Set `VITE_API_URL` to your production backend URL before building.
