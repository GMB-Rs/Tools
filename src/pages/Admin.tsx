"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Upload,
  ImageIcon,
  Images,
} from "lucide-react";
import { categories } from "@/components/ToolFilters";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  uses: number;
  likes?: number;
  dislikes?: number;
  tags: string[];
  imageUrl?: string;
  bannerUrls?: string[];
  url?: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  rating: number;
  uses: number;
  tags: string;
  imageUrl: string;
  url: string;
}

// ─── upload helper ────────────────────────────────────────────────────────────
async function uploadFile(
  file: File,
  onProgress?: (n: number) => void,
): Promise<string> {
  const path = `tools/${Date.now()}_${file.name.replace(/\s/g, "_")}`;
  const task = uploadBytesResumable(ref(storage, path), file);
  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (s) =>
        onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(task.snapshot.ref)),
    );
  });
}

// ─── single logo upload field ─────────────────────────────────────────────────
interface LogoFieldProps {
  preview: string;
  file: File | null;
  urlValue: string;
  onFileChange: (f: File | null, preview: string) => void;
  onUrlChange: (url: string) => void;
}
function LogoField({
  preview,
  file,
  urlValue,
  onFileChange,
  onUrlChange,
}: LogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Selecione uma imagem.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      alert("Máximo 2MB.");
      return;
    }
    // ✅ FIX: limpa URL manual ao selecionar arquivo
    onUrlChange("");
    onFileChange(f, URL.createObjectURL(f));
  }

  const shown = preview || urlValue;

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">Logo da ferramenta</label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aparece no card e ao lado do nome no modal
        </p>
      </div>
      <div
        className="relative w-full h-28 border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors bg-muted/20 flex items-center justify-center group"
        onClick={() => inputRef.current?.click()}
      >
        {shown ? (
          <>
            <img
              src={shown}
              alt="preview"
              className="w-full h-full object-contain p-2"
              onError={() => onFileChange(null, "")}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Trocar
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="text-xs">Clique para fazer upload</span>
            <span className="text-[11px]">PNG, JPG, SVG até 2MB</span>
          </div>
        )}
      </div>
      <input
        title="foto"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {file && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md">
          <span className="truncate">{file.name}</span>
          <button
            title="x"
            onClick={() => {
              onFileChange(null, "");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="ml-2 shrink-0 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground">
          ou cole uma URL
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <Input
        placeholder="https://exemplo.com/logo.png"
        value={urlValue}
        onChange={(e) => {
          onUrlChange(e.target.value);
          onFileChange(null, e.target.value);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    </div>
  );
}

// ─── multi-image banner field ─────────────────────────────────────────────────
interface BannerFieldProps {
  items: BannerItem[];
  onChange: (items: BannerItem[]) => void;
}
interface BannerItem {
  id: string;
  file?: File;
  preview: string;
  uploading?: boolean;
  progress?: number;
  uploaded?: boolean;
  url?: string;
}

function BannerField({ items, onChange }: BannerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  function addFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        alert(`"${f.name}" não é uma imagem.`);
        return false;
      }
      if (f.size > 2 * 1024 * 1024) {
        alert(`"${f.name}" excede 2MB.`);
        return false;
      }
      return true;
    });
    const newItems: BannerItem[] = valid.map((f) => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      preview: URL.createObjectURL(f),
    }));
    onChange([...items, ...newItems]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([
      ...items,
      { id: `${Date.now()}`, preview: trimmed, url: trimmed, uploaded: true },
    ]);
    setUrlInput("");
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Images className="h-4 w-4" /> Imagens do banner (carrossel)
        </label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aparecem no painel esquerdo do modal. Você pode adicionar várias.
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="relative group aspect-video rounded-lg overflow-hidden border bg-muted/20"
            >
              <img
                src={item.preview}
                alt=""
                className="w-full h-full object-cover"
                onError={() => removeItem(item.id)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  title="Mover para esquerda"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, idx - 1)}
                  className="text-white bg-white/20 hover:bg-white/40 rounded p-1 disabled:opacity-30 text-xs font-bold"
                >
                  ◀
                </button>
                <button
                  title="Remover"
                  onClick={() => removeItem(item.id)}
                  className="text-white bg-red-500/70 hover:bg-red-500 rounded p-1"
                >
                  <X className="h-3 w-3" />
                </button>
                <button
                  title="Mover para direita"
                  disabled={idx === items.length - 1}
                  onClick={() => moveItem(idx, idx + 1)}
                  className="text-white bg-white/20 hover:bg-white/40 rounded p-1 disabled:opacity-30 text-xs font-bold"
                >
                  ▶
                </button>
              </div>
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {idx + 1}
              </span>
            </div>
          ))}

          <div
            className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/10"
            onClick={() => inputRef.current?.click()}
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div
          className="w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/20 flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs">Clique para adicionar imagens</span>
          <span className="text-[11px]">PNG, JPG, SVG até 2MB cada</span>
        </div>
      )}

      <input
        title="foto"
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={addFiles}
      />

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground">
          ou cole uma URL
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="https://exemplo.com/screenshot.png"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUrl()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrl}
          disabled={!urlInput.trim()}
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS = 5;

  const [isOpen, setIsOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoProgress, setLogoProgress] = useState(0);

  const [bannerItems, setBannerItems] = useState<BannerItem[]>([]);

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    rating: 0,
    uses: 0,
    tags: "",
    imageUrl: "",
    url: "",
  });

  useEffect(() => {
    loadTools();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function loadTools() {
    try {
      const snap = await getDocs(collection(db, "tools"));
      setTools(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Tool[]);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSave() {
    if (!form.name || !form.description || !form.url) {
      alert("Preencha Nome, Descrição e URL.");
      return;
    }
    setIsLoading(true);
    try {
      // ✅ FIX: usa logoPreview como fallback para quando URL foi colada diretamente
      let imageUrl = form.imageUrl || logoPreview;

      // Se há arquivo de logo pendente, faz upload e sobrescreve
      if (logoFile) {
        imageUrl = await uploadFile(logoFile, setLogoProgress);
      }

      // Upload banners pendentes
      const finalBannerUrls: string[] = [];
      for (const item of bannerItems) {
        if (item.file) {
          const url = await uploadFile(item.file);
          finalBannerUrls.push(url);
        } else if (item.url) {
          finalBannerUrls.push(item.url);
        } else if (item.preview) {
          finalBannerUrls.push(item.preview);
        }
      }

      const data = {
        name: form.name,
        description: form.description,
        category: form.category || "outros",
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        rating: Number(form.rating) || 0,
        uses: Number(form.uses) || 0,
        imageUrl: imageUrl || "",
        bannerUrls: finalBannerUrls,
        url: form.url,
        updatedAt: new Date(),
      };

      if (editingTool) {
        await updateDoc(doc(db, "tools", editingTool.id), data);
      } else {
        await addDoc(collection(db, "tools"), {
          ...data,
          likes: 0,
          dislikes: 0,
          createdAt: new Date(),
        });
      }

      setIsOpen(false);
      resetForm();
      await loadTools();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
      setLogoProgress(0);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta ferramenta?")) return;
    try {
      await deleteDoc(doc(db, "tools", id));
      await loadTools();
    } catch (e) {
      console.error(e);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      category: "",
      rating: 0,
      uses: 0,
      tags: "",
      imageUrl: "",
      url: "",
    });
    setEditingTool(null);
    setLogoFile(null);
    setLogoPreview("");
    setLogoProgress(0);
    setBannerItems([]);
  }

  function openEdit(tool: Tool) {
    setEditingTool(tool);
    setForm({
      name: tool.name || "",
      description: tool.description || "",
      category: tool.category || "",
      rating: tool.rating || 0,
      uses: tool.uses || 0,
      tags: tool.tags?.join(", ") || "",
      imageUrl: tool.imageUrl || "",
      url: tool.url || "",
    });
    setLogoPreview(tool.imageUrl || "");
    setLogoFile(null);
    setBannerItems(
      (tool.bannerUrls || []).map((url) => ({
        id: `existing_${url}`,
        preview: url,
        url,
        uploaded: true,
      })),
    );
    setIsOpen(true);
  }

  const filtered = tools.filter((t) => {
    const s = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(s) ||
      t.description?.toLowerCase().includes(s) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(s))
    );
  });
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS,
    currentPage * ITEMS,
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between mb-6 items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Ferramentas</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Ferramenta
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
        {search && (
          <button
            title="fechar"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {paginated.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              {search
                ? "Nenhuma ferramenta encontrada."
                : "Nenhuma ferramenta cadastrada."}
            </p>
          </div>
        )}
        {paginated.map((tool) => {
          const catLabel =
            categories.find((c) => c.id === tool.category)?.name ||
            tool.category ||
            "Sem categoria";
          return (
            <div
              key={tool.id}
              className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between gap-4 hover:bg-muted/5 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  {tool.imageUrl ? (
                    <img
                      src={tool.imageUrl}
                      alt={tool.name}
                      className="w-12 h-12 rounded-lg object-cover border shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-muted rounded-md">
                    ⭐ {tool.rating || 0}
                  </span>
                  <span className="px-2 py-1 bg-muted rounded-md">
                    👁️ {tool.uses || 0} usos
                  </span>
                  <span className="px-2 py-1 bg-muted rounded-md">
                    👍 {tool.likes || 0}
                  </span>
                  <span className="px-2 py-1 bg-muted rounded-md">
                    👎 {tool.dislikes || 0}
                  </span>
                  {(tool.bannerUrls?.length ?? 0) > 0 && (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md">
                      🖼️ {tool.bannerUrls!.length} banner
                      {tool.bannerUrls!.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {tool.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-2 text-primary">
                  Categoria: {catLabel}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(tool)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(tool.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? "Editar Ferramenta" : "Nova Ferramenta"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <LogoField
              preview={logoPreview}
              file={logoFile}
              urlValue={form.imageUrl}
              onFileChange={(f, p) => {
                setLogoFile(f);
                setLogoPreview(p);
                if (!f) setForm((v) => ({ ...v, imageUrl: "" }));
              }}
              onUrlChange={(url) => setForm((v) => ({ ...v, imageUrl: url }))}
            />

            <div className="h-px bg-border" />

            <BannerField items={bannerItems} onChange={setBannerItems} />

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <Input
                placeholder="Ex: ChatGPT"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição *</label>
              <Textarea
                placeholder="Descreva a ferramenta..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select
                title="categoria"
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categories
                  .filter((c) => c.id !== "all")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Avaliação (0-5)</label>
                <Input
                  placeholder="0.0"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nº de usos</label>
                <Input
                  placeholder="0"
                  type="number"
                  min="0"
                  value={form.uses}
                  onChange={(e) =>
                    setForm({ ...form, uses: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tags (separadas por vírgula)
              </label>
              <Input
                placeholder="Ex: ia, chatbot, produtividade"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL da Ferramenta *</label>
              <Input
                placeholder="https://exemplo.com"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>

            {isLoading && logoProgress > 0 && logoProgress < 100 && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Enviando logo...</span>
                  <span>{logoProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${logoProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}