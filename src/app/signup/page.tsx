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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { signupApi, verifyOtpApi } from "@/lib/api/auth";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

// Signup Schema
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name is too short" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Invalid email format" }),
  phoneNumber: z.string().min(10, { message: "Invalid phone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});
type SignupFormValues = z.infer<typeof signupSchema>;

// OTP Schema
const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be exactly 6 digits" }).max(6),
});
type OtpFormValues = z.infer<typeof otpSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", username: "", email: "", phoneNumber: "", password: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmitSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await signupApi(values);
      if (response && response.success) {
        toast({ title: "OTP Sent!", description: "Please check your email to verify your account." });
        setRegisteredEmail(values.email);
        setShowOtpDialog(true);
      } else {
        toast({ variant: "destructive", title: "Signup Failed", description: response.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create account." });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtp = async (values: OtpFormValues) => {
    setIsLoading(true);
    try {
      const response = await verifyOtpApi(registeredEmail, values.otp);
      if (response && response.success) {
        toast({ title: "Account Verified!", description: "You can now log in." });
        setShowOtpDialog(false);
        router.push("/login"); // Push to login on successful verification
      } else {
        toast({ variant: "destructive", title: "Verification Failed", description: response.message });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "OTP verification failed." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <Card className="w-full max-w-lg shadow-lg border-2">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-base">
            Get started with Anavya AI Labs today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmitSignup)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="johndoe123" {...form.register("username")} />
                {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" placeholder="9876543210" {...form.register("phoneNumber")} />
                {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  {...form.register("password")} 
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-4 text-md h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground pt-4 border-t">
          Already have an account?{" "}
          <Link href="/login" className="ml-1 font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your Email</DialogTitle>
            <DialogDescription>
              We sent a 6-digit verification code to <span className="font-semibold text-foreground">{registeredEmail}</span>. Enter it below to activate your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-6">
            <div className="space-y-2 mt-4 text-center">
              <Input 
                id="otp" 
                className="text-center text-2xl tracking-[0.5em] h-14" 
                maxLength={6} 
                placeholder="------" 
                {...otpForm.register("otp")} 
              />
              {otpForm.formState.errors.otp && <p className="text-sm text-destructive text-left">{otpForm.formState.errors.otp.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowOtpDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
