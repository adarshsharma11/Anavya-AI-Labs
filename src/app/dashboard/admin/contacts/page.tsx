"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getContactsApi, updateContactStatusApi, deleteContactApi } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2, AlertCircle, Trash2, Eye, Reply } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      const res = await getContactsApi();
      if (res && res.success) {
        setContacts(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch contact requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    let nextStatus = "read";
    if (currentStatus === "read") nextStatus = "replied";
    else if (currentStatus === "replied") nextStatus = "pending";

    try {
      const res = await updateContactStatusApi(id, nextStatus);
      if (res && res.success) {
        toast({
          title: "Status Updated",
          description: `Status changed to ${nextStatus}`,
        });
        setContacts((prev: any[]) =>
          prev.map(c => (c.id === id ? { ...c, status: nextStatus } : c))
        );
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact((prev: any) => prev ? { ...prev, status: nextStatus } : null);
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact request?")) return;
    try {
      const res = await deleteContactApi(id);
      if (res && res.success) {
        toast({
          title: "Deleted",
          description: "Contact request deleted successfully.",
        });
        setContacts((prev: any[]) => prev.filter(c => c.id !== id));
        setSelectedContact(null);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete request.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "replied":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Replied</Badge>;
      case "read":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20">Read</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Contact Requests</h3>
          <p className="text-muted-foreground mt-1">Manage and respond to messages submitted via Contact Us form.</p>
        </div>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Submissions ({contacts.length})
          </CardTitle>
          <CardDescription>Click a submission to view full details and change status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-20" />
              No contact requests received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-medium text-left">
                    <th className="pb-3 pl-2">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {contacts.map(c => (
                    <tr key={c.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="py-3.5 pl-2 font-medium text-foreground">{c.name}</td>
                      <td className="py-3.5 text-muted-foreground">{c.email}</td>
                      <td className="py-3.5 text-foreground max-w-[200px] truncate">{c.subject}</td>
                      <td className="py-3.5">{getStatusBadge(c.status)}</td>
                      <td className="py-3.5 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setSelectedContact(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleUpdateStatus(c.id, c.status)}>
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        {selectedContact && (
          <DialogContent className="border-border/60 bg-background/95 backdrop-blur max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="text-xl font-bold">{selectedContact.subject}</DialogTitle>
                {getStatusBadge(selectedContact.status)}
              </div>
              <DialogDescription>
                From <span className="font-semibold text-foreground">{selectedContact.name}</span> ({selectedContact.email}) on {new Date(selectedContact.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 p-4 rounded-xl border border-border/60 bg-muted/30 text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {selectedContact.message}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-4 mt-2">
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(selectedContact.id, selectedContact.status)}>
                Mark as {selectedContact.status === "pending" ? "Read" : selectedContact.status === "read" ? "Replied" : "Pending"}
              </Button>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedContact.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setSelectedContact(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
