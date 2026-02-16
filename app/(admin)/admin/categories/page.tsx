"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function Categories() {
  const [name, setName] = useState("");

  const addCategory = async () => {
    await supabase.from("categories").insert({ name });
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        Categories
      </h1>

      <input
        className="border p-2"
        placeholder="Category"
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={addCategory}
        className="bg-black text-white px-4 py-2 ml-2">
        Add
      </button>
    </div>
  );
}
