export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Working with Pravin was effortless — our wedding photos are timeless.",
      author: "Aisha & Rohit",
      role: "Wedding Client",
    },
    {
      quote:
        "A true professional. The portrait session felt natural and relaxed.",
      author: "Simran K.",
      role: "Portrait Client",
    },
  ];

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-heading">
          <span>04</span>
          <p>WHAT PEOPLE SAY</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <blockquote className="testimonial" key={i}>
              <p className="testimonial-quote">{t.quote}</p>
              <footer className="testimonial-meta">
                <strong>{t.author}</strong>
                <span>{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
