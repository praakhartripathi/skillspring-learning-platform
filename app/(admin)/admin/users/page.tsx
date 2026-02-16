"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
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

        // 1. Fetch all auth users to create an email map
        const { data: authUsersData, error: authUsersError } =
          await supabase.auth.admin.listUsers();
        if (authUsersError) throw authUsersError;
        const emailMap = new Map(
          authUsersData.users.map((u) => [u.id, u.email])
        );

        // 2. Fetch user profiles (filtered if needed)
        let query = supabase
          .from("users")
          .select("id, name, role, created_at")
          .order("created_at", { ascending: false });

        if (roleFilter) {
          query = query.eq("role", roleFilter);
        }

        const { data: profiles, error: profilesError } = await query;
        if (profilesError) throw profilesError;

        // 3. Merge email into profiles
        const mergedUsers = (profiles || []).map((profile) => ({
          ...profile,
          email: emailMap.get(profile.id) || "",
        }));
        setUsers(mergedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, router]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      alert("User role updated!");
    } catch (error) {
      alert("Error updating user role: " + error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will delete the user.")) return;

    try {
      // Delete from database
      const { error } = await supabase
        .auth.admin.deleteUser(userId);

      if (error) throw error;

      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted!");
    } catch (error) {
      alert("Error deleting user: " + error);
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full text-slate-100">
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-100">
        Manage Users
      </h1>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800 transition">
                  <td className="px-6 py-4 text-slate-100">{user.name || "N/A"}</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-slate-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center text-slate-400">
          No users found.
        </div>
      )}
    </div>
  );
}
