'use client'
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Logo() {
  const { data: session } = useSession();

  return (
    <Link href={session ? "/dashboard" : "/"} className="group transition-all duration-300 hover:scale-105 active:scale-95">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="absolute inset-0 bg-primary blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <span className="text-primary-foreground font-black text-xl italic tracking-tighter">C</span>
          </div>
        </div>
        <div className="flex flex-col -gap-1">
          <span className="text-xl font-black tracking-tighter leading-none">CRM<span className="text-primary">OS</span></span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">Enterprise</span>
        </div>
      </div>
    </Link>
  );
}

