"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Category } from "@/app/lib/types";
import Link from "next/link";

export default function CreateCourse() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: 0,
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    thumbnail_url: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // Check auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userProfile?.role !== "instructor") {
        router.push("/");
        return;
      }

      setCurrentUser(userProfile);

      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(cats || []);
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title || !formData.category_id || !currentUser) {
        alert("Please fill all required fields");
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .insert({
          ...formData,
          instructor_id: currentUser.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to course builder
      router.push(`/instructor/course-builder/${data.id}`);
    } catch (error) {
      alert("Error creating course: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  if (!currentUser)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">Create a New Course</h1>
          <Link
            href="/instructor"
            className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded transition"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Complete JavaScript Mastery"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Write a compelling description of your course..."
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Level *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Price (₹) - 0 for Free
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="50"
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {formData.thumbnail_url && (
            <div>
              <p className="text-sm text-slate-400 mb-2">Thumbnail Preview:</p>
              <img
                src={formData.thumbnail_url}
                alt="Thumbnail preview"
                className="h-40 object-cover rounded"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Course & Continue"}
          </button>
        </form>
      </main>
    </div>
  );
}
