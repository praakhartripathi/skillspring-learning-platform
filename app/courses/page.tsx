import { supabase } from "@/app/lib/supabaseClient";
import CourseCard from "@/app/components/CourseCard";

export default async function CoursesPage() {

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "approved");

  return (
    <div className="p-10 grid grid-cols-3 gap-6">
      {courses?.map((c:any) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}