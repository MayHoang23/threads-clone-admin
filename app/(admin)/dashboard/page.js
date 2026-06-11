"use client";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>Hôm nay</span>
    </div>
    <div className="text-3xl font-bold mb-1">{value ?? "—"}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI("/admin/stats").then(data => {
      if (data?.success) setStats(data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Đang tải...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng người dùng" value={stats?.totalUsers} icon="👥" color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
        <StatCard label="Tổng bài viết" value={stats?.totalPosts} icon="📝" color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" />
        <StatCard label="Báo cáo chờ xử lý" value={stats?.totalReports} icon="🚨" color="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" />
        <StatCard label="Người dùng mới hôm nay" value={stats?.newUsersToday} icon="🆕" color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
      </div>
    </div>
  );
}
