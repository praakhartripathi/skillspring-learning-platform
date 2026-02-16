import Link from "next/link";
import { supabase } from "./lib/supabaseClient";

export default async function Home() {

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "approved")
    .limit(6);

  return (
    <div>

      {/* ✅ NAVBAR */}
      <header className="flex items-center justify-between p-6 border-b">
        <h1 className="text-2xl font-bold">SkillSpring</h1>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 border rounded">
            Login
          </Link>

          <Link href="/signup" className="px-4 py-2 bg-black text-white rounded">
            Signup
          </Link>
        </div>
      </header>

      {/* ✅ Trending Courses */}
      <div className="p-10">
        <h2 className="text-3xl font-bold mb-6">
          🔥 Trending Courses
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {courses?.map((course: any) => (
            <div key={course.id} className="border p-4 rounded-lg">
              <h3>{course.title}</h3>
              <p>₹{course.price}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
