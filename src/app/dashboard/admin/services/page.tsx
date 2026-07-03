"use client";

import React, { useEffect, useState } from "react";
import { fetchServices, ServiceItem } from "@/lib/api/services";
import { createServiceApi, updateServiceApi, deleteServiceApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Plus, Trash2, Edit, Cpu, Link as LinkIcon, Compass } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("");
  const [ctaLabel, setCtaLabel] = useState<string>("Learn More");
  const [ctaHref, setCtaHref] = useState<string>("/services");

  const { toast } = useToast();

  const loadServices = async () => {
    try {
      const data = await fetchServices();
      setServices(data.services || []);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load services list.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateDialog = () => {
    setEditingService(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setIcon("");
    setCtaLabel("Learn More");
    setCtaHref("/services");
    setEditorOpen(true);
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    setTitle(service.title);
    setSlug(service.slug);
    setDescription(service.description);
    setIcon(service.icon || "Bot");
    setCtaLabel(service.cta?.label || "Learn More");
    setCtaHref(service.cta?.href || "/services");
    setEditorOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !description) {
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
      description,
      icon,
      cta: {
        label: ctaLabel,
        href: ctaHref,
      },
    };

    try {
      if (editingService) {
        // Update
        const res = await updateServiceApi(editingService.id, payload);
        if (res && res.success) {
          toast({
            title: "Success",
            description: "Service updated successfully.",
          });
          loadServices();
          setEditorOpen(false);
        }
      } else {
        // Create
        const res = await createServiceApi(payload);
        if (res && res.success) {
          toast({
            title: "Success",
            description: "Service created successfully.",
          });
          loadServices();
          setEditorOpen(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save service.",
      });
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await deleteServiceApi(id);
      if (res && res.success) {
        toast({
          title: "Deleted",
          description: "Service deleted successfully.",
        });
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Manage Services</h3>
          <p className="text-muted-foreground mt-1">Configure and edit service categories shown to visitors.</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Service Items ({services.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-20" />
              No services registered yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {services.map(s => (
                <div key={s.id} className="flex flex-col justify-between p-5 rounded-2xl border border-border/60 bg-background/60 hover:border-border/100 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Cpu className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-foreground">{s.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(s)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteService(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{s.description}</p>
                  </div>
                  {s.cta && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40">
                      <LinkIcon className="h-3 w-3" />
                      <span>{s.cta.label} ({s.cta.href})</span>
                    </div>
                  )}
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
              {editingService ? "Edit Service" : "Create New Service"}
            </DialogTitle>
            <DialogDescription>
              Add detail card fields for the service grid.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveService} className="space-y-4 my-2 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Title *</label>
                <Input value={title} onChange={e => {
                  setTitle(e.target.value);
                  if (!editingService) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }} placeholder="e.g. AI Audit" required />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Slug *</label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="ai-audit" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Description *</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write description content..." rows={4} required />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" /> Icon Name
                </label>
                <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="e.g. Bot" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">CTA Label</label>
                <Input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} placeholder="Learn More" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">CTA Link</label>
                <Input value={ctaHref} onChange={e => setCtaHref(e.target.value)} placeholder="/services" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingService ? "Save Changes" : "Create Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
