import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard">
      <p className="text-blue-700 font-bold text-lg">CRM System</p>
    </Link>
  );
}
