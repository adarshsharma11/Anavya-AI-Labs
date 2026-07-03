"use client";

import React, { useEffect, useState } from "react";
import { getBlogsApi, BlogPost } from "@/lib/api/blogs";
import { createBlogApi, updateBlogApi, deleteBlogApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Edit, Tag, User, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [readTime, setReadTime] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [authorRole, setAuthorRole] = useState<string>("");
  const [authorAvatar, setAuthorAvatar] = useState<string>("https://api.dicebear.com/7.x/initials/svg?seed=Anavya");

  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      const res = await getBlogsApi();
      if (res && res.success) {
        setBlogs(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch blogs list.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateDialog = () => {
    setEditingBlog(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("");
    setImage("");
    setTags("");
    setReadTime("");
    setAuthorName("");
    setAuthorRole("");
    setAuthorAvatar("https://api.dicebear.com/7.x/initials/svg?seed=Anavya");
    setEditorOpen(true);
  };

  const openEditDialog = (blog: any) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(Array.isArray(blog.content) ? blog.content.join("\n\n") : blog.content);
    setCategory(blog.category);
    setImage(blog.image);
    setTags(Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "");
    setReadTime(blog.readTime);
    setAuthorName(blog.authorName);
    setAuthorRole(blog.authorRole);
    setAuthorAvatar(blog.authorAvatar);
    setEditorOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !excerpt || !content) {
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
      excerpt,
      content: content.split("\n\n").map(p => p.trim()).filter(Boolean),
      category,
      image,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      readTime,
      authorName,
      authorRole,
      authorAvatar,
      date: new Date().toISOString().substring(0, 10),
    };

    try {
      if (editingBlog) {
        // Update
        const res = await updateBlogApi(editingBlog.slug, payload);
        if (res && res.success) {
          toast({
            title: "Success",
            description: "Blog post updated successfully.",
          });
          fetchBlogs();
          setEditorOpen(false);
        }
      } else {
        // Create
        const res = await createBlogApi(payload);
        if (res && res.success) {
          toast({
            title: "Success",
            description: "Blog post created successfully.",
          });
          fetchBlogs();
          setEditorOpen(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save blog post.",
      });
    }
  };

  const handleDeleteBlog = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await deleteBlogApi(slug);
      if (res && res.success) {
        toast({
          title: "Deleted",
          description: "Blog post deleted successfully.",
        });
        setBlogs(prev => prev.filter(b => b.slug !== slug));
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete blog post.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Manage Blogs</h3>
          <p className="text-muted-foreground mt-1">Publish and edit informational articles for the website audience.</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Blog Post
        </Button>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Published Articles ({blogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              No blog posts created yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {blogs.map(b => (
                <div key={b.id} className="relative flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-border/60 bg-background/60 hover:border-border/100 transition-all group">
                  {b.image && (
                    <div className="relative h-28 w-full md:w-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20">{b.category}</Badge>
                      <span className="text-[10px] text-muted-foreground">{b.readTime}</span>
                    </div>
                    <h4 className="font-bold text-foreground truncate">{b.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.excerpt}</p>
                    <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        {b.authorName}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEditDialog(b)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteBlog(b.slug)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="border-border/60 bg-background/95 backdrop-blur max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              Provide meta details, images, and paragraph blocks. Separate paragraphs with double newlines.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveBlog} className="space-y-4 my-2 text-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Title *</label>
                <Input value={title} onChange={e => {
                  setTitle(e.target.value);
                  if (!editingBlog) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }} placeholder="Blog Title" required />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Slug (URL identifier) *</label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="blog-title-slug" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Excerpt (Brief Summary) *</label>
              <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Write a short summary..." rows={2} required />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Content (Markdown/Paragraphs) *</label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write the main blog content here. Use double newlines for new paragraphs." rows={6} required />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Category
                </label>
                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. SEO" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" /> Cover Image URL
                </label>
                <Input value={image} onChange={e => setImage(e.target.value)} placeholder="Cover Image URL" />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Read Time</label>
                <Input value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 border-t border-border/40 pt-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Author Name</label>
                <Input value={authorName} onChange={e => setAuthorName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Author Role</label>
                <Input value={authorRole} onChange={e => setAuthorRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Tags (comma separated)</label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="SEO, Performance" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBlog ? "Save Changes" : "Publish Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
