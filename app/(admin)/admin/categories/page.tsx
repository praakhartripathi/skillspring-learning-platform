"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories from the database
  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    const { error } = await supabase.from("categories").insert({ name });
    if (!error) {
      setName(""); // Clear input
      await fetchCategories(); // Refresh list
    } else {
      console.error("Error adding category:", error.message);
      alert(`Error: ${error.message}`); // Simple error feedback
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-4">
          Categories
        </h1>
        <div className="flex items-center">
          <input
            className="border p-2"
            placeholder="Category"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={addCategory}
            className="bg-black text-white px-4 py-2 ml-2 disabled:bg-gray-400"
            disabled={isLoading || !name.trim()}>
            {isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Existing Categories</h2>
        <div className="bg-white p-4 shadow rounded-lg">
          {categories.map((cat) => (
            <div key={cat.id} className="border-b p-2 last:border-b-0">
              {cat.name}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500">No categories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
