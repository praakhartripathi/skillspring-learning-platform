import { supabase } from "@/app/lib/supabaseClient";

export default async function CourseApprovals() {

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "pending");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Course Approvals
      </h1>

      {courses?.map((course: any) => (
        <div key={course.id} className="bg-white p-4 mb-3 shadow rounded-lg">
          <h2 className="font-semibold">{course.title}</h2>
          <div className="flex gap-2 mt-2">
            <form action={`/admin/courses/approve?id=${course.id}`}>
              <button className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
            </form>
            <form action={`/admin/courses/reject?id=${course.id}`}>
              <button className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
            </form>
            <form action={`/admin/courses/flag?id=${course.id}`}>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded">Flag</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}