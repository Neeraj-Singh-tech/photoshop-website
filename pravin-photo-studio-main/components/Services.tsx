"use client";

import { useEffect, useRef, useState } from "react";

export default function Services() {
  const services = [
    {
      number: "01",
      title: "Portraits",
      description:
        "Personal stories, editorial portraits, and individual sessions.",
    },
    {
      number: "02",
      title: "Weddings",
      description:
        "Honest moments and cinematic stories from your wedding day.",
    },
    {
      number: "03",
      title: "Commercial",
      description:
        "Photography crafted for brands, businesses, and campaigns.",
    },
    {
      number: "04",
      title: "Pre-Wedding",
      description:
        "Intimate couple sessions created with a cinematic feel.",
    },
    {
      number: "05",
      title: "Events",
      description:
        "The atmosphere, people, and moments that make an event memorable.",
    },
    {
      number: "06",
      title: "Fashion / Editorial",
      description:
        "Creative imagery for fashion, portfolios, and editorial projects.",
    },
    {
      number: "07",
      title: "Product Photography",
      description:
        "Clean, refined visuals designed to showcase your products.",
    },
  ];

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
      className={`services ${isVisible ? "services-visible" : ""}`}
      id="services"
      ref={sectionRef}
    >
      <div className="services-container">

        <div className="services-heading">
          <span>02</span>
          <p>OUR SERVICES</p>
        </div>

        <div className="services-list">
          {services.map((service, index) => (
            <div
              className="service-row"
              key={service.number}
              style={
                {
                  "--service-delay": `${index * 0.12}s`,
                } as React.CSSProperties
              }
            >
              <span className="service-number">
                {service.number}
              </span>

              <div className="service-info">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>

              <span className="service-arrow">↗</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}