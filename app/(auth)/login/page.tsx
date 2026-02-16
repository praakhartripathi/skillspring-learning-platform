"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { redirectByRole } from "@/app/lib/redirectByRole";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        alert(`Error fetching user profile: ${profileError.message}`);
        // Optionally, redirect to a generic page even if profile fetch fails
        // router.push('/dashboard');
        return;
      }

      router.push(redirectByRole(profile?.role));
    }
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        className="border p-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-black text-white p-2"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
