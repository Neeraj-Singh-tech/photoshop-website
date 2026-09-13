type PortfolioItem = {
  id: string;
  category: string;
  title: string;
  image_url: string;
  published: boolean;
  created_at: string;
};

const mockData: PortfolioItem[] = [
  {
    id: "1",
    category: "Weddings",
    title: "Anand & Priya",
    image_url: "/images/hero/hero.png",
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    category: "Portraits",
    title: "Studio Portrait",
    image_url: "/images/hero/hero.png",
    published: true,
    created_at: new Date().toISOString(),
  },
];

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const useSupabase =
    process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

  if (useSupabase) {
    try {
      const { supabase } = await import("@/lib/supabase");

      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching portfolio:", error);
        return mockData;
      }

      return data ?? mockData;
    } catch (err) {
      console.error("Supabase import failed, using mock data.", err);
      return mockData;
    }
  }

  // Default: return local mock data so the site works without Supabase.
  return mockData;
}