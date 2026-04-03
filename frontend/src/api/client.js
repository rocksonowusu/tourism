/**
 * Tourism Admin API Client
 * ─────────────────────────────────────────────────────────────────────────
 * Handles all communication with the Django backend including:
 *   - JWT Bearer token injection on every authenticated request
 *   - Automatic token refresh on 401 responses (single-flight)
 *   - Token storage in localStorage
 *   - Full tourism domain endpoints (events, sites, media, auth)
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT ?? 30_000)

// ── Token helpers ────────────────────────────────────────────────────────

const TOKEN_KEY   = 'tourism_access'
const REFRESH_KEY = 'tourism_refresh'

export const tokenStore = {
  getAccess:      ()      => localStorage.getItem(TOKEN_KEY),
  getRefresh:     ()      => localStorage.getItem(REFRESH_KEY),
  set:            (a, r)  => { localStorage.setItem(TOKEN_KEY, a); localStorage.setItem(REFRESH_KEY, r) },
  clearAccess:    ()      => localStorage.removeItem(TOKEN_KEY),
  clear:          ()      => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY) },
  hasTokens:      ()      => !!localStorage.getItem(TOKEN_KEY),
}

// ── APIError ─────────────────────────────────────────────────────────────

export class APIError extends Error {
  constructor(status, message, data = null) {
    super(message)
    this.status = status
    this.data   = data
    this.name   = 'APIError'
  }
}

// ── Core client ──────────────────────────────────────────────────────────

class TourismAPIClient {
  #refreshing = null  // in-flight refresh promise (prevent duplicate calls)

  // ── Low-level fetch ──────────────────────────────────────────────────

  async #fetch(endpoint, options = {}, retry = true) {
    const url        = `${BASE_URL}${endpoint}`
    const isFormData = options.body instanceof FormData

    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    }

    const access = tokenStore.getAccess()
    if (access) headers['Authorization'] = `Bearer ${access}`

    const ctrl   = new AbortController()
    const tid    = setTimeout(() => ctrl.abort(), TIMEOUT)

    let response
    try {
      response = await fetch(url, { ...options, headers, signal: ctrl.signal })
    } finally {
      clearTimeout(tid)
    }

    // ── 401 → try refresh once ──────────────────────────────────────────
    if (response.status === 401 && retry) {
      const refreshed = await this.#tryRefresh()
      if (refreshed) return this.#fetch(endpoint, options, false)
      tokenStore.clear()
      window.dispatchEvent(new CustomEvent('auth:expired'))
      throw new APIError(401, 'Session expired. Please log in again.')
    }

    // ── Parse body ──────────────────────────────────────────────────────
    let data = null
    const ct = response.headers.get('content-type') ?? ''
    if (ct.includes('application/json') && response.status !== 204) {
      data = await response.json()
    }

    if (!response.ok) {
      const msg = data?.detail ?? data?.message ?? `HTTP ${response.status}`
      throw new APIError(response.status, msg, data)
    }

    return data
  }

  async #tryRefresh() {
    if (this.#refreshing) return this.#refreshing

    const refresh = tokenStore.getRefresh()
    if (!refresh) return false

    this.#refreshing = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refresh }),
        })
        if (!res.ok) return false
        const data = await res.json()
        tokenStore.set(data.access, data.refresh ?? refresh)
        return true
      } catch {
        return false
      } finally {
        this.#refreshing = null
      }
    })()

    return this.#refreshing
  }

  // ── HTTP helpers ─────────────────────────────────────────────────────

  get(endpoint, params) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.#fetch(url, { method: 'GET' })
  }

  post(endpoint, data) {
    return this.#fetch(endpoint, {
      method: 'POST',
      body:   data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  patch(endpoint, data) {
    return this.#fetch(endpoint, {
      method: 'PATCH',
      body:   data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  put(endpoint, data) {
    return this.#fetch(endpoint, {
      method: 'PUT',
      body:   data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.#fetch(endpoint, { method: 'DELETE' })
  }

  // ── Auth endpoints ───────────────────────────────────────────────────

  auth = {
    login: (username, password) =>
      this.post('/api/auth/login/', { username, password }),

    logout: (refresh) =>
      this.post('/api/auth/logout/', { refresh }),

    refresh: (refresh) =>
      this.post('/api/auth/refresh/', { refresh }),

    me: () =>
      this.get('/api/auth/me/'),

    updateMe: (data) =>
      this.put('/api/auth/me/', data),

    register: (data) =>
      this.post('/api/auth/register/', data),

    users: () =>
      this.get('/api/auth/users/'),
  }

  // ── Events endpoints ─────────────────────────────────────────────────

  events = {
    list:     (params)     => this.get('/api/events/', params),
    detail:   (id)         => this.get(`/api/events/${id}/`),
    create:   (data)       => this.post('/api/events/', data),
    update:   (id, data)   => this.patch(`/api/events/${id}/`, data),
    delete:   (id)         => this.delete(`/api/events/${id}/`),
    bySlug:   (slug)       => this.get(`/api/events/by-slug/${slug}/`),
    featured: (params)     => this.get('/api/events/featured/', params),
    upcoming: (params)     => this.get('/api/events/upcoming/', params),
    past:     (params)     => this.get('/api/events/past/', params),
    media:    (id)         => this.get(`/api/events/${id}/media/`),
    upload:   (id, form)   => this.post(`/api/events/${id}/upload/`, form),
  }

  // ── Tourist sites endpoints ──────────────────────────────────────────

  sites = {
    list:     (params)     => this.get('/api/sites/', params),
    detail:   (id)         => this.get(`/api/sites/${id}/`),
    create:   (data)       => this.post('/api/sites/', data),
    update:   (id, data)   => this.patch(`/api/sites/${id}/`, data),
    delete:   (id)         => this.delete(`/api/sites/${id}/`),
    bySlug:   (slug)       => this.get(`/api/sites/by-slug/${slug}/`),
    featured: (params)     => this.get('/api/sites/featured/', params),
    events:   (id, params) => this.get(`/api/sites/${id}/events/`, params),
    media:    (id)         => this.get(`/api/sites/${id}/media/`),
    upload:   (id, form)   => this.post(`/api/sites/${id}/upload/`, form),
  }

  // ── Media endpoints ──────────────────────────────────────────────────

  eventMedia = {
    list:   (params)   => this.get('/api/event-media/', params),
    delete: (id)       => this.delete(`/api/event-media/${id}/`),
    update: (id, data) => this.patch(`/api/event-media/${id}/`, data),
  }

  siteMedia = {
    list:   (params)   => this.get('/api/site-media/', params),
    delete: (id)       => this.delete(`/api/site-media/${id}/`),
    update: (id, data) => this.patch(`/api/site-media/${id}/`, data),
  }

  // ── Tours endpoints ──────────────────────────────────────────────────

  tours = {
    list:     (params)     => this.get('/api/tours/', params),
    detail:   (id)         => this.get(`/api/tours/${id}/`),
    create:   (data)       => this.post('/api/tours/', data),
    update:   (id, data)   => this.patch(`/api/tours/${id}/`, data),
    delete:   (id)         => this.delete(`/api/tours/${id}/`),
    bySlug:   (slug)       => this.get(`/api/tours/by-slug/${slug}/`),
    featured: (params)     => this.get('/api/tours/featured/', params),
    media:    (id)         => this.get(`/api/tours/${id}/media/`),
    upload:   (id, form)   => this.post(`/api/tours/${id}/upload/`, form),
  }

  tourMedia = {
    list:   (params)   => this.get('/api/tour-media/', params),
    delete: (id)       => this.delete(`/api/tour-media/${id}/`),
    update: (id, data) => this.patch(`/api/tour-media/${id}/`, data),
  }

  // ── Trip Requests endpoints ──────────────────────────────────────────

  tripRequests = {
    submit:   (data)       => this.post('/api/trip-requests/', data),
    list:     (params)     => this.get('/api/trip-requests/', params),
    detail:   (id)         => this.get(`/api/trip-requests/${id}/`),
    update:   (id, data)   => this.patch(`/api/trip-requests/${id}/`, data),
    delete:   (id)         => this.delete(`/api/trip-requests/${id}/`),
    newCount: ()           => this.get('/api/trip-requests/new-count/'),
  }

  // ── Custom Tour Requests endpoints ───────────────────────────────────

  customTourRequests = {
    submit:         (data)   => this.post('/api/custom-tour-requests/', data),
    list:           (params) => this.get('/api/custom-tour-requests/', params),
    detail:         (id)     => this.get(`/api/custom-tour-requests/${id}/`),
    update:         (id, data) => this.patch(`/api/custom-tour-requests/${id}/`, data),
    delete:         (id)     => this.delete(`/api/custom-tour-requests/${id}/`),
    newCount:       ()       => this.get('/api/custom-tour-requests/new-count/'),
    packageOptions: ()       => this.get('/api/custom-tour-requests/package-options/'),
  }

  // ── Event Requests endpoints ─────────────────────────────────────────

  eventRequests = {
    submit:           (data)     => this.post('/api/event-requests/', data),
    list:             (params)   => this.get('/api/event-requests/', params),
    detail:           (id)       => this.get(`/api/event-requests/${id}/`),
    update:           (id, data) => this.patch(`/api/event-requests/${id}/`, data),
    delete:           (id)       => this.delete(`/api/event-requests/${id}/`),
    newCount:         ()         => this.get('/api/event-requests/new-count/'),
    eventTypeOptions: ()         => this.get('/api/event-requests/event-type-options/'),
  }

  // ── Event Bookings endpoints ─────────────────────────────────────────

  eventBookings = {
    submit:   (data)     => this.post('/api/event-bookings/', data),
    list:     (params)   => this.get('/api/event-bookings/', params),
    detail:   (id)       => this.get(`/api/event-bookings/${id}/`),
    update:   (id, data) => this.patch(`/api/event-bookings/${id}/`, data),
    delete:   (id)       => this.delete(`/api/event-bookings/${id}/`),
    newCount: ()         => this.get('/api/event-bookings/new-count/'),
  }

  // ── Apartments endpoints ─────────────────────────────────────────────

  apartments = {
    list:     (params)     => this.get('/api/apartments/', params),
    detail:   (id)         => this.get(`/api/apartments/${id}/`),
    create:   (data)       => this.post('/api/apartments/', data),
    update:   (id, data)   => this.patch(`/api/apartments/${id}/`, data),
    delete:   (id)         => this.delete(`/api/apartments/${id}/`),
    bySlug:   (slug)       => this.get(`/api/apartments/by-slug/${slug}/`),
    featured: (params)     => this.get('/api/apartments/featured/', params),
    media:    (id)         => this.get(`/api/apartments/${id}/media/`),
    upload:   (id, form)   => this.post(`/api/apartments/${id}/upload/`, form),
  }

  apartmentMedia = {
    list:   (params)   => this.get('/api/apartment-media/', params),
    delete: (id)       => this.delete(`/api/apartment-media/${id}/`),
    update: (id, data) => this.patch(`/api/apartment-media/${id}/`, data),
  }

  // ── Accommodation Requests endpoints ─────────────────────────────────

  accommodationRequests = {
    submit:   (data)       => this.post('/api/accommodation-requests/', data),
    list:     (params)     => this.get('/api/accommodation-requests/', params),
    detail:   (id)         => this.get(`/api/accommodation-requests/${id}/`),
    update:   (id, data)   => this.patch(`/api/accommodation-requests/${id}/`, data),
    delete:   (id)         => this.delete(`/api/accommodation-requests/${id}/`),
    newCount: ()           => this.get('/api/accommodation-requests/new-count/'),
  }

  // ── Vehicles endpoints ───────────────────────────────────────────────

  vehicles = {
    list:     (params)     => this.get('/api/vehicles/', params),
    detail:   (id)         => this.get(`/api/vehicles/${id}/`),
    create:   (data)       => this.post('/api/vehicles/', data),
    update:   (id, data)   => this.patch(`/api/vehicles/${id}/`, data),
    delete:   (id)         => this.delete(`/api/vehicles/${id}/`),
    bySlug:   (slug)       => this.get(`/api/vehicles/by-slug/${slug}/`),
    featured: (params)     => this.get('/api/vehicles/featured/', params),
    media:    (id)         => this.get(`/api/vehicles/${id}/media/`),
    upload:   (id, form)   => this.post(`/api/vehicles/${id}/upload/`, form),
  }

  vehicleMedia = {
    list:   (params)   => this.get('/api/vehicle-media/', params),
    delete: (id)       => this.delete(`/api/vehicle-media/${id}/`),
    update: (id, data) => this.patch(`/api/vehicle-media/${id}/`, data),
  }

  // ── Car Rental Requests endpoints ────────────────────────────────────

  carRentalRequests = {
    submit:   (data)       => this.post('/api/car-rental-requests/', data),
    list:     (params)     => this.get('/api/car-rental-requests/', params),
    detail:   (id)         => this.get(`/api/car-rental-requests/${id}/`),
    update:   (id, data)   => this.patch(`/api/car-rental-requests/${id}/`, data),
    delete:   (id)         => this.delete(`/api/car-rental-requests/${id}/`),
    newCount: ()           => this.get('/api/car-rental-requests/new-count/'),
  }

  // ── Health ───────────────────────────────────────────────────────────

  health = () => this.get('/health/')
}

export default new TourismAPIClient()
