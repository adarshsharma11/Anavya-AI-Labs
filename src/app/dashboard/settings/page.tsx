"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { updateProfileApi } from "@/lib/api/dashboard";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
    <div className="space-y-6 lg:py-8 max-w-2xl">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Profile & Branding</h3>
        <p className="text-muted-foreground">Manage your personal information and PDF branding preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>White-label PDF Configuration</CardTitle>
          <CardDescription>
            These details will appear across your generated PDF audit reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...form.register("phoneNumber")} />
                {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Agency Name</Label>
              <Input id="companyName" placeholder="Anavya AI Labs" {...form.register("companyName")} />
              {form.formState.errors.companyName && <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLogoUrl">Company Logo URL</Label>
              <Input id="companyLogoUrl" placeholder="https://example.com/logo.png" {...form.register("companyLogoUrl")} />
              <p className="text-xs text-muted-foreground">Must be a public image link. This will be embedded in your PDF reports.</p>
              {form.formState.errors.companyLogoUrl && <p className="text-sm text-destructive">{form.formState.errors.companyLogoUrl.message}</p>}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
