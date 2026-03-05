import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Race Day | Know Your Finish Line",
  description: "Know your finish time before the race starts. Train, track, and get your projected race day result.",
  openGraph: {
    title: "Race Day | Know Your Finish Line",
    description: "Know your finish time before the race starts. Train, track, and get your projected race day result.",
    url: "https://triraceday.com",
    siteName: "Tri Race Day",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Race Day | Know Your Finish Line",
    description: "Know your finish time before the race starts. Train, track, and get your projected race day result.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      // Adding comment to trigger security scan - this is a test comment and does not affect the code
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <div style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
