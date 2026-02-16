"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateCourse() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const router = useRouter();

  const handleCreate = async () => {

    const { data, error } = await supabase
      .from("courses")
      .insert({
        title,
        price,
        status: "draft",
      })
      .select()
      .single();

    if (data) {
      router.push(`/instructor/course-builder/${data.id}`);
    }
  };

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Create Course</h1>

      <input
        className="border p-2"
        placeholder="Course Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        className="border p-2"
        placeholder="Price"
        onChange={(e) => setPrice(Number(e.target.value))}
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-6 py-2"
      >
        Create
      </button>
    </div>
  );
}
