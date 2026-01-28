import "./globals.css";
import { Inter } from "next/font/google";
import { GlobalProviders } from "@/components/providers";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "CRM System",
    template: "%s | CRM System",
  },
  description: "Modern CRM system for managing contacts, deals, and tasks",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
