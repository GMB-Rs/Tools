import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc as firestoreDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Tool, ToolInput } from "@/types/tool";

const COLLECTION_NAME = "tools";


// Buscar todas as ferramentas
export async function fetchTools(
  searchTerm: string = "",
  category: string = "all",
  sortBy: string = "popular"
): Promise<Tool[]> {
  try {
    const toolsRef = collection(db, COLLECTION_NAME);
    let q = query(toolsRef);

    if (category !== "all") {
      q = query(q, where("category", "==", category));
    }

    if (sortBy === "popular") {
      q = query(q, orderBy("uses", "desc"));
    } else if (sortBy === "rating") {
      q = query(q, orderBy("rating", "desc"));
    } else if (sortBy === "name") {
      q = query(q, orderBy("name", "asc"));
    }

    const snapshot = await getDocs(q);

    const tools: Tool[] = snapshot.docs.map((document) => {
      const data = document.data();

      return {
        id: document.id,
        name: data.name || "",
        description: data.description || "",
        category: data.category || "",
        rating: data.rating ?? 0,
        uses: data.uses ?? 0,
        imageUrl: data.imageUrl || "",
        tags: data.tags ?? [],
        isNew: data.isNew ?? false,
        isPopular: data.isPopular ?? false,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        url: data.url || "", // ADICIONADO
      };
    });

    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase();

      return tools.filter((tool) =>
        tool.name.toLowerCase().includes(normalizedSearch) ||
        tool.description.toLowerCase().includes(normalizedSearch) ||
        tool.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        )
      );
    }

    return tools;
  } catch (error) {
    console.error("Erro ao buscar ferramentas:", error);
    throw error;
  }
}


// Adicionar ferramenta
export async function addTool(toolData: ToolInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...toolData,
      uses: toolData.uses ?? 0,
      rating: toolData.rating ?? 0,
      url: toolData.url ?? "", // GARANTE QUE SALVA URL
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar ferramenta:", error);
    throw error;
  }
}


// Atualizar ferramenta
export async function updateTool(
  id: string,
  toolData: Partial<ToolInput>
): Promise<void> {
  try {
    const toolRef = firestoreDoc(db, COLLECTION_NAME, id);

    await updateDoc(toolRef, {
      ...toolData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar ferramenta:", error);
    throw error;
  }
}


// Deletar ferramenta
export async function deleteTool(id: string): Promise<void> {
  try {
    const toolRef = firestoreDoc(db, COLLECTION_NAME, id);
    await deleteDoc(toolRef);
  } catch (error) {
    console.error("Erro ao deletar ferramenta:", error);
    throw error;
  }
}


// Buscar ferramenta por ID
export async function fetchToolById(
  id: string
): Promise<Tool | null> {
  try {
    const toolRef = firestoreDoc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(toolRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,
      name: data.name || "",
      description: data.description || "",
      category: data.category || "",
      rating: data.rating ?? 0,
      uses: data.uses ?? 0,
      imageUrl: data.imageUrl || "",
      tags: data.tags ?? [],
      isNew: data.isNew ?? false,
      isPopular: data.isPopular ?? false,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      url: data.url || "", // ADICIONADO
    };
  } catch (error) {
    console.error("Erro ao buscar ferramenta:", error);
    throw error;
  }
}


// Incrementar uso
export async function incrementToolUse(id: string): Promise<void> {
  try {
    const toolRef = firestoreDoc(db, COLLECTION_NAME, id);

    await updateDoc(toolRef, {
      uses: increment(1),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao incrementar uso:", error);
    throw error;
  }
}