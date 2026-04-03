import React, { useState, useEffect, useCallback } from 'react'
import './Newsletter.css'
import PaintStrokes from './PaintStrokes'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setShowModal(true)
  }

  const handleConfirm = () => {
    setShowModal(false)
    setSubmitted(true)
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  /* close modal on Escape key */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setShowModal(false)
  }, [])

  useEffect(() => {
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showModal, handleKeyDown])

  return (
    <section className="newsletter" id="plan">
      <PaintStrokes items={[
        { variant: 'a', position: 'tr', width: 340, opacity: 0.45 },
        { variant: 'b', position: 'bl', width: 300, opacity: 0.4 },
      ]} />
      <div className="newsletter__bg" aria-hidden="true" />
      <div className="container newsletter__inner">
        <div className="newsletter__text">
          <p className="newsletter__eyebrow">🇬🇭 Join the Experience</p>
          <h2 className="newsletter__title">
            Get Insider Access to<br />Ghana's Best Kept Secrets
          </h2>
          <p className="newsletter__sub">
            Be the first to know about new tours, exclusive festival
            invitations, travel tips, and curated Ghana experience guides —
            delivered straight to your inbox.&nbsp;
            <a href="/" className="newsletter__privacy">Privacy Policy.</a>
          </p>
        </div>

        {submitted ? (
          <div className="newsletter__success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Akwaaba! Welcome to The Ghana Experience family.
          </div>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter__input"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter__btn">Subscribe Free</button>
          </form>
        )}
      </div>

      {/* ── Consent Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="newsletter__modal-backdrop" onClick={handleCancel}>
          <div className="newsletter__modal" onClick={e => e.stopPropagation()}>
            <button className="newsletter__modal-close" onClick={handleCancel} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="newsletter__modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="22,4 12,13 2,4" />
              </svg>
            </div>

            <h3 className="newsletter__modal-title">Stay in the Loop 🇬🇭</h3>
            <p className="newsletter__modal-text">
              By subscribing, you agree to receive emails from
              <strong> 1957 The Ghana Experience</strong> about upcoming events,
              exclusive tours, travel tips, and curated guides. You can
              unsubscribe at any time.
            </p>

            <div className="newsletter__modal-actions">
              <button className="newsletter__modal-btn newsletter__modal-btn--cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="newsletter__modal-btn newsletter__modal-btn--confirm" onClick={handleConfirm}>
                Agree &amp; Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

