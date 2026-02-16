import { supabase } from "./supabaseClient";
import { User } from "./types";

// Get current user from Supabase Auth
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: userProfile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return userProfile;
}

// Sign up new user
export async function signUpUser(
  email: string,
  password: string,
  name: string,
  role: "student" | "instructor" | "admin" = "student"
) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // 2. Create user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user?.id,
    email,
    name,
    role,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  return authData.user;
}

// Sign in user
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

// Sign out user
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

// Get user role-based redirect
export function redirectByRole(role?: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "instructor":
      return "/instructor";
    case "student":
      return "/student";
    default:
      return "/";
  }
}
