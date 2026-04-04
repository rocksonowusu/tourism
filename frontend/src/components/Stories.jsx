import React, { useState, useEffect, useRef, useCallback } from 'react'
import './Stories.css'
import PaintStrokes from './PaintStrokes'

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const SLIDES = [
  {
    id: 1,
    category: 'History & Heritage',
    title: "Cape Coast Castle: Walking Through Ghana's Most Profound Historical Site",
    date: 'Mar 10, 2026',
    readTime: '6 min read',
    excerpt: 'Built by the Swedes in 1653 and later taken over by the British, Cape Coast Castle stands as one of the most visited and emotionally significant monuments on the continent. A UNESCO World Heritage Site where the Door of No Return tells a story the world must never forget.',
    image: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=900&q=85',
  },
  {
    id: 2,
    category: 'Arts & Craft',
    title: "Kente Weaving in Bonwire: The Story Behind Ghana's Most Iconic Cloth",
    date: 'Feb 28, 2026',
    readTime: '5 min read',
    excerpt: 'Kente is more than cloth. It is a language. Every colour, every pattern woven on the narrow-strip looms of Bonwire carries a meaning passed down through generations of Ashanti master weavers. Come and learn the grammar of Ghana\'s most celebrated textile.',
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=900&q=85',
  },
  {
    id: 3,
    category: 'Food & Culture',
    title: 'A Guide to Ghanaian Cuisine: From Jollof Rice to Waakye and Kelewele',
    date: 'Feb 14, 2026',
    readTime: '7 min read',
    excerpt: 'Ghanaian food is a celebration. Bold spices, slow-cooked stews, and street-food culture that rivals any city on earth. Whether it\'s a steaming bowl of groundnut soup or the midnight crunch of kelewele, every bite tells a story of community and joy.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85',
  },
  {
    id: 4,
    category: 'Wildlife',
    title: 'Walking With Elephants: A Safari Guide to Mole National Park',
    date: 'Jan 30, 2026',
    readTime: '8 min read',
    excerpt: "Ghana's largest wildlife refuge protects over 90 mammal species across 4,840 km² of Guinea savanna. Here, walking safaris bring you closer to elephants, buffalo, and antelope than any game vehicle ever could, an unforgettable encounter with wild Africa.",
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=900&q=85',
  },
  {
    id: 5,
    category: 'Adventure',
    title: 'Wli Waterfalls: Hiking to the Tallest Waterfall in West Africa',
    date: 'Jan 12, 2026',
    readTime: '5 min read',
    excerpt: 'Tucked away in the Volta Region near the Togolese border, the Wli Waterfalls cascade 80 metres into a cool, mist-filled basin surrounded by lush forest. The hike through butterfly-filled paths and bat colonies is an adventure in its own right.',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=85',
  },
]

const AUTO_INTERVAL = 6000

export default function Stories() {
  const [current, setCurrent] = useState(0)
  const [dir, setDir]         = useState('next') // 'next' | 'prev'
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)

  const go = useCallback((idx, direction) => {
    if (animating) return
    setDir(direction)
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 520)
    resetTimer()
  }, [animating])

  function resetTimer() {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      go((current + 1) % SLIDES.length, 'next')
    }, AUTO_INTERVAL)
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goNext()
    }, AUTO_INTERVAL)
    return () => clearTimeout(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  function goNext() {
    if (animating) return
    const next = (current + 1) % SLIDES.length
    setDir('next')
    setAnimating(true)
    setTimeout(() => { setCurrent(next); setAnimating(false) }, 520)
  }

  function goPrev() {
    if (animating) return
    const prev = (current - 1 + SLIDES.length) % SLIDES.length
    setDir('prev')
    setAnimating(true)
    setTimeout(() => { setCurrent(prev); setAnimating(false) }, 520)
  }

  function goTo(idx) {
    if (idx === current || animating) return
    const direction = idx > current ? 'next' : 'prev'
    setDir(direction)
    setAnimating(true)
    setTimeout(() => { setCurrent(idx); setAnimating(false) }, 520)
    clearTimeout(timerRef.current)
  }

  const slide = SLIDES[current]

  return (
    <section className="stories" id="culture">
      <PaintStrokes items={[
        { variant: 'b', position: 'tl', width: 320, opacity: 0.45 },
        { variant: 'a', position: 'br', width: 350, opacity: 0.5 },
      ]} />
      <div className="container">

        {/* Header */}
        <div className="stories__header">
          <div>
            <p className="stories__eyebrow">Stories From the Field</p>
            <h2 className="stories__title">The Ghana Experience Journal</h2>
          </div>
          <div className="stories__nav-btns">
            <button
              className="stories__nav-btn"
              onClick={goPrev}
              aria-label="Previous story"
            >
              <IconArrowLeft />
            </button>
            <button
              className="stories__nav-btn"
              onClick={goNext}
              aria-label="Next story"
            >
              <IconArrowRight />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="stories__carousel">

          {/* Image panel */}
          <div className="stories__img-wrap">
            <div
              className={`stories__img-inner ${animating ? `stories__img--exit-${dir}` : 'stories__img--active'}`}
            >
              <img
                key={slide.id}
                src={slide.image}
                alt={slide.title}
                loading="lazy"
              />
            </div>
            <span className="stories__cat">{slide.category}</span>

            {/* Progress bar */}
            <div className="stories__progress">
              <div
                key={`${slide.id}-bar`}
                className="stories__progress-bar"
                style={{ animationDuration: `${AUTO_INTERVAL}ms` }}
              />
            </div>
          </div>

          {/* Text panel */}
          <div
            className={`stories__body ${animating ? `stories__body--exit-${dir}` : 'stories__body--active'}`}
          >
            <div className="stories__meta">
              <span>{slide.date}</span>
              <span className="stories__dot">·</span>
              <IconClock />
              <span>{slide.readTime}</span>
            </div>
            <h3 className="stories__slide-title">{slide.title}</h3>
            <p className="stories__slide-excerpt">{slide.excerpt}</p>
            <a href="#culture" className="stories__read-link">
              Read Story <IconArrowRight />
            </a>

            {/* Dot navigation */}
            <div className="stories__dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`stories__dot-btn ${i === current ? 'stories__dot-btn--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to story ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
