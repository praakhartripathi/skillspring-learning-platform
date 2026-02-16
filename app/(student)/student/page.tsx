"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { User } from "@/app/lib/types";
import Link from "next/link";

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (userProfile?.role !== "student") {
          router.push("/");
          return;
        }

        setUser(userProfile);

        // Get enrolled courses
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select(
            `
            *,
            courses(
              id,
              title,
              thumbnail_url,
              rating,
              price,
              users(name),
              course_lessons(id, video_url)
            )
          `
          )
          .eq("student_id", authUser.id);

        setEnrolledCourses(enrollments || []);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome, {user?.name}!</h1>
            <p className="text-slate-400">Continue learning where you left off</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded transition"
            >
              Browse Courses
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-slate-100">My Courses ({enrolledCourses.length})</h2>

          {enrolledCourses.length === 0 ? (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment: any) => {
                // Extract YouTube thumbnail from first lesson
                const firstLesson = Array.isArray(enrollment.courses.course_lessons)
                  ? enrollment.courses.course_lessons[0]
                  : null;
                const videoUrl = firstLesson?.video_url;
                let thumbnail = enrollment.courses.thumbnail_url || "https://picsum.photos/400/200";
                
                if (videoUrl) {
                  let videoId = "";
                  if (videoUrl.includes("youtu.be/")) {
                    videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
                  } else if (videoUrl.includes("youtube.com/watch")) {
                    try {
                      videoId = new URL(videoUrl).searchParams.get("v") || "";
                    } catch (e) {
                      // Invalid URL
                    }
                  } else if (videoUrl.includes("youtube.com/embed/")) {
                    videoId = videoUrl.split("embed/")[1]?.split("?")[0] || "";
                  }
                  if (videoId) {
                    thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                  }
                }
                
                return (
                  <Link
                    key={enrollment.id}
                    href={`/learn/${enrollment.courses.id}`}
                    className="group"
                  >
                    <div className="bg-slate-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-500 transition border border-slate-700">
                      <img
                        src={thumbnail}
                        alt={enrollment.courses.title}
                        className="w-full h-40 object-cover group-hover:opacity-90 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://picsum.photos/400/200";
                        }}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
                          {enrollment.courses.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {enrollment.courses.users?.name}
                        </p>
                        <div className="mt-4 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {Math.round(enrollment.progress_percentage)}% complete
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}