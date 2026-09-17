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
  const pushedRef = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !client || !adSlot || pushedRef.current) return;
    const ins = insRef.current;
    if (!ins) return;

    let cancelled = false;

    Promise.all([loadAdSenseScript(client), waitUntilVisible(ins)])
      .then(() => {
        if (cancelled || pushedRef.current || !insRef.current) return;
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

  const isBanner = variant === "banner";

  return (
    <aside
      className={cn(
        "not-prose my-6 w-full",
        isBanner ? "flex justify-center" : "mx-auto max-w-lg",
        className
      )}
    >
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
