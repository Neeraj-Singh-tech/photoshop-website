import { supabase } from "@/lib/supabase";

export async function getPortfolio() {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching portfolio:", error);
    return [];
  }

  return data;
}