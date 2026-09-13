"use client";

import { useEffect, useRef, useState } from "react";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

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

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className={`contact ${isVisible ? "contact-visible" : ""}`}
      id="contact"
      ref={sectionRef}
    >
      <div className="contact-container">

        <div className="contact-heading">
          <span>04</span>
          <p>LET'S CONNECT</p>
        </div>

        <div className="contact-content">
          <h2>
            Let's create
            <br />
            something
            <br />
            <em>worth remembering.</em>
          </h2>

          <p>
            Tell us about your story, your idea, or the moment
            you want us to capture. We'd love to hear from you.
          </p>

          <a
            href="https://wa.me/918698252566"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button"
          >
            Start a conversation
            <span>↗</span>
          </a>
        </div>

        <div className="contact-details">

          <div>
            <span>EMAIL</span>
            <a href="mailto:salunkepravin9@gmail.com">
              salunkepravin9@gmail.com
            </a>
          </div>

          <div>
            <span>WHATSAPP</span>
            <a
              href="https://wa.me/918698252566"
              target="_blank"
              rel="noopener noreferrer"
            >
              +91 86982 52566
            </a>
          </div>

          <div>
            <span>INSTAGRAM</span>
            <a
              href="https://www.instagram.com/weddingframesbypravin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              @weddingframesbypravin
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}