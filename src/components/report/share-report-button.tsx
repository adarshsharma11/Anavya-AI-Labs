"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function shareReportUrl(publicId: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://anavyaailabs.com";
  return `${origin}/scanner?id=${publicId}`;
}

export function ShareReportButton({ publicId }: { publicId: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    const url = shareReportUrl(publicId);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this report link", url);
    }
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Anyone with this URL can open the free audit.",
    });
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" onClick={() => void copy()} aria-live="polite">
      {copied ? (
        <Check className="mr-2 h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <Link2 className="mr-2 h-4 w-4" aria-hidden />
      )}
      {copied ? "Link copied" : "Share link"}
    </Button>
  );
}
