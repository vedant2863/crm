import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 px-6 py-6 overflow-y-auto bg-background/50">
          <div className="w-full flex-1 flex flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}
