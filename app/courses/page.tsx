import { supabase } from "@/app/lib/supabaseClient";
import CourseCard from "@/app/components/CourseCard";

export default async function CoursesPage() {

  const showDrafts = process.env.NEXT_PUBLIC_SHOW_DRAFTS === 'true';

  let courseQuery = supabase.from("courses").select("*");
  if (showDrafts) {
    courseQuery = courseQuery.in("status", ["approved", "draft", "pending"]);
  } else {
    courseQuery = courseQuery.eq("status", "approved");
  }

  const { data: courses } = await courseQuery;

  return (
    <div className="p-10 grid grid-cols-3 gap-6">
      {courses?.map((c:any) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}