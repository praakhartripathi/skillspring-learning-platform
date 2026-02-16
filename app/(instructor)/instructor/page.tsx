import { supabase } from "@/app/lib/supabaseClient";

export default async function Earnings() {

  const { data:userData } = await supabase.auth.getUser();
  const instructorId = userData.user?.id;

  const { data:courses } = await supabase
    .from("courses")
    .select("price")
    .eq("instructor_id", instructorId);

  const total = courses?.reduce(
    (sum:any,c:any)=>sum+c.price,0
  );

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">
        Earnings
      </h1>
      <p>Total Earnings: ₹{total}</p>
    </div>
  );
}