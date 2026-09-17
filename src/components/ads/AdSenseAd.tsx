"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseAdProps = {
  adSlot: string;
  className?: string;
  variant?: "in-article" | "banner";
};

const ADSENSE_SCRIPT_SELECTOR =
  'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

function loadAdSenseScript(client: string) {
  const existing = document.querySelector<HTMLScriptElement>(ADSENSE_SCRIPT_SELECTOR);
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("AdSense script failed to load"));
    document.head.appendChild(script);
  });
}

function waitUntilVisible(element: Element) {
  if (element.getBoundingClientRect().width > 0) {
    const opacity = Number(getComputedStyle(element).opacity);
    if (opacity > 0) return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          observer.disconnect();
          resolve();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(element);
    window.setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 1500);
  });
}

export function AdSenseAd({
  adSlot,
  className,
  variant = "banner",
}: AdSenseAdProps) {
  const [isClient, setIsClient] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [adStatus, setAdStatus] = useState<"pending" | "filled" | "unfilled">("pending");
  const pushedRef = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

  useEffect(() => {
    setIsClient(true);
    setShowDebug(new URLSearchParams(window.location.search).get("adsdebug") === "1");
  }, []);

  useEffect(() => {
    if (!isClient || !client || !adSlot || pushedRef.current) return;
    const ins = insRef.current;
    if (!ins) return;

    let cancelled = false;
    const notes: string[] = [
      `client: ${client}`,
      `slot: ${adSlot}`,
      `variant: ${variant}`,
    ];

    Promise.all([loadAdSenseScript(client), waitUntilVisible(ins)])
      .then(() => {
        if (cancelled || pushedRef.current || !insRef.current) return;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
        notes.push("script: loaded");
        notes.push("push: called");
        window.setTimeout(() => {
          const node = insRef.current;
          if (!node) return;
          const status = node.getAttribute("data-adsbygoogle-status") || "none";
          const iframe = node.querySelector("iframe");
          const rect = node.getBoundingClientRect();
          notes.push(`status: ${status}`);
          notes.push(`ad-status: ${node.getAttribute("data-ad-status") || "none"}`);
          notes.push(`size: ${Math.round(rect.width)}x${Math.round(rect.height)}`);
          notes.push(`iframe: ${iframe ? "yes" : "no"}`);
          setDebugInfo([...notes]);
          setAdStatus(
            node.getAttribute("data-ad-status") === "unfilled" ? "unfilled" : "filled"
          );
        }, 1200);
      })
      .catch((error) => {
        pushedRef.current = false;
        notes.push(`error: ${error instanceof Error ? error.message : "failed"}`);
        setDebugInfo([...notes]);
      });

    return () => {
      cancelled = true;
    };
  }, [adSlot, client, isClient, variant]);

  useEffect(() => {
    const node = insRef.current;
    if (!node) return;

    const updateStatus = () => {
      const status = node.getAttribute("data-ad-status");
      if (status === "unfilled") setAdStatus("unfilled");
      if (status === "filled") setAdStatus("filled");
    };

    updateStatus();
    const observer = new MutationObserver(updateStatus);
    observer.observe(node, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => observer.disconnect();
  }, [isClient, adSlot]);

  if (!isClient) return null;

  if (!client || !adSlot) {
    if (!showDebug) return null;
    return (
      <aside className="not-prose my-6 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-[11px]">
        AdSense skipped: client={client || "missing"} slot={adSlot || "missing"}
      </aside>
    );
  }

  const isBanner = variant === "banner";

  return (
    <aside
      className={cn(
        "not-prose my-6 w-full",
        isBanner ? "flex justify-center" : "mx-auto max-w-lg",
        adStatus === "unfilled" && !showDebug ? "hidden" : null,
        className
      )}
    >
      {showDebug ? (
        <pre className="mb-2 overflow-x-auto rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] leading-5 text-foreground">
          {debugInfo.join("\n") || "AdSense debug waiting…"}
        </pre>
      ) : null}
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={
          isBanner
            ? { display: "inline-block", width: 300, height: 250 }
            : { display: "block", width: "100%" }
        }
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format={isBanner ? "rectangle" : "auto"}
        data-full-width-responsive={isBanner ? "false" : "true"}
      />
    </aside>
  );
}
