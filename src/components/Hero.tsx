import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "./Navbar";

export function Hero() {
  return (
    <div className="relative min-h-[90vh] border-b bg-linear-to-br from-background via-background to-primary/5 flex flex-col">
      <Navbar /> {/* Navbar agora dentro do Hero para controle total do layout */}
      {/* Grid pattern sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Conteúdo principal */}
      <div className="flex-1 -mt-5 container relative mx-auto px-4 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-normal border-primary/20 bg-background/50 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-primary" />
              Curadoria manual
            </Badge>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
              Ferramentas que {" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  aumentam
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-2 bg-primary/10 -rotate-1" />
              </span>{" "}
              sua produtividade
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto text-balance">
              As ferramentas favoritas dos desenvolvedores para criar, organizar e entregar projetos com mais eficiência.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button 
              size="lg" 
              className="h-11 px-6 text-sm gap-2 rounded-full shadow-sm hover:shadow-md transition-all group"
            >
              Indicar ferramenta
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tags no final */}
      <div className="relative z-10 container mx-auto px-4 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-muted-foreground/40">—</span>
          <span className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">IA</span>
          <span className="text-muted-foreground/20">•</span>
          <span className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">dev</span>
          <span className="text-muted-foreground/20">•</span>
          <span className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">design</span>
          <span className="text-muted-foreground/20">•</span>
          <span className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">produtividade</span>
          <span className="text-muted-foreground/20">•</span>
          <span className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-default">no-code</span>
          <span className="text-muted-foreground/40">—</span>
        </div>
      </div>

      {/* Linha inferior sutil */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
    </div>
  );
}