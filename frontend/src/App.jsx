import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './admin/styles/admin.css'

// Public site components
import Header         from './components/Header'
import Hero           from './components/Hero'
import Features       from './components/Features'
import ToursSection   from './components/ToursSection'
import EventsSection  from './components/EventsSection'
import Stories        from './components/Stories'
import Newsletter     from './components/Newsletter'
import Footer         from './components/Footer'

// Detail pages
import EventDetail from './pages/EventDetail'
import SiteDetail  from './pages/SiteDetail'
import AllEvents   from './pages/AllEvents'
import AllSites    from './pages/AllSites'
import AllTours    from './pages/AllTours'
import TourDetail  from './pages/TourDetail'

// Admin
import { AuthProvider } from './admin/context/AuthContext'
import { ToastProvider } from './admin/context/ToastContext'
import DashboardLayout from './admin/components/layout/DashboardLayout'
import Login      from './admin/pages/Login'
import Dashboard  from './admin/pages/Dashboard'
import Events     from './admin/pages/Events'
import Sites      from './admin/pages/Sites'
import Media      from './admin/pages/Media'
import Tours      from './admin/pages/Tours'
import TripRequests from './admin/pages/TripRequests'

import PlanTour from './pages/PlanTour'

import apiClient from './api/client'

// ── Public site page ─────────────────────────────────────────────────────

function PublicSite() {
  const [tours, setTours] = useState([])
  const [events, setEvents] = useState([])
  const [heroMedia, setHeroMedia] = useState([])
  const [toursLoading, setToursLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    fetchTours()
    fetchEvents()
    fetchHeroMedia()
  }, [])

  const fetchTours = async () => {
    try {
      setToursLoading(true)
      const data = await apiClient.tours.featured({ page_size: 6 })
      const results = data?.results ?? data ?? []
      // If no featured tours, fallback to all active tours
      if (results.length === 0) {
        const allData = await apiClient.tours.list({ page_size: 6 })
        setTours(allData?.results ?? allData ?? [])
      } else {
        setTours(results)
      }
    } catch {
      setTours([])
    } finally {
      setToursLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      const data = await apiClient.events.list({ page_size: 8 })
      setEvents(data?.results ?? data ?? [])
    } catch {
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  const fetchHeroMedia = async () => {
    try {
      // Gather all media for the hero background
      const [siteRes, evRes, tourRes] = await Promise.allSettled([
        apiClient.siteMedia.list({ page_size: 50 }),
        apiClient.eventMedia.list({ page_size: 50 }),
        apiClient.tourMedia.list({ page_size: 50 }),
      ])
      const siteItems  = (siteRes.value?.results  ?? siteRes.value  ?? [])
      const eventItems = (evRes.value?.results    ?? evRes.value    ?? [])
      const tourItems  = (tourRes.value?.results  ?? tourRes.value  ?? [])
      const combined   = [...tourItems, ...siteItems, ...eventItems]
        .filter(m => m.file_url)
        .map(m => ({ url: m.file_url, type: m.media_type ?? 'image' }))
      setHeroMedia(combined)
    } catch {
      setHeroMedia([])
    }
  }

  return (
    <div className="app">
      <Header />
      <Hero media={heroMedia} />
      <Features />
      <ToursSection tours={tours} loading={toursLoading} />
      <EventsSection events={events} loading={eventsLoading} />
      <Stories />
      <Newsletter />
      <Footer />
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicSite />} />

          {/* Listing pages */}
          <Route path="/events" element={<AllEvents />} />
          <Route path="/sites"  element={<AllSites />} />
          <Route path="/tours"  element={<AllTours />} />

          {/* Detail pages */}
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/sites/:slug"  element={<SiteDetail />} />
          <Route path="/tours/:slug"  element={<TourDetail />} />
          <Route path="/plan-tour"    element={<PlanTour />} />

          {/* Admin — standalone login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin — protected layout */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="sites"  element={<Sites />} />
            <Route path="tours"  element={<Tours />} />
            <Route path="trip-requests" element={<TripRequests />} />
            <Route path="media"  element={<Media />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

