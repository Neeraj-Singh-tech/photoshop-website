"use client";

import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <footer
      className={`footer ${isVisible ? "footer-visible" : ""}`}
      ref={footerRef}
    >
      <div className="footer-container">

        <div className="footer-top">
          <a href="#home" className="footer-logo">
            PRAVIN PHOTO STUDIO
          </a>

          <p>
            Stories.
            <br />
            Framed Beautifully.
          </p>
        </div>

        <div className="footer-middle">
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </div>

          <a
            href="https://wa.me/918698252566"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-book"
          >
            Book a Session ↗
          </a>
        </div>

        <div className="footer-bottom">
          <span>© 2026 PRAVIN PHOTO STUDIO</span>

          <span>MADE WITH INTENTION</span>

          <a href="#home">BACK TO TOP ↑</a>
        </div>

      </div>
    </footer>
  );
}