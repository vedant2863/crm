import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CRM System",
  description: "Modern CRM system for managing contacts, deals, and tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" 
    data-darkreader-mode="dynamic"
    data-darkreader-scheme="dark"
    data-darkreader-proxy-injected="true"
    className="hydrated"
>
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
