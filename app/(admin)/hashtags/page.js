"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

const countBadge = (n) => {
  if (n > 10) return "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  if (n >= 1) return "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
  return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
};

export default function HashtagsPage() {
  const [hashtags, setHashtags] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [top, setTop] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchHashtags = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page, limit: 20, search }).toString();
    const data = await fetchAPI(`/admin/hashtags?${qs}`);
    if (data?.success) { setHashtags(data.data.hashtags); setTotal(data.data.total); }
    setLoading(false);
  }, [page, search]);

  const fetchTop = useCallback(async () => {
    const data = await fetchAPI("/admin/hashtags/top");
    if (data?.success) setTop(data.data);
  }, []);

  useEffect(() => { fetchHashtags(); }, [fetchHashtags]);
  useEffect(() => { fetchTop(); }, [fetchTop]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Xóa hashtag #${name}?`)) return;
    const data = await fetchAPI(`/admin/hashtags/${id}`, { method: "DELETE" });
    if (data?.success) { showToast(data.message || "Đã xóa hashtag"); fetchHashtags(); fetchTop(); }
    else showToast(data?.message || "Lỗi");
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm z-50 shadow">{toast}</div>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Hashtag <span className="text-gray-400 text-lg font-normal">({total})</span></h2>
      </div>

      {/* Top 10 Trending */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">🔥 Top 10 Trending</h3>
        {top.length === 0 ? (
          <p className="text-sm text-gray-400">Chưa có hashtag nào.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {top.map((h, i) => (
              <span key={h.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  i < 3
                    ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}>
                <span className="font-bold">#{i + 1}</span>
                <span>#{h.name}</span>
                <span className={i < 3 ? "text-white/80" : "text-gray-400"}>({h.postCount} bài)</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm hashtag..."
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none w-64" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 w-16">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Hashtag</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Số bài viết</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : hashtags.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Không có dữ liệu</td></tr>
            ) : hashtags.map((h, i) => (
              <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-400">{(page - 1) * 20 + i + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-700 dark:text-gray-200">#{h.name}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${countBadge(h.postCount)}`}>
                    {h.postCount} bài
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(h.id, h.name)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">← Trước</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
