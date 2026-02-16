"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { User, Course } from "@/app/lib/types";
import Link from "next/link";

export default function InstructorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        setUser(userProfile);

        // Get instructor's courses
        const { data: instructorCourses } = await supabase
          .from("courses")
          .select("*")
          .eq("instructor_id", authUser.id)
          .order("created_at", { ascending: false });

        setCourses(instructorCourses || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  const draftCourses = courses.filter((c) => c.status === "draft");
  const pendingCourses = courses.filter((c) => c.status === "pending");
  const approvedCourses = courses.filter((c) => c.status === "approved");

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Instructor Dashboard</h1>
            <p className="text-slate-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/instructor/create-course"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              + Create Course
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Total Courses</p>
            <p className="text-3xl font-bold mt-2 text-slate-100">{courses.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Drafts</p>
            <p className="text-3xl font-bold mt-2 text-slate-100">{draftCourses.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Pending Review</p>
            <p className="text-3xl font-bold mt-2 text-yellow-500">
              {pendingCourses.length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Published</p>
            <p className="text-3xl font-bold mt-2 text-green-500">
              {approvedCourses.length}
            </p>
          </div>
        </div>

        {/* Draft Courses */}
        {draftCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Drafts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg shadow overflow-hidden hover:shadow-lg hover:border-indigo-500 transition"
                >
                  <img
                    src={course.thumbnail_url || "https://picsum.photos/400/200"}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">
                      Status: <span className="text-yellow-500">Draft</span>
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/instructor/course-builder/${course.id}`}
                        className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => alert("Delete course coming soon")}
                        className="flex-1 px-4 py-2 border border-red-600 text-red-500 rounded hover:bg-red-950 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Courses */}
        {pendingCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Pending Review</h2>
            <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-200">
                Your courses are under review by the admin. This typically takes 24-48 hours.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg shadow overflow-hidden"
                >
                  <img
                    src={course.thumbnail_url || "https://picsum.photos/400/200"}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">
                      Status: <span className="text-yellow-500 font-semibold">Under Review</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Courses */}
        {approvedCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-100">Published Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg shadow overflow-hidden hover:shadow-lg hover:border-indigo-500 transition"
                >
                  <img
                    src={course.thumbnail_url || "https://picsum.photos/400/200"}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
                      {course.title}
                    </h3>
                    <p className="text-sm text-green-500 mt-2 font-semibold">
                      ✓ Published
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Price: ₹{course.price}
                    </p>
                    <Link
                      href={`/courses/${course.id}`}
                      className="block mt-4 text-center px-4 py-2 bg-slate-800 text-slate-200 rounded hover:bg-slate-700 transition text-sm"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400 mb-4">You haven't created any courses yet.</p>
            <Link
              href="/instructor/create-course"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Create Your First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}