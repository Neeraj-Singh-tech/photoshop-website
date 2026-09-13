import { getPortfolio } from "@/lib/getPortfolio";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Gallery() {
  const items = await getPortfolio();

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <div className="gallery-hero-inner">
          <h1>Gallery</h1>
          <p>Browse a responsive grid of selected work.</p>
        </div>
      </section>

      <section className="gallery-grid-section">
        <div className="gallery-grid">
          {items.map((it) => (
            <figure key={it.id} className="gallery-item">
              <img src={it.image_url} alt={it.title} />
              <figcaption>
                <strong>{it.title}</strong>
                <span>{it.category}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="gallery-back">
        <Link href="/">← Back to Home</Link>
      </div>
    </main>
  );
}
