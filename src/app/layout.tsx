import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { siteConfig, pageMetadata } from '@/config/site';
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
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: siteConfig.name,
    title: pageMetadata.home.title,
    description: pageMetadata.home.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} – AI-Powered Website Analysis`,
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
    'author': 'Anavya AI Labs',
    'publish-date': '2026-01-01',
    'last-modified': '2026-08-10',
    'article:published_time': '2026-01-01T00:00:00Z',
    'article:modified_time': '2026-08-10T00:00:00Z',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://anavyaailabs.com/#organization",
      "name": "Anavya AI Labs",
      "url": "https://anavyaailabs.com/",
      "logo": "https://anavyaailabs.com/logo.svg",
      "description": "Premium AI-powered website analysis and SEO auditing tools."
    },
    {
      "@type": "WebSite",
      "@id": "https://anavyaailabs.com/#website",
      "url": "https://anavyaailabs.com/",
      "name": "Anavya AI Labs",
      "publisher": {
        "@id": "https://anavyaailabs.com/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://anavyaailabs.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Anavya AI Labs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Anavya AI Labs is a premium AI-powered website analysis platform that provides detailed performance, SEO, accessibility, security, and Generative Engine Optimization (GEO) audits."
          }
        },
        {
          "@type": "Question",
          "name": "How does the website scanner work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our scanner analyzes your public URLs to retrieve key structural elements, schema metadata, speed metrics, and AI discoverability tags to generate a comprehensive optimization score."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html lang="en" suppressHydrationWarning>
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
              <div className="relative flex min-h-dvh flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
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
