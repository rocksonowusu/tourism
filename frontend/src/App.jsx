import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './admin/styles/admin.css'

// Public site components
import Header         from './components/Header'
import Hero           from './components/Hero'
import Features       from './components/Features'
import Destinations   from './components/Destinations'
import EventsSection  from './components/EventsSection'
import Stories        from './components/Stories'
import Newsletter     from './components/Newsletter'
import Footer         from './components/Footer'

// Detail pages
import EventDetail from './pages/EventDetail'
import SiteDetail  from './pages/SiteDetail'
import AllEvents   from './pages/AllEvents'
import AllSites    from './pages/AllSites'

// Admin
import { AuthProvider } from './admin/context/AuthContext'
import { ToastProvider } from './admin/context/ToastContext'
import DashboardLayout from './admin/components/layout/DashboardLayout'
import Login      from './admin/pages/Login'
import Dashboard  from './admin/pages/Dashboard'
import Events     from './admin/pages/Events'
import Sites      from './admin/pages/Sites'
import Media      from './admin/pages/Media'

import apiClient from './api/client'

// ── Public site page ─────────────────────────────────────────────────────

function PublicSite() {
  const [destinations, setDestinations] = useState([])
  const [events, setEvents] = useState([])
  const [heroMedia, setHeroMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    fetchDestinations()
    fetchEvents()
    fetchHeroMedia()
  }, [])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.sites.list({ page_size: 8 })
      setDestinations(data?.results ?? data ?? [])
    } catch {
      setDestinations([])
    } finally {
      setLoading(false)
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
      // Gather all site media + event media for the hero background
      const [siteRes, evRes] = await Promise.allSettled([
        apiClient.siteMedia.list({ page_size: 50 }),
        apiClient.eventMedia.list({ page_size: 50 }),
      ])
      const siteItems  = (siteRes.value?.results  ?? siteRes.value  ?? [])
      const eventItems = (evRes.value?.results    ?? evRes.value    ?? [])
      const combined   = [...siteItems, ...eventItems]
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
      <EventsSection events={events} loading={eventsLoading} />
      <Destinations destinations={destinations} loading={loading} />
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

          {/* Detail pages */}
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/sites/:slug"  element={<SiteDetail />} />

          {/* Listing pages */}
          <Route path="/events" element={<AllEvents />} />
          <Route path="/sites"  element={<AllSites />} />

          {/* Admin — standalone login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin — protected layout */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<Events />} />
            <Route path="sites"  element={<Sites />} />
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

