import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import '../globals.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Navbar />
      <AppSidebar />
      <main className="flex-1/2 mt-16 p-5">{children}</main>
    </SidebarProvider>
  );
}
