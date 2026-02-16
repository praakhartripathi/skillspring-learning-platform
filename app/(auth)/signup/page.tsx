"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful! Check email.");
      console.log(data);
    }
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md">
      <h1 className="text-2xl font-bold">Signup</h1>

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
        onClick={handleSignup}
      >
        Sign Up
      </button>
    </div>
  );
}
