import "./globals.css";

export const metadata = { title: "Threads Admin", description: "Threads Clone Admin Panel" };

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
