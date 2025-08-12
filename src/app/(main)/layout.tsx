import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <AppSidebar />
      <main className="flex-1/2 mt-16 p-5">{children}</main>
    </Providers>
  );
}
