"use client"

import { useState } from "react"
import { Carousel } from "react-bootstrap"
import { ChevronLeft, ChevronRight, Star, Clock, Truck } from "lucide-react"
import "./Carousel.css"

const Carousels = () => {
  const [index, setIndex] = useState(0)

  const bannerSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
      title: "Fresh Cuisine",
      subtitle: "Discover the world of vegan cuisine with fresh organic ingredients",
      features: ["100% Organic", "No preservatives", "Fast delivery"],
      badge: "New"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
      title: "Free Delivery",
      subtitle: "Order online - Delivery in 30 minutes - Free shipping for orders from 200K",
      features: ["30min fast delivery", "Free shipping", "Da Nang City"],
      badge: "Free Ship"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2081&q=80",
      title: "Premium Vegan Dishes",
      subtitle: "Experience high-class vegan cuisine with delicately prepared dishes",
      features: ["Premium", "Delicate", "Unique"],
      badge: "Premium"
    }
  ]

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex)
  }

  return (
    <div className="hero-banner">
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        interval={5000}
        fade
        controls={false}
        indicators={false}
        className="modern-carousel"
      >
        {bannerSlides.map((slide) => (
          <Carousel.Item key={slide.id}>
            <div className="banner-slide">
              <img className="d-block w-100 banner-image" src={slide.image} alt={slide.title} />
              <div className="banner-overlay">
                <div className="banner-content">
                  {/* Badge */}
                  <div className="banner-badge">
                    <span>{slide.badge}</span>
                  </div>

                  {/* Title and Subtitle */}
                  <div className="banner-text-wrapper">
                    <h2 className="banner-title">
                      <span className="title-text">{slide.title}</span>
                    </h2>
                    <p className="banner-subtitle">
                      <span className="subtitle-text">{slide.subtitle}</span>
                    </p>
                  </div>

                  {/* Features */}
                  <div className="banner-features">
                    {slide.features.map((feature, idx) => {
                      let Icon = Star;
                      if (idx === 1) Icon = Clock;
                      if (idx === 2) Icon = Truck;
                      return (
                        <div key={idx} className="feature-item">
                          <Icon size={16} color={"#A19700FF"} />
                          <span style={{ color: '#388e3c', marginLeft: 6 }}>
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Custom Navigation */}
      <div className="carousel-navigation">
        <button
          className="nav-btn prev-btn"
          onClick={() => setIndex(index === 0 ? bannerSlides.length - 1 : index - 1)}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="carousel-indicators-custom">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              className={`indicator ${idx === index ? 'active' : ''}`}
              onClick={() => setIndex(idx)}
            />
          ))}
        </div>

        <button
          className="nav-btn next-btn"
          style={{ marginRight: "20px" }}
          onClick={() => setIndex(index === bannerSlides.length - 1 ? 0 : index + 1)}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}

export default Carousels;
