import { supabase } from "@/app/lib/supabaseClient";

export default async function CourseApprovals() {

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      users(name),
      categories(name)
    `
    )
    .eq("status", "pending");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-100">
        Course Approvals
      </h1>

      {courses && courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-slate-900 border border-slate-800 p-6 rounded-lg hover:border-slate-700 transition">
              <h2 className="font-semibold text-slate-100 text-lg mb-2">{course.title}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-slate-400">
                <p><span className="text-slate-300">Instructor:</span> {course.users?.name || "Unknown"}</p>
                <p><span className="text-slate-300">Category:</span> {course.categories?.name || "N/A"}</p>
                <p><span className="text-slate-300">Price:</span> {course.price === 0 ? "Free" : `₹${course.price}`}</p>
                <p><span className="text-slate-300">Level:</span> {course.level || "N/A"}</p>
              </div>
              <p className="text-slate-400 text-sm mb-4">{course.description?.substring(0, 150)}...</p>
              <div className="flex gap-2">
                <form action={`/admin/courses/approve?id=${course.id}`}>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">Approve</button>
                </form>
                <form action={`/admin/courses/reject?id=${course.id}`}>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center text-slate-400">
          No courses pending approval ✓
        </div>
      )}
    </div>
  );
}