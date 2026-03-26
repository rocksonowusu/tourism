import React from 'react'
import './Features.css'

function Features() {
  const features = [
    {
      id: 1,
      icon: '🗺️',
      title: 'Explore Destinations',
      description: 'Discover thousands of amazing destinations from around the world'
    },
    {
      id: 2,
      icon: '💰',
      title: 'Best Prices',
      description: 'Get the best deals and exclusive offers for your travels'
    },
    {
      id: 3,
      icon: '🛫',
      title: 'Easy Booking',
      description: 'Simple and secure booking process for flights and accommodations'
    },
    {
      id: 4,
      icon: '🤝',
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your travel needs'
    }
  ]

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features-header">
          <h2 className="features-title">Why Choose Us?</h2>
          <p className="features-subtitle">
            We provide everything you need for an unforgettable travel experience
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-card fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
