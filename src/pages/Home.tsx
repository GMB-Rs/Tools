"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ToolFilters, categories } from "@/components/ToolFilters";
import { ToolGrid } from "@/components/ToolGrid";
import { useTools } from "@/hooks/useTools";
import { Loader2 } from "lucide-react";
import { Hero } from "@/components";

import { Button } from "@/components/ui/button";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Footer from "@/components/Footer";

function Home() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  // Refs para as sombras do scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  const { tools, loading } = useTools(searchTerm, selectedCategory, sortBy);

  // Seções fixas da Home
  const { tools: aiTools } = useTools("", "ia", "popular");
  const { tools: designTools } = useTools("", "design", "popular");
  const { tools: devTools } = useTools("", "desenvolvimento", "popular");

  const isFiltering = selectedCategory !== "all" || searchTerm.trim() !== "";

  // FILTRO POR TAG
  const filteredTools = useMemo(() => {
    if (selectedTag === "all") return tools;
    return tools.filter((tool) => tool.tags?.includes(selectedTag));
  }, [tools, selectedTag]);

  // RESETAR PAGINAÇÃO ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTag, sortBy]);

  // PAGINAÇÃO
  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);

  const paginatedTools = filteredTools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // PEGAR TAGS DISPONÍVEIS
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((tool) => {
      tool.tags?.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [tools]);

  const categoryName = categories.find((c) => c.id === selectedCategory)?.name;

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
  }, [availableTags]);

  return (
    <div className="min-h-screen">
      <Hero />

      <div className="container mx-auto px-4 py-8">
        <ToolFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat: string) => {
            setSelectedCategory(cat);
            setSelectedTag("all");
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalTools={filteredTools.length}
        />

        {/* SUBCATEGORIAS COM SOMBRAS NO SCROLL */}
        {isFiltering && availableTags.length > 0 && (
          <div className="mt-6">
            <span className="text-sm text-muted-foreground block mb-3">
              Subcategoria
            </span>

            <div className="relative">
              {/* Sombra esquerda */}
              {showLeftShadow && (
                <div className="absolute left-0 top-0 bottom-3 w-8 bg-linear-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
              )}

              {/* Container com scroll - scrollbar escondida com Tailwind */}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="overflow-x-auto pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="flex gap-2 px-1">
                  <Button
                    variant={selectedTag === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag("all")}
                    className="rounded-full shrink-0"
                  >
                    Todos
                  </Button>

                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className="rounded-full shrink-0"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sombra direita */}
              {showRightShadow && (
                <div className="absolute right-0 top-0 bottom-3 w-8 bg-linear-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando ferramentas...</p>
          </div>
        ) : (
          <>
            {isFiltering ? (
              filteredTools.length > 0 ? (
                <>
                  <div className="mt-8">
                    <ToolGrid
                      tools={paginatedTools}
                      title={
                        selectedCategory !== "all"
                          ? (categoryName ?? "Categoria")
                          : "Resultados"
                      }
                    />
                  </div>

                  {/* PAGINAÇÃO */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {/* PREVIOUS */}
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) {
                                  setCurrentPage((prev) => prev - 1);
                                }
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>

                          {/* NÚMEROS */}
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          {/* NEXT */}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) {
                                  setCurrentPage((prev) => prev + 1);
                                }
                              }}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg font-medium">
                    Nenhuma ferramenta encontrada.
                  </p>
                </div>
              )
            ) : (
              <>
                {/* EM DESTAQUE */}
                {tools.length > 0 && (
                  <div className="mt-8">
                    <ToolGrid tools={tools.slice(0, 12)} title="Em Destaque" />
                  </div>
                )}

                {/* IA */}
                {aiTools.length > 0 && (
                  <div className="mt-12">
                    <ToolGrid
                      tools={aiTools.slice(0, 8)}
                      title="Inteligência Artificial"
                    />
                  </div>
                )}

                {/* DESIGN */}
                {designTools.length > 0 && (
                  <div className="mt-12">
                    <ToolGrid tools={designTools.slice(0, 8)} title="Design" />
                  </div>
                )}

                {/* DEV */}
                {devTools.length > 0 && (
                  <div className="mt-12">
                    <ToolGrid
                      tools={devTools.slice(0, 8)}
                      title="Desenvolvimento"
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;