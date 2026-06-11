"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [banned, setBanned] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page, limit: 10, search, role, banned }).toString();
    const data = await fetchAPI(`/admin/users?${qs}`);
    if (data?.success) { setUsers(data.data.users); setTotal(data.data.total); }
    setLoading(false);
  }, [page, search, role, banned]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (userId, isBanned) => {
    const data = await fetchAPI(`/admin/users/${userId}/ban`, { method: "PATCH" });
    if (data?.success) { showToast(data.message); fetchUsers(); }
  };

  const handleRole = async (userId, newRole) => {
    const data = await fetchAPI(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    if (data?.success) { showToast("Đã cập nhật role"); fetchUsers(); }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Xóa user này?")) return;
    const data = await fetchAPI(`/admin/users/${userId}`, { method: "DELETE" });
    if (data?.success) { showToast("Đã xóa user"); fetchUsers(); }
    else showToast(data?.message || "Lỗi");
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm z-50 shadow">{toast}</div>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Người dùng <span className="text-gray-400 text-lg font-normal">({total})</span></h2>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm theo tên, email..."
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none w-64" />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none">
          <option value="">Tất cả role</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select value={banned} onChange={e => { setBanned(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none">
          <option value="">Tất cả trạng thái</option>
          <option value="false">Hoạt động</option>
          <option value="true">Đã ban</option>
        </select>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Người dùng</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Bài viết</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Không có dữ liệu</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      {user.avatar && <img src={user.avatar} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-medium">{user.displayName || user.username}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <select value={user.role} onChange={e => handleRole(user.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent outline-none">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.isBanned ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"}`}>
                    {user.isBanned ? "Đã ban" : "Hoạt động"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{user._count?.posts ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleBan(user.id, user.isBanned)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${user.isBanned ? "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" : "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400"}`}>
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button onClick={() => handleDelete(user.id)}
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
