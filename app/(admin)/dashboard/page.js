"use client";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>Tổng</span>
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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Tổng người dùng" value={stats?.totalUsers} icon="👥"
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
        <StatCard label="Tổng bài viết" value={stats?.totalPosts} icon="📝"
          color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" />
        <StatCard label="Báo cáo chờ xử lý" value={stats?.totalReports} icon="🚨"
          color="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" />
        <StatCard label="Người dùng mới hôm nay" value={stats?.newUsersToday} icon="🆕"
          color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-sm mb-4 text-gray-700 dark:text-gray-300">
            📊 Bài viết 7 ngày gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.postsLast7Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Bài viết" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-sm mb-4 text-gray-700 dark:text-gray-300">
            👤 Người dùng mới 7 ngày gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats?.usersLast7Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Người dùng"
                stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-semibold text-sm mb-4 text-gray-700 dark:text-gray-300">
          🏷️ Top 5 hashtag trending
        </h3>
        <div className="space-y-3">
          {(stats?.topHashtags || []).length === 0 && (
            <p className="text-sm text-gray-400">Chưa có hashtag nào</p>
          )}
          {(stats?.topHashtags || []).map((h, i) => (
            <div key={h.name} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-gray-100 text-gray-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-500'}`}>
                {i + 1}
              </span>
              <span className="text-sm font-medium flex-1 text-gray-900 dark:text-white">
                #{h.name}
              </span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(100, (h.postCount / (stats.topHashtags[0]?.postCount || 1)) * 100)}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {h.postCount} bài
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
