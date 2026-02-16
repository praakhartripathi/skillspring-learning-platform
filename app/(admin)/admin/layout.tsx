import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* 🔵 Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h1 className="text-xl font-bold mb-6">
          Admin Panel
        </h1>

        <Link href="/admin" className="block hover:text-gray-300">
          Dashboard
        </Link>

        <Link href="/admin/courses" className="block hover:text-gray-300">
          Course Approvals
        </Link>

        <Link href="/admin/users" className="block hover:text-gray-300">
          Users
        </Link>

        <Link href="/admin/categories" className="block hover:text-gray-300">
          Categories
        </Link>
      </aside>

      {/* 🟢 Page Content */}
      <main className="flex-1 bg-gray-50 p-10">
        {children}
      </main>

    </div>
  );
}