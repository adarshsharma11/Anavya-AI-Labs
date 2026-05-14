"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Mail, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { submitContact } from "@/lib/api/contact";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await submitContact(data);
      
      if (res.success) {
        toast({
          title: "Message Sent!",
          description: "We've received your message and will get back to you shortly.",
        });
        form.reset();
      } else {
        throw new Error(res.message || "Failed to send message");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: error.message || "There was an error sending your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background gradients matching scanner vibe */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our AI tools, need custom enterprise features, or just want to say hi? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="border-border/60 bg-background/80 backdrop-blur shadow-xl h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a href="mailto:support@anavyaailabs.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          support@anavyaailabs.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-full text-primary">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Live Support</p>
                        <p className="text-sm text-muted-foreground">Available 9am - 5pm IST</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/60">
                  <h4 className="font-medium mb-2">Need an enterprise plan?</h4>
                  <p className="text-sm text-muted-foreground">
                    Contact us directly to discuss custom scanning volume, API access, and white-labeling solutions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/60 bg-background/80 backdrop-blur shadow-xl">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="bg-background/50 border-border/60"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-background/50 border-border/60"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      className="bg-background/50 border-border/60"
                      {...form.register("subject")}
                    />
                    {form.formState.errors.subject && (
                      <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your inquiry in detail..."
                      className="min-h-[150px] bg-background/50 border-border/60 resize-y"
                      {...form.register("message")}
                    />
                    {form.formState.errors.message && (
                      <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full shadow-lg shadow-primary/20"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}