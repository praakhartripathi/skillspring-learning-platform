import { supabase } from "@/app/lib/supabaseClient";

export default async function Reviews() {

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId);

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">
        My Reviews
      </h1>

      {reviews?.map((r:any) => (
        <div key={r.id} className="border p-4 mb-2">
          ⭐ {r.rating} — {r.comment}
        </div>
      ))}
    </div>
  );
}