import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Tool } from "@/types/tool"; // 👈 IMPORTA DO TYPES

export function useTools(
  searchTerm: string,
  selectedCategory: string,
  sortBy: string
) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTools() {
      setLoading(true);

      try {
        let q = query(collection(db, "tools"));

        if (sortBy === "popular") {
          q = query(collection(db, "tools"), orderBy("uses", "desc"));
        }

        if (sortBy === "rating") {
          q = query(collection(db, "tools"), orderBy("rating", "desc"));
        }

        if (sortBy === "name") {
          q = query(collection(db, "tools"), orderBy("name", "asc"));
        }

        const snapshot = await getDocs(q);

        let data: Tool[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Tool, "id">),
          tags: (doc.data().tags ?? []) as string[], // 🔥 garante array
        }));

        if (selectedCategory !== "all") {
          data = data.filter(
            (tool) => tool.category === selectedCategory
          );
        }

        if (searchTerm) {
          const lower = searchTerm.toLowerCase();

          data = data.filter(
            (tool) =>
              tool.name.toLowerCase().includes(lower) ||
              tool.description.toLowerCase().includes(lower) ||
              tool.tags.some((tag) =>
                tag.toLowerCase().includes(lower)
              )
          );
        }

        setTools(data);
      } catch (error) {
        console.error("Erro ao buscar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTools();
  }, [searchTerm, selectedCategory, sortBy]);

  return { tools, loading };
}