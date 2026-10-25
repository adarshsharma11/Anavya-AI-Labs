"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function shareReportUrl(publicId: string, path = "/scanner") {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://anavyaailabs.com";
  return `${origin}${path}?id=${publicId}`;
}

export function ShareReportButton({
  publicId,
  path = "/scanner",
  label = "Copy URL",
  copiedLabel = "URL copied",
  description = "Anyone with this URL can open the report.",
}: {
  publicId: string;
  path?: string;
  label?: string;
  copiedLabel?: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    const url = shareReportUrl(publicId, path);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this report URL", url);
    }
    setCopied(true);
    toast({
      title: "URL copied",
      description,
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
      {copied ? copiedLabel : label}
    </Button>
  );
}
