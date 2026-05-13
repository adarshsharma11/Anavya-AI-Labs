import type React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export function Logo(props: React.HTMLAttributes<HTMLDivElement>) {
  const logo = siteConfig.logo;
  const showName = logo?.showName ?? true;
  const logoAlt = logo?.alt ?? siteConfig.name;
  const width = logo?.width ?? 28;
  const height = logo?.height ?? 28;
  const lightSrc = logo?.lightSrc || logo?.src;
  const darkSrc = logo?.darkSrc;
  const useThemeSources = typeof lightSrc === "string" && typeof darkSrc === "string";
  const darkSrcValue = useThemeSources ? darkSrc : undefined;
  const isSvg = Boolean(lightSrc && lightSrc.toLowerCase().endsWith(".svg"));

  return (
    <div className="flex items-center gap-2" {...props}>
      {lightSrc ? (
        useThemeSources ? (
          <>
            {isSvg ? (
              <img
                src={lightSrc}
                alt={logoAlt}
                width={width}
                height={height}
                className="h-14 w-14 object-contain dark:hidden"
              />
            ) : (
              <Image
                src={lightSrc}
                alt={logoAlt}
                width={width}
                height={height}
                className="h-14 w-14 object-contain dark:hidden"
                priority
              />
            )}
            {darkSrcValue && darkSrcValue.toLowerCase().endsWith(".svg") ? (
              <img
                src={darkSrcValue}
                alt={logoAlt}
                width={width}
                height={height}
                className="hidden h-14 w-14 object-contain dark:block"
              />
            ) : (
              <Image
                src={darkSrcValue || lightSrc}
                alt={logoAlt}
                width={width}
                height={height}
                className="hidden h-14 w-14 object-contain dark:block"
                priority
              />
            )}
          </>
        ) : isSvg ? (
          <img
            src={lightSrc}
            alt={logoAlt}
            width={width}
            height={height}
            className="h-14 w-14 object-contain dark:brightness-0 dark:invert"
          />
        ) : (
          <Image
            src={lightSrc}
            alt={logoAlt}
            width={width}
            height={height}
            className="h-14 w-14 object-contain dark:brightness-0 dark:invert"
            priority
          />
        )
      ) : (
        <svg
          className="h-14 w-14 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 7L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 7L12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 4.5L7 9.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {showName ? (
        <span className="font-headline text-lg font-bold leading-none">
          {siteConfig.name}
        </span>
      ) : null}
    </div>
  );
}
