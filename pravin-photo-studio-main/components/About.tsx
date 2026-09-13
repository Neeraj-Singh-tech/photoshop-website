"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="about" id="about">
      <div
        ref={containerRef}
        className={`about-container ${
          isVisible ? "about-visible" : ""
        }`}
      >

        <div className="about-label">
          <span>01</span>
          <span>ABOUT PRAVIN PHOTO STUDIO</span>
        </div>

        <div className="about-content">
          <h2>
            We capture
            <br />
            <em>the feeling</em>
            <br />
            behind the moment.
          </h2>

          <p>
            Pravin Photo Studio is dedicated to capturing honest,
            timeless moments and turning them into memories that last.
            We believe the most beautiful photographs are not simply
            seen — they are felt.
          </p>

          <a href="#portfolio" className="about-link">
            Discover our work
            <span>↗</span>
          </a>
        </div>

      </div>
    </section>
  );
}