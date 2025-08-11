import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {children}
      </main>
    </div>
  );
}
