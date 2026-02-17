import Link from "next/link";
import { redirect } from "next/navigation";
import CourseCard from "@/app/components/CourseCard";
import { createClient } from "@/app/lib/server";
import { cookies } from "next/headers";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    price?: string;
    level?: string;
    rating?: string;
  }>;
}) {
  // Use server-side Supabase client to properly read auth session from cookies
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if user is logged in
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    userProfile = data;
  }

  const params = await searchParams;
  const keyword = params?.search || "";
  const category = params?.category || "";
  const price = params?.price || "";
  const level = params?.level || "";
  const rating = params?.rating || "";

  // Fetch categories
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const showDrafts = process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";

  // Build query with filters
  let courseQuery = supabase
    .from("courses")
    .select(
      `
      id,
      title,
      price,
      thumbnail,
      level,
      users(name),
      course_lessons(id, video_url),
      categories(name)
    `
    )
    .order("created_at", { ascending: false });

  if (showDrafts) {
    courseQuery = courseQuery.in("status", ["approved", "draft", "pending"]);
  } else {
    courseQuery = courseQuery.eq("status", "approved");
  }

  if (keyword) {
    courseQuery = courseQuery.ilike("title", `%${keyword}%`);
  }

  if (category) {
    courseQuery = courseQuery.eq("category_id", category);
  }

  if (price === "free") {
    courseQuery = courseQuery.eq("price", 0);
  }

  if (price === "paid") {
    courseQuery = courseQuery.gt("price", 0);
  }

  if (level) {
    courseQuery = courseQuery.eq("level", level);
  }

  if (rating) {
    const ratingNum = parseFloat(rating);
    if (!isNaN(ratingNum) && ratingNum >= 0 && ratingNum <= 5) {
      courseQuery = courseQuery.gte("rating", ratingNum);
    }
  }

  const { data: courses } = await courseQuery.limit(24);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-500">
            SkillSpring
          </Link>

          <form method="GET" className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="search"
                name="search"
                defaultValue={keyword}
                placeholder="Search courses..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-slate-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </form>

          <div className="flex gap-3">
            {authUser && userProfile ? (
              <>
                <Link
                  href={
                    userProfile.role === "instructor"
                      ? "/instructor"
                      : userProfile.role === "admin"
                        ? "/admin"
                        : "/student"
                  }
                  className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition"
                >
                  Dashboard
                </Link>
                <form
                  action={async () => {
                    "use server";
                    const cookieStore = await cookies();
                    const supabaseServer = createClient(cookieStore);
                    await supabaseServer.auth.signOut();
                    redirect("/");
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-slate-900 border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-2">Browse All Courses</h1>
          <p className="text-slate-400">
            {courses && courses.length > 0
              ? `Showing ${courses.length} course${courses.length !== 1 ? "s" : ""}`
              : "No courses found"}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <form method="GET" className="flex flex-wrap gap-4 items-end">
            {/* Hidden input to preserve search keyword when filtering */}
            <input type="hidden" name="search" value={keyword} />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                name="category"
                defaultValue={category}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {allCategories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Price
              </label>
              <select
                name="price"
                defaultValue={price}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Level
              </label>
              <select
                name="level"
                defaultValue={level}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition"
            >
              Filter
            </button>

            {(keyword || category || price || level || rating) && (
              <Link
                href="/courses"
                className="px-6 py-2 border border-slate-700 text-slate-300 rounded font-semibold hover:bg-slate-800 transition"
              >
                Clear All
              </Link>
            )}
          </form>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">No courses found matching your criteria.</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Clear Filters
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>
            © 2026 SkillSpring. All rights reserved. | Built with Next.js &
            Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}