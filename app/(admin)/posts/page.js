"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");
const truncate = (s, n) => (s && s.length > n ? s.slice(0, n) + "…" : s);

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const qs = new URLSearchParams({ page, limit: 10, search, hidden }).toString();
      const data = await fetchAPI(`/admin/posts?${qs}`);
      if (data?.success) { setPosts(data.data.posts); setTotal(data.data.total); }
      else setError(true);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, search, hidden]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (postId) => {
    if (!confirm("Xóa bài viết này?")) return;
    const data = await fetchAPI(`/admin/posts/${postId}`, { method: "DELETE" });
    if (data?.success) { showToast("Đã xóa bài viết"); fetchPosts(); }
    else showToast(data?.message || "Lỗi");
  };

  const handleRestore = async (postId) => {
    if (!confirm("Khôi phục bài viết này?")) return;
    const data = await fetchAPI(`/admin/posts/${postId}/restore`, { method: "PATCH" });
    if (data?.success) { showToast("Đã khôi phục bài viết"); fetchPosts(); }
    else showToast(data?.message || "Lỗi");
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm z-50 shadow">{toast}</div>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Bài viết <span className="text-gray-400 text-lg font-normal">({total})</span></h2>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm theo nội dung..."
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none w-64" />
        <select value={hidden} onChange={e => { setHidden(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none">
          <option value="">Tất cả bài viết</option>
          <option value="false">Đang hiển thị</option>
          <option value="true">Đang ẩn</option>
        </select>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Nội dung</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tác giả</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Lượt thích</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Bình luận</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ngày đăng</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-center py-12">
                <p className="text-gray-400 mb-3">Không tải được dữ liệu</p>
                <button onClick={fetchPosts}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                  Thử lại
                </button>
              </td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Không có dữ liệu</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 max-w-md">
                  <span className="text-gray-700 dark:text-gray-300">{truncate(post.content, 80) || <span className="text-gray-400 italic">(không có nội dung)</span>}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      {post.author?.avatar && <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs text-gray-500">@{post.author?.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{post._count?.likes ?? 0}</td>
                <td className="px-4 py-3 text-gray-500">{post._count?.comments ?? 0}</td>
                <td className="px-4 py-3">
                  {post.isHidden ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      Đã ẩn
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      Hiển thị
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(post.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {post.isHidden && (
                      <button onClick={() => handleRestore(post.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition">
                        Khôi phục
                      </button>
                    )}
                    <button onClick={() => handleDelete(post.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition">
                      Xóa
                    </button>
                  </div>
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
