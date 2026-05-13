"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { updateProfileApi } from "@/lib/api/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short").optional(),
  phoneNumber: z.string().optional(),
  companyName: z.string().optional(),
  companyLogoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, fetchProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      companyName: "",
      companyLogoUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        companyName: user.companyName || "",
        companyLogoUrl: user.companyLogoUrl || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const response = await updateProfileApi(values);
      if (response && response.success) {
        toast({ title: "Success", description: "Profile updated successfully." });
        await fetchProfile(); // Refresh context
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: response.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update profile." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl"
    >
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Profile & Branding</h3>
        <p className="text-muted-foreground mt-1">Manage your personal information and PDF branding preferences.</p>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-lg backdrop-blur overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 pb-6">
          <CardTitle className="text-lg">White-label PDF Configuration</CardTitle>
          <CardDescription>
            These details will appear across your generated PDF audit reports to showcase your brand.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input 
                  id="name" 
                  className="bg-background/50 border-border/60 focus-visible:ring-primary/20" 
                  {...form.register("name")} 
                />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  className="bg-background/50 border-border/60 focus-visible:ring-primary/20" 
                  {...form.register("phoneNumber")} 
                />
                {form.formState.errors.phoneNumber && <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">Company / Agency Name</Label>
              <Input 
                id="companyName" 
                placeholder="Anavya AI Labs" 
                className="bg-background/50 border-border/60 focus-visible:ring-primary/20" 
                {...form.register("companyName")} 
              />
              {form.formState.errors.companyName && <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLogoUrl" className="text-sm font-medium">Company Logo URL</Label>
              <Input 
                id="companyLogoUrl" 
                placeholder="https://example.com/logo.png" 
                className="bg-background/50 border-border/60 focus-visible:ring-primary/20" 
                {...form.register("companyLogoUrl")} 
              />
              <p className="text-xs text-muted-foreground">Must be a public image link. This will be embedded in your PDF reports.</p>
              {form.formState.errors.companyLogoUrl && <p className="text-xs text-destructive">{form.formState.errors.companyLogoUrl.message}</p>}
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/20 min-w-[140px]">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
