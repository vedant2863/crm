import { ReactNode } from "react";
import Logo from "@/components/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Premium Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
        <div className="mb-10 scale-125">
          <Logo />
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

