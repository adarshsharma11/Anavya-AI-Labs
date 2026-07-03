"use client";

import React, { useEffect, useState } from "react";
import { getAdminUsersApi, deleteAdminUserApi } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, Globe, Shield, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsersApi();
      if (res && res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users list.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number, role: string) => {
    if (role === "admin") {
      toast({
        variant: "destructive",
        title: "Forbidden",
        description: "Admin accounts cannot be deleted.",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this user? All their references will be cleared, and their scans will be anonymized.")) return;

    try {
      const res = await deleteAdminUserApi(id);
      if (res && res.success) {
        toast({
          title: "User Deleted",
          description: "User account deleted successfully.",
        });
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete user.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Registered Users & Usage</h3>
        <p className="text-muted-foreground mt-1">Monitor registered customer accounts, view their scanning usages, and manage accounts.</p>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Users List ({users.length})
          </CardTitle>
          <CardDescription>View user roles, contact information, and exact scan counts completed across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted/40" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              No users registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-medium text-left">
                    <th className="pb-3 pl-2">User Details</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3 text-center">Scan Usage</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Registered</th>
                    <th className="pb-3 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="font-semibold text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">@{u.username || "n/a"}</div>
                      </td>
                      <td className="py-3.5">
                        <div className="text-foreground">{u.email}</div>
                        {u.phoneNumber && <div className="text-xs text-muted-foreground">{u.phoneNumber}</div>}
                      </td>
                      <td className="py-3.5">
                        {u.companyName ? (
                          <div>
                            <span className="text-foreground">{u.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-xs font-semibold text-sky-600">
                          <Globe className="h-3.5 w-3.5" />
                          {u.scanCount} scan{u.scanCount !== 1 && "s"}
                        </div>
                      </td>
                      <td className="py-3.5">
                        {u.role === "admin" ? (
                          <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 flex items-center gap-1 w-fit">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">User</Badge>
                        )}
                      </td>
                      <td className="py-3.5 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        {u.role !== "admin" ? (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(u.id, u.role)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic px-2">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
