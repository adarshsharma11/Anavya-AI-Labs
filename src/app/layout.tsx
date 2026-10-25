import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppChrome } from '@/components/layout/app-chrome';
import { env } from '@/env';
import { siteConfig, pageMetadata, toCanonicalUrl } from '@/config/site';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: pageMetadata.home.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: pageMetadata.home.description,
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg" }],
  },
  alternates: {
    canonical: toCanonicalUrl('/'),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: toCanonicalUrl('/'),
    siteName: siteConfig.name,
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
          alt: `${siteConfig.name} – Free AI website scanner and GEO audit`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    images: ['/og-image.png'],
  },
  other: {
    author: 'Anavya AI Labs',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: `${siteConfig.url}/`,
      logo: `${siteConfig.url}/logo.svg`,
      description: siteConfig.description,
      sameAs: [siteConfig.linkedin, siteConfig.x],
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: `${siteConfig.url}/`,
      name: siteConfig.name,
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleAnalyticsId = env.googleAnalyticsId;
  const googleAdsId = env.googleAdsId;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {googleAdsId ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsId}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          spaceGrotesk.variable
        )}
      >
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              <AppChrome>{children}</AppChrome>
              <Toaster />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
