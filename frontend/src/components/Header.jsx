import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)
const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">

        {/* Logo */}
        <Link to="/" className="header__logo">
          <img src="/assets/Logo.PNG" alt="The Ghana Experience" className="header__logo-img" />
          <span>The Ghana Experience</span>
        </Link>

        {/* Nav — center */}
        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <Link to="/sites"  className="header__link" onClick={() => setMenuOpen(false)}>Destinations</Link>
          <Link to="/events" className="header__link" onClick={() => setMenuOpen(false)}>Events</Link>
          <a href="/#culture"      className="header__link" onClick={() => setMenuOpen(false)}>Culture</a>
          <a href="/#features"     className="header__link" onClick={() => setMenuOpen(false)}>Our Experiences</a>
          <a href="/#contact"      className="header__link" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>

        {/* Right actions */}
        <div className="header__actions">
          <button className="header__search-btn" aria-label="Search">
            <IconSearch />
          </button>
          <Link to="/admin/login" className="header__signin">Admin Login</Link>
          <button
            className="header__burger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  )
}
