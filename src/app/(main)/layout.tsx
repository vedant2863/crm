import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import '../globals.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <Navbar />
      <AppSidebar />
      <main className="flex-1 mt-16 p-5 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col bg-background/50">
        {children}
      </main>
    </SidebarProvider>
  );
}
