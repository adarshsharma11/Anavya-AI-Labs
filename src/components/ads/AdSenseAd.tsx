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
};

const ADSENSE_SCRIPT_SELECTOR =
  'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

function loadAdSenseScript(client: string) {
  const existing = document.querySelector<HTMLScriptElement>(ADSENSE_SCRIPT_SELECTOR);
  if (existing) {
    if (existing.dataset.loaded === "true" || window.adsbygoogle) {
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

export function AdSenseAd({ adSlot, className }: AdSenseAdProps) {
  const [isClient, setIsClient] = useState(false);
  const pushedRef = useRef(false);
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !client || !adSlot || pushedRef.current) return;

    let cancelled = false;

    loadAdSenseScript(client)
      .then(() => {
        if (cancelled || pushedRef.current) return;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      })
      .catch(() => {
        pushedRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [adSlot, client, isClient]);

  if (!isClient || !client || !adSlot) return null;

  return (
    <aside className={cn("not-prose my-5 mx-auto w-full max-w-xl", className)}>
      {isDev ? (
        <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
          AdSense unit {adSlot} — Google usually will not fill ads on localhost
        </p>
      ) : null}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: 90 }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
    </aside>
  );
}
