import React from 'react'
import './Footer.css'
import PaintStrokes from './PaintStrokes'

const IconFB = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
)
const IconIG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const IconTW = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
)
const IconYT = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
)
const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.1 0 5 3.1 5 7c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5C10.6 9.5 9.5 8.4 9.5 7S10.6 4.5 12 4.5 14.5 5.6 14.5 7 13.4 9.5 12 9.5z"/></svg>
)

const COLS = [
  {
    heading: 'Our Experiences',
    links: ['Curated Tours', 'Cultural Immersion', 'Heritage Walks', 'Wildlife Safaris', 'Beach Getaways', 'Festival Packages'],
  },
  {
    heading: 'Destinations',
    links: ['Greater Accra', 'Ashanti Region', 'Central Region', 'Northern Region', 'Volta Region', 'Eastern Region'],
  },
  {
    heading: 'Plan Your Trip',
    links: ['Travel Guide', 'Best Time to Visit', 'Visa Information', 'Getting Around', 'Where to Stay', 'Safety Tips'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Our Story', 'Contact Us', 'Careers', 'Privacy Policy', 'Terms of Service'],
  },
]

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <PaintStrokes items={[
        { variant: 'b', position: 'tl', width: 300, opacity: 0.4 },
        { variant: 'a', position: 'br', width: 320, opacity: 0.45 },
      ]} />
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="/" className="footer__logo">
              <img src="/assets/Logo.PNG" alt="The Ghana Experience" className="footer__logo-img" />
              The Ghana Experience
            </a>
            <p className="footer__tagline">1957 The Ghana Experience LBG — Connecting the world to Ghana through curated tours, cultural immersions, and unforgettable heritage experiences across all 16 regions.</p>
            <div className="footer__social">
              <a href="/" className="footer__social-link" aria-label="Facebook"><IconFB /></a>
              <a href="/" className="footer__social-link" aria-label="Instagram"><IconIG /></a>
              <a href="/" className="footer__social-link" aria-label="Twitter"><IconTW /></a>
              <a href="/" className="footer__social-link" aria-label="YouTube"><IconYT /></a>
              <a href="/" className="footer__social-link" aria-label="Pinterest"><IconPin /></a>
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.heading} className="footer__col">
              <h4 className="footer__col-heading">{col.heading}</h4>
              <ul className="footer__col-list">
                {col.links.map(l => (
                  <li key={l}><a href="/" className="footer__col-link">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p>© 2026 1957 The Ghana Experience LBG. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="/">Privacy Policy</a>
            <span>·</span>
            <a href="/">Cookie Settings</a>
            <span>·</span>
            <a href="/admin/login">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
