import { supabase } from "./lib/supabaseClient";

export default async function Home() {
  // simple test query
  const { data, error } = await supabase.auth.getSession();

  console.log("Supabase Test:", { data, error });

  return (
    <div className="p-10 text-2xl">
      Supabase Connection Test ✅
    </div>
  );
}
