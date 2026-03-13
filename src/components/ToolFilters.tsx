import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRef, useState, useEffect } from "react";

export const categories = [
  { id: "all", name: "Todos" },
  { id: "ia", name: "Inteligência Artificial" },
  { id: "produtividade", name: "Produtividade" },
  { id: "design", name: "Design" },
  { id: "frontend", name: "Front-End" },
  { id: "desenvolvimento", name: "Desenvolvimento" },
  { id: "bancodedados", name: "Banco de Dados" },
  { id: "editordecodigo", name: "Editor de Código" },
  { id: "api", name: "API" },
  { id: "diagramas", name: "Diagramas" },
  { id: "mapas", name: "Mapas" },
  { id: "construtores", name: "Construtores" },
  { id: "comunicacao", name: "Comunicação" },
  { id: "educacao", name: "Educação" },
  { id: "pagamento", name: "Pagamentos" }
];

interface ToolFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalTools?: number;
}

export function ToolFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalTools,
}: ToolFiltersProps) {
  // Refs para as sombras do scroll das categorias
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  // Função para verificar o scroll e atualizar as sombras
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftShadow(scrollLeft > 5);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      // Chamar uma vez para verificar o estado inicial
      checkScroll();
      
      // Também verificar quando a janela for redimensionada
      window.addEventListener('resize', checkScroll);
      
      return () => {
        scrollElement.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className="w-full border rounded-xl p-4 md:p-6 shadow-sm space-y-6 mb-6">

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ferramentas..."
          className="pl-10 h-11 text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Categorias com Slider Horizontal e Sombras */}
      <div>
        <h3 className="text-sm font-medium mb-3">Categorias</h3>

        <div className="relative">
          {/* Sombra esquerda */}
          {showLeftShadow && (
            <div className="absolute left-0 top-0 bottom-2 w-8 bg-linear-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          )}

          {/* Container com scroll */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="
              flex gap-2
              overflow-x-auto
              scroll-smooth
              pb-2
              [&::-webkit-scrollbar]:hidden
              [-ms-overflow-style:none]
              [scrollbar-width:none]
            "
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "whitespace-nowrap shrink-0 rounded-full px-4",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Sombra direita */}
          {showRightShadow && (
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-linear-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Ordenação + Resultados */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t">

        {/* Ordenação com Select do shadcn */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Ordenar por:
          </span>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Mais populares</SelectItem>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Total */}
        {totalTools !== undefined && (
          <span className="text-sm text-muted-foreground">
            {totalTools} {totalTools === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>
    </div>
  );
}