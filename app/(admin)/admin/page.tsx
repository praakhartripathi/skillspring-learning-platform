"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { User, Course } from "@/app/lib/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    pendingApprovals: 0,
  });
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
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

        if (userProfile?.role !== "admin") {
          router.push("/");
          return;
        }

        setUser(userProfile);

        // Get stats
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        const { count: courseCount } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true });

        const { count: enrollmentCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true });

        // Get pending courses
        const { data: pending } = await supabase
          .from("courses")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: true });

        setStats({
          totalUsers: userCount || 0,
          totalCourses: courseCount || 0,
          totalEnrollments: enrollmentCount || 0,
          pendingApprovals: pending?.length || 0,
        });

        setPendingCourses(pending || []);
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

  const handleApproveCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "approved" })
        .eq("id", courseId);

      if (error) throw error;

      setPendingCourses(
        pendingCourses.filter((c) => c.id !== courseId)
      );
      alert("Course approved!");
    } catch (error) {
      alert("Error approving course:" + error);
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "rejected" })
        .eq("id", courseId);

      if (error) throw error;

      setPendingCourses(
        pendingCourses.filter((c) => c.id !== courseId)
      );
      alert("Course rejected!");
    } catch (error) {
      alert("Error rejecting course:" + error);
    }
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
            <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-400">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold mt-2 text-slate-100">{stats.totalUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Total Courses</p>
            <p className="text-3xl font-bold mt-2 text-slate-100">{stats.totalCourses}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Total Enrollments</p>
            <p className="text-3xl font-bold mt-2 text-slate-100">{stats.totalEnrollments}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
            <p className="text-slate-400 text-sm">Pending Approvals</p>
            <p className="text-3xl font-bold mt-2 text-yellow-500">
              {stats.pendingApprovals}
            </p>
          </div>
        </div>

        {/* Pending Course Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-bold text-slate-100">
              Course Approval Queue ({pendingCourses.length})
            </h2>
          </div>

          {pendingCourses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No courses pending approval ✓
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCourses.map((course) => (
                    <tr key={course.id} className="border-b border-slate-800 hover:bg-slate-800">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-100 line-clamp-1">
                          {course.title}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {course.users?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {course.categories?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-300">
                        {course.price === 0 ? "Free" : `₹${course.price}`}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleApproveCourse(course.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectCourse(course.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}