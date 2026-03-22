"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Stats {
  totalReadings: number;
  todayReadings: number;
  totalUsers: number;
  estimatedCost: number;
  last7Days: { date: string; count: number }[];
  topTopics: { name: string; count: number }[];
  topSpreads: { name: string; count: number }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const maxDayCount = stats ? Math.max(...stats.last7Days.map((d) => d.count), 1) : 1;

  return (
    <div className="flex">
      <AdminNav />
      <main className="flex-1 ml-56 p-8">
        <h2 className="text-xl font-semibold mb-6">แดชบอร์ด</h2>

        {loading ? (
          <div className="flex items-center gap-3 text-white/30">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            กำลังโหลด...
          </div>
        ) : !stats ? (
          <p className="text-white/40">ไม่สามารถโหลดข้อมูลได้</p>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="คำทำนายทั้งหมด" value={stats.totalReadings.toLocaleString()} />
              <StatCard label="วันนี้" value={stats.todayReadings.toLocaleString()} />
              <StatCard label="ผู้ใช้ทั้งหมด" value={stats.totalUsers.toLocaleString()} />
              <StatCard label="ค่าใช้จ่ายโดยประมาณ" value={`$${stats.estimatedCost.toFixed(2)}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-sm text-white/50 mb-5">7 วันล่าสุด</h3>
                <div className="flex items-end gap-3 h-40">
                  {stats.last7Days.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-white/40">{day.count}</span>
                      <div
                        className="w-full bg-gold/20 rounded-t-md transition-all"
                        style={{
                          height: `${(day.count / maxDayCount) * 100}%`,
                          minHeight: day.count > 0 ? "4px" : "0px",
                        }}
                      />
                      <span className="text-[10px] text-white/30">
                        {new Date(day.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Topics & Spreads */}
              <div className="space-y-6">
                <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-sm text-white/50 mb-4">หัวข้อยอดนิยม</h3>
                  <div className="space-y-3">
                    {stats.topTopics.length === 0 && (
                      <p className="text-white/20 text-sm">ยังไม่มีข้อมูล</p>
                    )}
                    {stats.topTopics.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70 truncate mr-3">{t.name}</span>
                        <span className="text-gold text-xs font-mono">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-sm text-white/50 mb-4">การ์ดยอดนิยม</h3>
                  <div className="space-y-3">
                    {stats.topSpreads.length === 0 && (
                      <p className="text-white/20 text-sm">ยังไม่มีข้อมูล</p>
                    )}
                    {stats.topSpreads.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70 truncate mr-3">{s.name}</span>
                        <span className="text-gold text-xs font-mono">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0c0d14] border border-white/[0.06] rounded-xl p-5">
      <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">{label}</p>
      <p className="text-gold text-2xl font-semibold">{value}</p>
    </div>
  );
}
