"use client";
import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

const formatDate = (d) => new Date(d).toLocaleString("vi-VN");

const statusStyle = {
  PENDING: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  REVIEWED: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  DISMISSED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState("");
  const [resolveModal, setResolveModal] = useState(null); // null hoặc report object

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const qs = new URLSearchParams({ page, limit: 10, status }).toString();
      const data = await fetchAPI(`/admin/reports?${qs}`);
      if (data?.success) { setReports(data.data.reports); setTotal(data.data.total); }
      else setError(true);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleResolve = async (action) => {
    const data = await fetchAPI(`/admin/reports/${resolveModal.id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    setResolveModal(null);
    if (data?.success) {
      showToast(action === "dismissed" ? "Đã bỏ qua báo cáo" : "Đã xử lý báo cáo");
      fetchReports();
    } else showToast(data?.message || "Lỗi");
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm z-50 shadow">{toast}</div>}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Báo cáo <span className="text-gray-400 text-lg font-normal">({total})</span></h2>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none">
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="REVIEWED">Đã xử lý</option>
          <option value="DISMISSED">Đã bỏ qua</option>
        </select>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Người báo cáo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Lý do</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ngày tạo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-12">
                <p className="text-gray-400 mb-3">Không tải được dữ liệu</p>
                <button onClick={fetchReports}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                  Thử lại
                </button>
              </td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Không có dữ liệu</td></tr>
            ) : reports.map(report => (
              <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      {report.user?.avatar && <img src={report.user.avatar} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs text-gray-500">@{report.user?.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-md">{report.reason}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle[report.status] || statusStyle.DISMISSED}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(report.createdAt)}</td>
                <td className="px-4 py-3">
                  {report.status === "PENDING" ? (
                    <button onClick={() => setResolveModal(report)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition">
                      Xử lý
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
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

      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setResolveModal(null)} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-md mx-4 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-lg">🚨</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Xử lý báo cáo</h3>
                  <p className="text-xs text-gray-400 mt-0.5">#{resolveModal.id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setResolveModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition text-lg">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-3">
              {/* Thông tin báo cáo */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-24">Người báo cáo</span>
                  <span className="text-xs text-gray-900 dark:text-white font-medium">
                    @{resolveModal.user?.username || "Ẩn danh"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 w-24 pt-0.5">Lý do</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                    {resolveModal.reason || "Không có lý do"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-24">Ngày tạo</span>
                  <span className="text-xs text-gray-500">
                    {new Date(resolveModal.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center pt-1">Chọn hành động bên dưới để xử lý báo cáo này</p>
            </div>

            {/* Footer — 2 action buttons */}
            <div className="px-6 pb-5 grid grid-cols-2 gap-3">
              <button onClick={() => handleResolve("reviewed")}
                className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition group">
                <span className="text-xl">✅</span>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">Vi phạm</span>
                <span className="text-[10px] text-green-600 dark:text-green-500 text-center leading-tight">Nội dung vi phạm,<br/>cần xử lý</span>
              </button>
              <button onClick={() => handleResolve("dismissed")}
                className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition group">
                <span className="text-xl">🚫</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bỏ qua</span>
                <span className="text-[10px] text-gray-500 text-center leading-tight">Không vi phạm,<br/>bỏ qua báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
