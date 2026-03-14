"use client";

import { useState, useEffect, useCallback } from "react";
import CardTool from "./CardTool";
import type { Tool } from "@/types/tool";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ThumbsUp,
  ThumbsDown,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ToolGridProps {
  tools: Tool[];
  title?: string;
  icon?: React.ReactNode;
}

// ─── Banner carousel ──────────────────────────────────────────────────────────
function BannerCarousel({ urls }: { urls: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (urls.length <= 1) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % urls.length),
      4000,
    );
    return () => clearInterval(id);
  }, [urls.length]);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + urls.length) % urls.length),
    [urls.length],
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % urls.length),
    [urls.length],
  );

  if (urls.length === 0) return null;

  return (
    <div className="relative w-full h-full bg-muted/30 overflow-hidden group">
      {urls.map((url, idx) => (
        <img
          key={url + idx}
          src={url}
          alt={`banner ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${idx === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {urls.length > 1 && (
        <>
          <button
            title="btn"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            title="btn"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {urls.map((_, idx) => (
              <button
                title="btn"
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                className={`rounded-full transition-all ${idx === current ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ToolGrid({ tools, title, icon }: ToolGridProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isMobileOverlay, setIsMobileOverlay] = useState(false);
  const [updatedTools, setUpdatedTools] = useState<Tool[]>(tools);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    setUpdatedTools(tools);
  }, [tools]);

  useEffect(() => {
    if (!selectedTool || !user) {
      setUserVote(null);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(
          doc(db, "toolVotes", `${user.uid}_${selectedTool.id}`),
        );
        setUserVote(
          snap.exists() ? (snap.data().type as "like" | "dislike") : null,
        );
      } catch {
        setUserVote(null);
      }
    })();
  }, [selectedTool?.id, user]);

  async function refreshTool(id: string) {
    try {
      const snap = await getDoc(doc(db, "tools", id));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as Tool;
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  async function registerVisit(tool: Tool) {
    try {
      await updateDoc(doc(db, "tools", tool.id), { uses: increment(1) });
      setUpdatedTools((prev) =>
        prev.map((t) =>
          t.id === tool.id ? { ...t, uses: (t.uses || 0) + 1 } : t,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLike(tool: Tool) {
    if (!user) {
      alert("Faça login para votar");
      navigate("/login");
      return;
    }
    const voteRef = doc(db, "toolVotes", `${user.uid}_${tool.id}`);
    const snap = await getDoc(voteRef);
    try {
      if (snap.exists() && snap.data().type === "like") {
        await deleteDoc(voteRef);
        await updateDoc(doc(db, "tools", tool.id), { likes: increment(-1) });
        setUserVote(null);
      } else {
        if (snap.exists())
          await updateDoc(doc(db, "tools", tool.id), {
            dislikes: increment(-1),
          });
        await setDoc(voteRef, {
          userId: user.uid,
          toolId: tool.id,
          type: "like",
        });
        await updateDoc(doc(db, "tools", tool.id), { likes: increment(1) });
        setUserVote("like");
      }
      const u = await refreshTool(tool.id);
      if (u) setSelectedTool(u);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDislike(tool: Tool) {
    if (!user) {
      alert("Faça login para votar");
      navigate("/login");
      return;
    }
    const voteRef = doc(db, "toolVotes", `${user.uid}_${tool.id}`);
    const snap = await getDoc(voteRef);
    try {
      if (snap.exists() && snap.data().type === "dislike") {
        await deleteDoc(voteRef);
        await updateDoc(doc(db, "tools", tool.id), { dislikes: increment(-1) });
        setUserVote(null);
      } else {
        if (snap.exists())
          await updateDoc(doc(db, "tools", tool.id), { likes: increment(-1) });
        await setDoc(voteRef, {
          userId: user.uid,
          toolId: tool.id,
          type: "dislike",
        });
        await updateDoc(doc(db, "tools", tool.id), { dislikes: increment(1) });
        setUserVote("dislike");
      }
      const u = await refreshTool(tool.id);
      if (u) setSelectedTool(u);
    } catch (e) {
      console.error(e);
    }
  }

  function handleCardClick(tool: Tool) {
    if (window.innerWidth < 768) {
      setIsMobileOverlay(true);
      setSelectedTool(tool);
    } else {
      setIsMobileOverlay(false);
      refreshTool(tool.id).then((u) => setSelectedTool(u ?? tool));
    }
  }

  async function handleVisit(tool: Tool) {
    await registerVisit(tool);
    setSelectedTool(null);
    window.open(tool.url, "_blank");
  }

  if (updatedTools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma ferramenta encontrada</p>
      </div>
    );
  }

  const hasBanner = (t: Tool | null) => (t?.bannerUrls?.length ?? 0) > 0;

  return (
    <>
      <div className="space-y-4">
        {title && (
          <h2 className="flex justify-between items-center text-2xl font-bold mb-4">
            <span className="flex items-center gap-2">
              {icon} {title}
            </span>
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({updatedTools.length})
            </span>
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {updatedTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleCardClick(tool)}
              className="cursor-pointer"
            >
              <CardTool
                title={tool.name}
                description={tool.description}
                size="md"
                imageSrc={tool.imageUrl}
                rating={tool.rating}
                uses={tool.uses}
                tags={tool.tags}
                isNew={tool.isNew}
                isPopular={tool.isPopular}
                buttonText="Ir para"
                onButtonClick={() => handleVisit(tool)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP DIALOG ── */}
      {!isMobileOverlay && (
        <Dialog
          open={!!selectedTool}
          onOpenChange={() => setSelectedTool(null)}
        >
          {selectedTool && (
            <DialogContent
              className="p-0 overflow-hidden gap-0 [&>button]:bg-background/95 [&>button]:backdrop-blur-md [&>button]:border [&>button]:border-border/50 [&>button]:rounded-full [&>button]:opacity-100 [&>button]:shadow-lg [&>button]:shadow-black/10 [&>button]:transition-all [&>button]:duration-200 hover:[&>button]:bg-accent hover:[&>button]:scale-110 hover:[&>button]:shadow-xl"
              style={{
                maxWidth: hasBanner(selectedTool) ? "1100px" : "460px",
                width: "calc(100% - 2rem)",
              }}
            >
              <div
                className={`flex ${hasBanner(selectedTool) ? "min-h-95" : "min-h-auto"}`}
              >
                {/* ── LEFT: content ── */}
                <div className="flex-1 flex flex-col p-6 min-w-0 min-h-80">
                  <DialogHeader className="mb-3">
                    <div className="flex items-center gap-3 pr-6">
                      {selectedTool.imageUrl && (
                        <img
                          src={selectedTool.imageUrl}
                          alt={selectedTool.name}
                          className="w-10 h-10 rounded-lg border object-cover shrink-0"
                        />
                      )}
                      <DialogTitle className="text-xl font-bold leading-tight">
                        {selectedTool.name}
                      </DialogTitle>
                    </div>
                  </DialogHeader>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {selectedTool.description}
                  </p>

                  <div className="text-sm mt-4 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {selectedTool.uses || 0}
                    </span>{" "}
                    visitas totais
                  </div>

                  {(selectedTool.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedTool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => handleLike(selectedTool)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${userVote === "like" ? "bg-green-500/10 border-green-500/40 text-green-600" : "hover:bg-muted"}`}
                    >
                      <ThumbsUp size={16} /> {selectedTool.likes || 0}
                    </button>
                    <button
                      onClick={() => handleDislike(selectedTool)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${userVote === "dislike" ? "bg-red-500/10 border-red-500/40 text-red-600" : "hover:bg-muted"}`}
                    >
                      <ThumbsDown size={16} /> {selectedTool.dislikes || 0}
                    </button>
                  </div>

                  {/* Spacer que empurra o botão para o fundo */}
                  <div className="flex-1" />

                  <button
                    onClick={() => handleVisit(selectedTool)}
                    className="mt-5 w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <ExternalLink size={15} /> Acessar ferramenta
                  </button>
                </div>

                {/* ── RIGHT: carousel ── */}
                {hasBanner(selectedTool) && (
                  <div className="hidden sm:block w-160 shrink-0 border-l overflow-hidden">
                    <BannerCarousel urls={selectedTool.bannerUrls!} />
                  </div>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      )}

      {/* ── MOBILE OVERLAY ── */}
      {isMobileOverlay && selectedTool && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-background w-full rounded-t-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <button
              title="fechar"
              onClick={() => setSelectedTool(null)}
              className="absolute right-4 top-4 z-10 bg-neutral-700 rounded-full"
            >
              <X size={20} />
            </button>

            {hasBanner(selectedTool) && (
              <div className="w-full h-48 shrink-0">
                <BannerCarousel urls={selectedTool.bannerUrls!} />
              </div>
            )}

            <div className="p-6 overflow-y-auto flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3">
                {selectedTool.imageUrl && (
                  <img
                    src={selectedTool.imageUrl}
                    alt={selectedTool.name}
                    className="w-10 h-10 rounded-lg border object-cover"
                  />
                )}
                <h3 className="text-lg font-bold">{selectedTool.name}</h3>
              </div>

              <p className="text-muted-foreground text-sm mb-4">
                {selectedTool.description}
              </p>

              <div className="text-sm mb-4">
                <span className="font-medium">{selectedTool.uses || 0}</span>{" "}
                visitas
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleLike(selectedTool)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${userVote === "like" ? "bg-green-500/10 border-green-500/40 text-green-600" : ""}`}
                >
                  <ThumbsUp size={18} /> {selectedTool.likes || 0}
                </button>
                <button
                  onClick={() => handleDislike(selectedTool)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${userVote === "dislike" ? "bg-red-500/10 border-red-500/40 text-red-600" : ""}`}
                >
                  <ThumbsDown size={18} /> {selectedTool.dislikes || 0}
                </button>
              </div>

              {/* Spacer que empurra o botão para o fundo no mobile */}
              <div className="flex-1" />

              <button
                onClick={() => handleVisit(selectedTool)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md flex items-center justify-center gap-2"
              >
                <ExternalLink size={15} /> Acessar ferramenta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}