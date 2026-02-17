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
        const { data: enrollments, error } = await supabase
          .from("enrollments")
          .select(`
            id,
            course_id,
            enrolled_at,
            courses (
              id,
              title,
              thumbnail,
              price,
              level,
              users (name)
            )
          `)
          .eq("student_id", authUser.id);

        if (error) throw error;

        // Get lesson progress for calculating course completion
        const { data: lessonProgress } = await supabase
          .from("lesson_progress")
          .select("lesson_id, is_completed")
          .eq("student_id", authUser.id);

        // Calculate progress for each course
        const enrollmentsWithProgress = await Promise.all(
          (enrollments || []).map(async (enrollment: any) => {
            // Get total lessons in this course
            const { data: lessons } = await supabase
              .from("course_lessons")
              .select("id")
              .in(
                "section_id",
                (await supabase
                  .from("course_sections")
                  .select("id")
                  .eq("course_id", enrollment.course_id)).data?.map((s: any) => s.id) || []
              );

            const totalLessons = lessons?.length || 0;
            const completedLessons =
              (lessonProgress || []).filter(
                (p: any) =>
                  p.is_completed &&
                  lessons?.some((l: any) => l.id === p.lesson_id)
              ).length || 0;

            const progress =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            return { ...enrollment, progress_percentage: progress };
          })
        );

        setEnrolledCourses(enrollmentsWithProgress);
      } catch (error) {
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
              href="/courses"
              className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition"
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
                href="/courses"
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment: any) => {
                const course = enrollment.courses;
                const thumbnail =
                  course.thumbnail || "https://picsum.photos/400/200";
                const progress = enrollment.progress_percentage || 0;
                
                return (
                  <Link
                    key={enrollment.id}
                    href={`/learn/${course.id}`}
                    className="group"
                  >
                    <div className="bg-slate-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-500 transition border border-slate-700">
                      <img
                        src={thumbnail}
                        alt={course.title}
                        className="w-full h-40 object-cover group-hover:opacity-90 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://picsum.photos/400/200";
                        }}
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {course.users?.name}
                        </p>
                        <div className="mt-4 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {Math.round(progress)}% complete
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