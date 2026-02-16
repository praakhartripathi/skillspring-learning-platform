import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 p-6 space-y-4">
        <h1 className="text-xl font-bold mb-6 text-indigo-400">
          Admin Panel
        </h1>

        <Link href="/admin" className="block px-3 py-2 rounded hover:bg-slate-800 transition">
          Dashboard
        </Link>

        <Link href="/admin/courses" className="block px-3 py-2 rounded hover:bg-slate-800 transition">
          Course Approvals
        </Link>

        <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-slate-800 transition">
          Users
        </Link>

        <Link href="/admin/categories" className="block px-3 py-2 rounded hover:bg-slate-800 transition">
          Categories
        </Link>
      </aside>

      {/* Page Content */}
      <main className="flex-1 bg-slate-950 text-slate-100 p-10">
        {children}
      </main>

    </div>
  );
}