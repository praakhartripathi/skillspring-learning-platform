import { supabase } from "@/app/lib/supabaseClient";

export default async function UsersPage() {

  const { data:users } = await supabase
    .from("users")
    .select("*");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {users?.map((u:any)=>(
        <div key={u.id} className="bg-white p-4 mb-2 shadow">
          {u.name} — {u.role}
        </div>
      ))}
    </div>
  );
}