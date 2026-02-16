"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function Categories() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    const { error } = await supabase.from("categories").insert({ name, description });
    if (!error) {
      setName("");
      setDescription("");
      await fetchCategories();
      alert("Category added!");
    } else {
      console.error("Error adding category:", error.message);
      alert(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      await fetchCategories();
      alert("Category deleted!");
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-slate-100">
          Add New Category
        </h1>
        <div className="space-y-3">
          <input
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <button
            onClick={addCategory}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-semibold transition disabled:opacity-50"
            disabled={isLoading || !name.trim()}>
            {isLoading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">
          Existing Categories ({categories.length})
        </h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between hover:border-slate-700 transition">
                <div>
                  <p className="font-semibold text-slate-100">{cat.name}</p>
                  {cat.description && (
                    <p className="text-sm text-slate-400">{cat.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center text-slate-400">
            No categories yet.
          </div>
        )}
      </div>
    </div>
  );
}
