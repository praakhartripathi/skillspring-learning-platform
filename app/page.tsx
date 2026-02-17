import Link from "next/link";
import CourseCard from "./components/CourseCard";
import { createClient } from "./lib/server";
import { cookies } from "next/headers";

export default async function Home({
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

  // Check if user is logged in (optional - home page is PUBLIC)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Get user profile if logged in
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

  // 1️⃣ PUBLIC QUERY: Fetch all approved courses (visible to everyone)
  const { data: trendingCourses } = await supabase
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
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  // 2️⃣ Fetch categories for sidebar
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // 3️⃣ Count approved courses per category (for popular categories)
  const { data: coursesPerCategory } = await supabase
    .from("courses")
    .select("category_id, categories(id, name)")
    .eq("status", "approved");

  const categoryCounts = coursesPerCategory?.reduce(
    (acc: any, course: any) => {
      if (course.categories) {
        const catId = course.categories.id;
        if (!acc[catId]) {
          acc[catId] = { id: catId, name: course.categories.name, count: 0 };
        }
        acc[catId].count += 1;
      }
      return acc;
    },
    {}
  );

  const popularCategories = Object.values(categoryCounts || {})
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 6);

  // 4️⃣ FILTERED QUERY: ONLY IF SEARCH/FILTERS ARE APPLIED
  const showDrafts = process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
  let filteredCourses = null;

  if (keyword || category || price || level || rating) {
    let filterQuery = supabase
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
      filterQuery = filterQuery.in("status", ["approved", "draft", "pending"]);
    } else {
      filterQuery = filterQuery.eq("status", "approved");
    }

    if (keyword) {
      filterQuery = filterQuery.ilike("title", `%${keyword}%`);
    }

    if (category) {
      filterQuery = filterQuery.eq("category_id", category);
    }

    if (price === "free") {
      filterQuery = filterQuery.eq("price", 0);
    }

    if (price === "paid") {
      filterQuery = filterQuery.gt("price", 0);
    }

    if (level) {
      filterQuery = filterQuery.eq("level", level);
    }

    if (rating) {
      filterQuery = filterQuery.gte("rating", Number(rating));
    }

    const { data } = await filterQuery.limit(12);
    filteredCourses = data;
  }

  const courses = filteredCourses || trendingCourses;

  const courseCount = courses?.length || 0;

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
              href="/courses"
              className="px-8 py-3 border-2 border-indigo-400 text-indigo-400 font-semibold rounded-lg hover:bg-indigo-600 hover:border-indigo-600 transition"
            >
              Explore All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* 🔥 Featured Courses Section (Always visible, no login needed) */}
      {!keyword && !category && !price && !level && !rating && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              🔥 Featured Courses
            </h2>
            <p className="text-slate-400">
              Start learning with our most popular courses
            </p>
          </div>

          {trendingCourses && trendingCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {trendingCourses.slice(0, 3).map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 rounded-lg p-12 text-center mb-8">
              <p className="text-slate-400 text-lg">
                No courses available yet
              </p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              View All Courses
            </Link>
          </div>
        </section>
      )}

      {/* ⭐ Popular Categories Section */}
      {!keyword && !category && !price && !level && !rating && (
        <section className="bg-slate-900/50 py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                ⭐ Browse by Category
              </h2>
              <p className="text-slate-400">
                Find courses in your areas of interest
              </p>
            </div>

            {popularCategories && popularCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(popularCategories as any[]).map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.id}`}
                    className="block bg-slate-800 hover:bg-slate-700 transition rounded-lg p-6 border border-slate-700 hover:border-indigo-500"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-slate-400">
                      {cat.count} course{cat.count !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No categories available</p>
            )}
          </div>
        </section>
      )}

      {/* 🔒 Search & Filter Section (Shows only when searching/filtering) */}
      {keyword && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-indigo-900/20 border border-indigo-800 text-indigo-200 rounded p-3 text-center text-sm">
            🔍 Search results for: <strong>{keyword}</strong>
          </div>
        </div>
      )}

      {showDrafts && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-200 rounded p-3 text-center text-sm">
            ⚠️ Development mode: showing courses with status `draft` and `pending`. Set `NEXT_PUBLIC_SHOW_DRAFTS=false` to restore production behavior.
          </div>
        </div>
      )}

      {/* Filters (Sticky) */}
      <section id="courses" className="bg-slate-900 border-b border-slate-800 py-6 sticky top-16 z-40">
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

      {/* Courses Grid - Results */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {keyword ? `Search Results for "${keyword}"` : "All Courses"}
          </h2>
          <p className="text-slate-400">
            {courseCount === 0
              ? "No courses match your criteria. Try adjusting your filters."
              : `Found ${courseCount} course${courseCount !== 1 ? "s" : ""}`}
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
            <p className="text-slate-400 text-lg mb-4">
              No courses match your criteria
            </p>
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
