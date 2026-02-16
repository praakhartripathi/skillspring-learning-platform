import { supabase } from "@/app/lib/supabaseClient";

export default async function AdminDashboard() {

  const students = await supabase
    .from("users")
    .select("*",{count:"exact"})
    .eq("role","student");

  const courses = await supabase
    .from("courses")
    .select("*",{count:"exact"});

  const enrollments = await supabase
    .from("enrollments")
    .select("*",{count:"exact"});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow">
          Total Students: {students.count}
        </div>

        <div className="bg-white p-6 shadow">
          Total Courses: {courses.count}
        </div>

        <div className="bg-white p-6 shadow">
          Total Enrollments: {enrollments.count}
        </div>
      </div>
    </div>
  );
}