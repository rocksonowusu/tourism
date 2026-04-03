import React, { useState, useEffect, useRef } from 'react'
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
const IconChevDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeAll = () => { setMenuOpen(false); setDropdownOpen(false) }

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
          <Link to="/tours"  className="header__link" onClick={closeAll}>Tours</Link>
          <Link to="/events" className="header__link" onClick={closeAll}>Events</Link>

          <Link to="/community" className="header__link" onClick={closeAll}>Community</Link>
          <Link to="/reviews"   className="header__link" onClick={closeAll}>Reviews</Link>

          {/* Other Services dropdown */}
          <div
            className={`header__dropdown ${dropdownOpen ? 'header__dropdown--open' : ''}`}
            ref={dropdownRef}
          >
            <button
              className="header__link header__dropdown-trigger"
              onClick={() => setDropdownOpen(o => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              Other Services <IconChevDown />
            </button>
            <div className="header__dropdown-menu">
              <Link to="/accommodations" className="header__dropdown-item" onClick={closeAll}>
                Accommodations
              </Link>
              <Link to="/car-rentals" className="header__dropdown-item" onClick={closeAll}>
                Car Rentals
              </Link>
            </div>
          </div>

          
          <a href="/#contact"  className="header__link" onClick={closeAll}>Contact</a>
        </nav>

        {/* Right actions */}
        <div className="header__actions">
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
