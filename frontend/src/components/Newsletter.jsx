import React, { useState } from 'react'
import './Newsletter.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section className="newsletter" id="plan">
      <div className="newsletter__bg" aria-hidden="true" />
      <div className="container newsletter__inner">
        <div className="newsletter__text">
          <p className="newsletter__eyebrow">🇬🇭 Stay Connected</p>
          <h2 className="newsletter__title">
            Plan Your Perfect<br />Ghana Adventure
          </h2>
          <p className="newsletter__sub">
            Get event alerts, new site listings, travel tips and exclusive Ghana
            travel guides delivered straight to your inbox.&nbsp;
            <a href="/" className="newsletter__privacy">Privacy Policy.</a>
          </p>
        </div>

        {submitted ? (
          <div className="newsletter__success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Akwaaba! You're on the list.
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

