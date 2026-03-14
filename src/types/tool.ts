// Tipo para dados que vêm do Firebase
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  uses: number;
  imageUrl: string;      // logo – aparece no card e ao lado do nome no modal
  bannerUrls?: string[]; // múltiplas imagens – carrossel no painel esquerdo do modal
  videoUrl?: string;     // link do YouTube – exibido no lugar do carrossel de imagens
  icon?: any;
  iconColor?: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  url: string;
  likes?: number;
  dislikes?: number;
}

// Tipo para criar/editar (sem id, createdAt, updatedAt)
export type ToolInput = Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>;