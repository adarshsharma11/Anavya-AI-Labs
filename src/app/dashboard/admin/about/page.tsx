"use client";

import React, { useEffect, useState } from "react";
import { fetchAboutData } from "@/lib/api/about";
import { updateAboutApi } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Info, Save, Plus, Trash2, Heart, Award, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [principlesTitle, setPrinciplesTitle] = useState("");
  const [principlesDescription, setPrinciplesDescription] = useState("");
  const [cultureTitle, setCultureTitle] = useState("");
  const [cultureDescription, setCultureDescription] = useState("");

  // JSON Array fields
  const [badges, setBadges] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [principles, setPrinciples] = useState<any[]>([]);
  const [culture, setCulture] = useState<any[]>([]);

  const { toast } = useToast();

  const loadAboutContent = async () => {
    try {
      const data = await fetchAboutData();
      if (data) {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setImageUrl(data.imageUrl || "");
        setImageHint(data.imageHint || "");
        setPrinciplesTitle(data.principlesTitle || "");
        setPrinciplesDescription(data.principlesDescription || "");
        setCultureTitle(data.cultureTitle || "");
        setCultureDescription(data.cultureDescription || "");
        setBadges(data.badges || []);
        setHighlights(data.highlights || []);
        setPrinciples(data.principles || []);
        setCulture(data.culture || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load about section content.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutContent();
  }, []);

  // Handlers for Badges
  const handleAddBadge = () => {
    setBadges(prev => [...prev, "New Badge"]);
  };

  const handleUpdateBadge = (index: number, val: string) => {
    setBadges(prev => prev.map((b, i) => (i === index ? val : b)));
  };

  const handleRemoveBadge = (index: number) => {
    setBadges(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers for Highlights
  const handleAddHighlight = () => {
    setHighlights(prev => [...prev, { value: "100%", label: "Metric", detail: "Detail statement" }]);
  };

  const handleUpdateHighlight = (index: number, key: string, val: string) => {
    setHighlights(prev =>
      prev.map((h, i) => (i === index ? { ...h, [key]: val } : h))
    );
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers for Principles
  const handleAddPrinciple = () => {
    setPrinciples(prev => [...prev, { title: "Value Title", description: "Value explanation details" }]);
  };

  const handleUpdatePrinciple = (index: number, key: string, val: string) => {
    setPrinciples(prev =>
      prev.map((p, i) => (i === index ? { ...p, [key]: val } : p))
    );
  };

  const handleRemovePrinciple = (index: number) => {
    setPrinciples(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers for Culture
  const handleAddCulture = () => {
    setCulture(prev => [...prev, { title: "Culture Element", description: "Culture environment details" }]);
  };

  const handleUpdateCulture = (index: number, key: string, val: string) => {
    setCulture(prev =>
      prev.map((c, i) => (i === index ? { ...c, [key]: val } : c))
    );
  };

  const handleRemoveCulture = (index: number) => {
    setCulture(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAbout = async () => {
    if (!title || !description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and description are required.",
      });
      return;
    }

    setSaving(true);
    const payload = {
      title,
      description,
      imageUrl,
      imageHint,
      principlesTitle,
      principlesDescription,
      cultureTitle,
      cultureDescription,
      badges,
      highlights,
      principles,
      culture,
    };

    try {
      const res = await updateAboutApi(payload);
      if (res && res.success) {
        toast({
          title: "Saved",
          description: "About section page content customized successfully.",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save about section content.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted/40" />
        <div className="h-96 w-full animate-pulse rounded-xl bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Manage About Page</h3>
          <p className="text-muted-foreground mt-1">Customize details of company highlights, principles, and team culture.</p>
        </div>
        <Button onClick={handleSaveAbout} disabled={saving} className="shadow-lg shadow-primary/20">
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Customization"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Content Card */}
        <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Intro & Highlights
            </CardTitle>
            <CardDescription>Configure main banner settings and page title lines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Page Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Page Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Image URL</label>
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Image Hint (Alt Text)</label>
                <Input value={imageHint} onChange={e => setImageHint(e.target.value)} />
              </div>
            </div>

            {/* Badges list */}
            <div className="pt-4 border-t border-border/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">Hero Badges</label>
                <Button size="sm" variant="outline" onClick={handleAddBadge}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Badge
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40">
                    <input
                      value={badge}
                      onChange={e => handleUpdateBadge(i, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs text-foreground font-semibold w-24"
                    />
                    <button type="button" className="text-muted-foreground hover:text-destructive text-xs" onClick={() => handleRemoveBadge(i)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="pt-4 border-t border-border/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">Highlight Metrics</label>
                <Button size="sm" variant="outline" onClick={handleAddHighlight}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Metric
                </Button>
              </div>
              <div className="space-y-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/10">
                    <Input value={h.value} onChange={e => handleUpdateHighlight(i, "value", e.target.value)} placeholder="100%" className="w-20 font-bold" />
                    <Input value={h.label} onChange={e => handleUpdateHighlight(i, "label", e.target.value)} placeholder="Score" className="flex-1" />
                    <Input value={h.detail} onChange={e => handleUpdateHighlight(i, "detail", e.target.value)} placeholder="Detail description..." className="flex-1 hidden md:block" />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveHighlight(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values, Principles & Culture Card */}
        <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Principles & Culture
            </CardTitle>
            <CardDescription>Edit detailed text lists of agency ideals and operational values.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {/* Principles Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Our Principles
              </h4>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Section Title</label>
                  <Input value={principlesTitle} onChange={e => setPrinciplesTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Section Description</label>
                  <Input value={principlesDescription} onChange={e => setPrinciplesDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">List Items</span>
                <Button size="sm" variant="outline" onClick={handleAddPrinciple}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Principle
                </Button>
              </div>
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {principles.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start p-2 rounded-xl border border-border/40 bg-muted/10">
                    <div className="flex-1 space-y-1.5">
                      <Input value={p.title} onChange={e => handleUpdatePrinciple(i, "title", e.target.value)} placeholder="Title" className="h-8 font-semibold" />
                      <Textarea value={p.description} onChange={e => handleUpdatePrinciple(i, "description", e.target.value)} placeholder="Description Details" rows={2} className="text-xs" />
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleRemovePrinciple(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Culture Section */}
            <div className="pt-4 border-t border-border/40 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Team Culture
              </h4>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Culture Title</label>
                  <Input value={cultureTitle} onChange={e => setCultureTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Culture Description</label>
                  <Input value={cultureDescription} onChange={e => setCultureDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">List Items</span>
                <Button size="sm" variant="outline" onClick={handleAddCulture}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Culture Item
                </Button>
              </div>
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {culture.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start p-2 rounded-xl border border-border/40 bg-muted/10">
                    <div className="flex-1 space-y-1.5">
                      <Input value={c.title} onChange={e => handleUpdateCulture(i, "title", e.target.value)} placeholder="Culture Title" className="h-8 font-semibold" />
                      <Textarea value={c.description} onChange={e => handleUpdateCulture(i, "description", e.target.value)} placeholder="Description Details" rows={2} className="text-xs" />
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleRemoveCulture(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
