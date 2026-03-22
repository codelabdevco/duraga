import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — สัมผัส ดีวาย" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#08090e] text-white">{children}</div>;
}
