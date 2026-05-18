"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { resetPasswordApi } from "@/lib/api/auth";

const resetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().min(6, { message: "OTP must be at least 6 characters" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: emailParam || "", otp: "", newPassword: "" },
  });

  useEffect(() => {
    if (emailParam) {
      form.setValue("email", emailParam);
    }
  }, [emailParam, form]);

  const onSubmit = async (values: ResetFormValues) => {
    setIsLoading(true);
    try {
      const response = await resetPasswordApi(values);
      if (response && response.success) {
        toast({ title: "Success!", description: "Password reset successfully. You can now log in." });
        setTimeout(() => {
            router.push("/login");
        }, 1500);
      } else {
        toast({ variant: "destructive", title: "Failed", description: response?.message || "Invalid OTP or request." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reset password." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-lg border-2">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription className="text-base">
          Enter the OTP sent to your email and your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input id="otp" type="text" placeholder="123456" {...form.register("otp")} />
            {form.formState.errors.otp && <p className="text-sm text-destructive">{form.formState.errors.otp.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                {...form.register("newPassword")} 
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.newPassword && <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full text-md h-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
