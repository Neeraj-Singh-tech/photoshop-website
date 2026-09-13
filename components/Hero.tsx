"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY;
      const heroHeight = window.innerHeight;

      const progress = Math.min(scroll / heroHeight, 1);

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const imageScale = 1 + scrollProgress * 0.08;
  const contentX = scrollProgress * -80;
  const contentOpacity = 1 - scrollProgress * 1.2;

  return (
    <section className="hero" id="home">

      <div
        className="hero-image"
        style={{
          transform: `scale(${imageScale})`,
        }}
      >
        <div className="hero-overlay"></div>
      </div>

      <div
        className="hero-content"
        style={{
          transform: `translate(${contentX}px, -50%)`,
          opacity: Math.max(contentOpacity, 0),
        }}
      >
        <p className="hero-eyebrow">PHOTOGRAPHY STUDIO</p>

        <h1>
          Stories.
          <br />
          <span>Framed Beautifully.</span>
        </h1>

        <a href="#portfolio" className="hero-button">
          Explore Our Work
        </a>
      </div>

      <div className="hero-scroll">
        <span>Scroll to explore</span>
        <div className="scroll-line"></div>
      </div>

    </section>
  );
}