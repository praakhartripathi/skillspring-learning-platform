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

  let query = supabase
    .from("courses")
    .select("*")
    .eq("status", "approved");

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

  const { data: courses } = await query.limit(6);

  return (
    <div>

      {/* ✅ NAVBAR */}
      <header className="w-full border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          {/* Left Side - Logo */}
          <h1 className="text-2xl font-bold">SkillSpring</h1>

          {/* Right Side - Search and Buttons */}
          <div className="flex items-center gap-4">
            <form method="GET" className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                defaultValue={keyword}
                className="block w-64 rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm"
                placeholder="Search by keyword..."
                type="search"
              />
            </form>
            <Link
              href="/login"
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Signup
            </Link>
          </div>
        </div>
      </header>

      {/* ✅ Filters */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <form method="GET" className="flex gap-4 flex-wrap">

          {/* Category */}
          <select name="category" defaultValue={category} className="border p-2">
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
          </select>

          {/* Price */}
          <select name="price" defaultValue={price} className="border p-2">
            <option value="">Price</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          {/* Level */}
          <select name="level" defaultValue={level} className="border p-2">
            <option value="">Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Rating */}
          <select name="rating" defaultValue={rating} className="border p-2">
            <option value="">Rating</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
          </select>

          <button className="bg-black text-white px-4 py-2 rounded">
            Apply
          </button>

        </form>
      </div>


      {/* ✅ Trending Courses */}
      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6">
          🔥 Trending Courses
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {courses?.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

    </div>
  );
}
