"use client";

export default function WelcomeSection({ name }: { name?: string | null }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {name || "User"}!
      </h1>
      <p className="text-gray-600 mt-2">
        Here&apos;s what&apos;s happening with your CRM today.
      </p>
    </div>
  );
}
