"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/users", label: "Người dùng", icon: "👥" },
  { href: "/posts", label: "Bài viết", icon: "📝" },
  { href: "/reports", label: "Báo cáo", icon: "🚨" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-bold">Threads Admin</h1>
        <p className="text-xs text-gray-500 mt-1">Quản trị hệ thống</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${pathname === item.href
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button onClick={handleLogout}
          className="w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left">
          🚪 Đăng xuất
        </button>
      </div>
    </aside>
  );
}
