"use client";

import { useEffect, useRef, useState } from "react";

type PortfolioItem = {
  id: string;
  category: string;
  title: string;
  image_url: string;
  published: boolean;
  created_at: string;
};

const categories = [
  "All",
  "Weddings",
  "Portraits",
  "Pre-Wedding",
  "Editorial",
  "Commercial",
  "Events",
];

export default function Portfolio({
  portfolioItems,
}: {
  portfolioItems: PortfolioItem[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [translateX, setTranslateX] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // =========================
  // CATEGORY FILTER
  // =========================

  const [activeCategory, setActiveCategory] =
    useState("All");

  const filteredItems =
    activeCategory === "All"
      ? portfolioItems
      : portfolioItems.filter(
          (item) =>
            item.category === activeCategory
        );

  // =========================
  // PORTFOLIO ENTRANCE
  // =========================

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const handleReveal = () => {
      const rect = section.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.85) {
        setIsVisible(true);
        window.removeEventListener(
          "scroll",
          handleReveal
        );
      }
    };

    window.addEventListener(
      "scroll",
      handleReveal,
      { passive: true }
    );

    handleReveal();

    return () => {
      window.removeEventListener(
        "scroll",
        handleReveal
      );
    };
  }, []);

  // =========================
  // HORIZONTAL SCROLL
  // =========================

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !trackRef.current) return;

      const section = sectionRef.current;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollPosition = window.scrollY;

      const start = sectionTop;
      const end =
        sectionTop +
        sectionHeight -
        viewportHeight;

      const scrollRange = Math.max(end - start, 1);

      const progress = Math.min(
        Math.max(
          (scrollPosition - start) / scrollRange,
          0
        ),
        1
      );

      const maxTranslate =
        trackRef.current.scrollWidth -
        window.innerWidth;

      setTranslateX(
        progress * Math.max(maxTranslate, 0)
      );
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [portfolioItems, activeCategory]);

  // =========================
  // CENTER FOCUS ANIMATION
  // =========================

  useEffect(() => {
    const updateCardFocus = () => {
      const track = trackRef.current;

      if (!track) return;

      const cards =
        track.querySelectorAll<HTMLElement>(".portfolio-card");

      const viewportCenter = window.innerWidth / 2;

      // The image nearest the center is largest.
      // Images become smaller smoothly as they move away.
      const focusDistance = Math.min(
        window.innerWidth * 0.6,
        700
      );

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        const normalizedDistance = Math.min(
          distance / focusDistance,
          1
        );

        const scale =
          1 - normalizedDistance * 0.22;

        card.style.setProperty(
          "--portfolio-focus-scale",
          scale.toFixed(3)
        );

        // Keep the focused image visually above its neighbours.
        card.style.zIndex = String(
          Math.round((1 - normalizedDistance) * 10)
        );
      });
    };

    const update = () => {
      window.requestAnimationFrame(updateCardFocus);
    };

    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, [translateX, activeCategory, filteredItems.length]);

  // =========================
  // RESET HORIZONTAL POSITION
  // =========================

  useEffect(() => {
    setTranslateX(0);
  }, [activeCategory]);

  return (
    <section
      className={`portfolio-horizontal ${
        isVisible ? "portfolio-visible" : ""
      }`}
      id="portfolio"
      ref={sectionRef}
    >
      <div className="portfolio-sticky">

        {/* =========================
            PORTFOLIO HEADER
        ========================= */}

        <div className="portfolio-top">

          <div className="portfolio-heading">
            <span>03</span>
            <p>SELECTED WORK</p>
          </div>

          <p className="portfolio-scroll-label">
            Scroll to explore
          </p>

        </div>

        {/* =========================
            CATEGORY FILTER
        ========================= */}

        <div className="portfolio-filters">

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "portfolio-filter active"
                  : "portfolio-filter"
              }
              onClick={() => {
                setActiveCategory(category);
              }}
            >
              {category}
            </button>
          ))}

        </div>

        {/* =========================
            PORTFOLIO TRACK
        ========================= */}

        <div
          className="portfolio-track"
          ref={trackRef}
          style={{
            transform: `translate3d(-${translateX}px, 0, 0)`,
          }}
        >

          {/* INTRO CARD */}

          <div className="portfolio-intro-card">

            <h2>
              Moments,
              <br />
              <em>beautifully</em>
              <br />
              remembered.
            </h2>

            <p>
              A collection of stories, people, and places
              we've had the privilege to frame.
            </p>

          </div>

          {/* PORTFOLIO PHOTOS */}

          {filteredItems.map((item) => (
            <div
              className="portfolio-card"
              key={item.id}
            >

              <div className="portfolio-card-image">

                <img
                  src={item.image_url}
                  alt={item.title}
                />

              </div>

              <div className="portfolio-card-meta">

                <span>
                  {item.category}
                </span>

                <span>
                  {item.title}
                </span>

              </div>

            </div>
          ))}

          {/* END CARD */}

          <div className="portfolio-end-card">

            <span>07</span>

            <h3>
              Your story
              <br />
              could be next.
            </h3>

            <span className="portfolio-end-arrow">
              ↗
            </span>

          </div>

        </div>

        {/* =========================
            PROGRESS BAR
        ========================= */}

        <div className="portfolio-progress">

          <div className="portfolio-progress-bar">

            <div
              className="portfolio-progress-fill"
              style={{
                transform: `scaleX(${Math.min(
                  translateX /
                    Math.max(
                      trackRef.current?.scrollWidth
                        ? trackRef.current.scrollWidth -
                            (typeof window !== "undefined"
                              ? window.innerWidth
                              : 0)
                        : 1,
                      1
                    ),
                  1
                )})`,
              }}
            />

          </div>

        </div>

      </div>
    </section>
  );
}