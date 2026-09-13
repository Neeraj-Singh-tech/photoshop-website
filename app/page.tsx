import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getPortfolio } from "@/lib/getPortfolio";
import Testimonials from "@/components/Testimonials";

export const dynamic = "force-dynamic";

export default async function Home() {
  const portfolioItems = await getPortfolio();

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Portfolio portfolioItems={portfolioItems} />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}