"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(signUpError.message);
    } else if (data.user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        role: "student", // default role
      });

      if (insertError) {
        alert(`Signup successful, but failed to create profile: ${insertError.message}`);
      } else {
        alert("Signup successful! Check your email for verification.");
      }
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
