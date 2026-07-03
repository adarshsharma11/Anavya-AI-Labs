"use client";

import React, { useEffect, useState } from "react";
import { getPortfolioApi, PortfolioItem } from "@/lib/api/portfolio";
import { createPortfolioApi, updatePortfolioApi, deletePortfolioApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Plus, Trash2, Edit, Tag, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminPortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [imageKey, setImageKey] = useState("");

  const { toast } = useToast();

  const fetchPortfolio = async () => {
    try {
      const res = await getPortfolioApi();
      if (res && res.success) {
        setPortfolio(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch portfolio list.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openCreateDialog = () => {
    setEditingItem(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setTags("Web, Design, UX");
    setImageUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80");
    setImageHint("");
    setImageKey("portfolio-image");
    setEditorOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setSummary(item.summary);
    setTags(Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "");
    setImageUrl(item.imageUrl || "");
    setImageHint(item.imageHint || "");
    setImageKey(item.imageKey || "portfolio-image");
    setEditorOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !summary) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const payload = {
      title,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      summary,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      imageUrl: imageUrl || null,
      imageHint: imageHint || null,
      imageKey,
    };

    try {
      if (editingItem) {
        // Update
        const res = await updatePortfolioApi(editingItem.slug, payload);
        if (res && res.success) {
          toast({
            title: "Success",
            description: "Portfolio item updated successfully.",
          });
          fetchPortfolio();
          setEditorOpen(false);
        }
      } else {
        // Create
        const res = await createPortfolioApi(payload);
        if (res && res.success) {
          toast({
            title: "Success",
            description: "Portfolio item created successfully.",
          });
          fetchPortfolio();
          setEditorOpen(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save portfolio item.",
      });
    }
  };

  const handleDeleteItem = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;
    try {
      const res = await deletePortfolioApi(slug);
      if (res && res.success) {
        toast({
          title: "Deleted",
          description: "Portfolio item deleted successfully.",
        });
        setPortfolio(prev => prev.filter(p => p.slug !== slug));
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete portfolio item.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Manage Portfolio</h3>
          <p className="text-muted-foreground mt-1">Configure and edit case studies and completed design projects.</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Case Study
        </Button>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Case Studies ({portfolio.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : portfolio.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
              No portfolio items registered yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {portfolio.map(p => (
                <div key={p.id} className="relative flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-border/60 bg-background/60 hover:border-border/100 transition-all group">
                  {p.imageUrl && (
                    <div className="relative h-28 w-full md:w-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-foreground truncate">{p.title}</h4>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(p)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(p.slug)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.summary}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-border/40">
                      {Array.isArray(p.tags) && p.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="border-border/60 bg-background/95 backdrop-blur max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingItem ? "Edit Case Study" : "Create New Case Study"}
            </DialogTitle>
            <DialogDescription>
              Configure the metadata and tags for this case study item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveItem} className="space-y-4 my-2 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Title *</label>
                <Input value={title} onChange={e => {
                  setTitle(e.target.value);
                  if (!editingItem) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }} placeholder="Case Study Title" required />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Slug *</label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="case-study-slug" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Summary *</label>
              <Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary description..." required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Image URL
                </label>
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Cover Image URL" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Image Key</label>
                <Input value={imageKey} onChange={e => setImageKey(e.target.value)} placeholder="e.g. portfolio-key" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Tags (comma separated)
                </label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Web, UI Design" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Image Hint (Alt Text)</label>
                <Input value={imageHint} onChange={e => setImageHint(e.target.value)} placeholder="Image description..." />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
