import Link from "next/link";
import CourseCard from "./components/CourseCard";
import { supabase } from "./lib/supabaseClient";

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    category?: string;
    price?: string;
    level?: string;
    rating?: string;
  };
}) {
  const keyword = searchParams?.search || "";
  const category = searchParams?.category || "";
  const price = searchParams?.price || "";
  const level = searchParams?.level || "";
  const rating = searchParams?.rating || "";

  const { data: categories } = await supabase.from("categories").select("*");

  let query = supabase
    .from("courses")
    .select(
      `
      id,
      title,
      price,
      thumbnail,
      level,
      rating,
      total_rating_count,
      users(name),
      course_lessons(id, video_url),
      categories(name)
    `
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (keyword) {
    query = query.ilike("title", `%${keyword}%`);
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  if (price === "free") {
    query = query.eq("price", 0);
  }

  if (price === "paid") {
    query = query.gt("price", 0);
  }

  if (level) {
    query = query.eq("level", level);
  }

  if (rating) {
    query = query.gte("rating", Number(rating));
  }

  const { data: courses } = await query.limit(12);

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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Learn Skills That Transform Your Career
          </h1>
          <p className="text-xl text-indigo-200 mb-8">
            Access courses from world-class instructors. Learn at your own pace.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="#courses"
              className="px-8 py-3 border-2 border-indigo-400 text-indigo-400 font-semibold rounded-lg hover:bg-indigo-600 hover:border-indigo-600 transition"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <form method="GET" className="flex flex-wrap gap-4 items-end">
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
                {categories?.map((cat: any) => (
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Rating
              </label>
              <select
                name="rating"
                defaultValue={rating}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Ratings</option>
                <option value="4">4★ & above</option>
                <option value="3">3★ & above</option>
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
                href="/"
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {keyword ? `Results for "${keyword}"` : "Explore Top Courses"}
          </h2>
          <p className="text-slate-400">
            {courses?.length === 0
              ? "No courses found. Try adjusting your filters."
              : `Found ${courses?.length} course${courses?.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg mb-4">No courses match your criteria</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Browse All Courses
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
