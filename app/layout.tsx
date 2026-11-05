import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ase-2420090094.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arqin AI — System Architecture & UML Synthesizer",
    template: "%s | Arqin AI",
  },
  description:
    "Turn natural language system descriptions into exportable UML diagrams, microservice maps, and structural specifications in seconds.",
  keywords: [
    "UML",
    "class diagram",
    "sequence diagram",
    "software architecture",
    "system design",
    "Mermaid",
    "AI synthesis",
    "microservices",
  ],
  authors: [{ name: "Arqin AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Arqin AI",
    title: "Arqin AI — System Architecture & UML Synthesizer",
    description:
      "Turn natural language system descriptions into exportable UML diagrams, microservice maps, and structural specifications in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Arqin AI — System Architecture & UML Synthesizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arqin AI — System Architecture & UML Synthesizer",
    description:
      "Turn natural language system descriptions into exportable UML diagrams, microservice maps, and structural specifications in seconds.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t='dark';var mq=window.matchMedia('(prefers-color-scheme: light)');var sys=mq.matches?'light':'dark';for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.startsWith('arqin_')&&k.endsWith('_settings')){try{var s=JSON.parse(localStorage.getItem(k)||'{}');if(s&&s.theme){if(s.theme==='system'){t=sys;}else{t=s.theme;}break;}}catch(e){}}}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#D6AD69",
            } as Record<string, string>,
          }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}