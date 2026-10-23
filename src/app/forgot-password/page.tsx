"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { forgotPasswordApi } from "@/lib/api/auth";

const forgotSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    try {
      const response = await forgotPasswordApi(values.email);
      if (response && response.success) {
        const isDev = process.env.NODE_ENV === "development";
        toast({
          title: "Check your email",
          description:
            isDev && response.otp
              ? `(Dev) Your OTP is: ${response.otp}`
              : "If that email exists, a reset link was sent.",
        });
        if (isDev) {
          setTimeout(() => {
            router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
          }, 2000);
        }
      } else {
        toast({
          title: "Check your email",
          description: "If that email exists, a reset link was sent.",
        });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to request password reset." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <Card className="w-full max-w-lg shadow-lg border-2">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription className="text-base">
            Enter your email. If that account exists, we will send a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            
            <Button type="submit" className="w-full text-md h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>Send reset link <ArrowRight className="ml-2 h-5 w-5" /></>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground pt-4 border-t">
          Remember your password?{" "}
          <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
