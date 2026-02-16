import { supabase } from "@/app/lib/supabaseClient";
import ReviewForm from "@/app/components/ReviewForm";
import EnrollButton from "@/app/components/EnrollButton";

export default async function CourseDetail({
  params,
}: {
  params: { id: string };
}) {

  // Fetch user session on the server
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single();

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold">{course?.title}</h1>
      <p className="mt-4">{course?.description}</p>

      <EnrollButton courseId={params.id} price={course?.price} />

      {/* Conditionally render ReviewForm if user is logged in */}
      <div className="max-w-2xl">
        {user ? (
          <ReviewForm courseId={params.id} userId={user.id} />
        ) : <p>Please log in to leave a review.</p>}
      </div>
    </div>
  );
}
