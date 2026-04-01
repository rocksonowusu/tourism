import React, { useState } from 'react'
import './Newsletter.css'
import PaintStrokes from './PaintStrokes'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

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
    </section>
  )
}

