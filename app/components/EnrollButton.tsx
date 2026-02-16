"use client";

import { supabase } from "@/app/lib/supabaseClient";

export default function EnrollButton({ courseId, price }: any) {

  const handleEnroll = async () => {

    // 🔥 MOCK PAYMENT SUCCESS
    alert(price === 0 ? "Enrolled Free!" : "Mock Payment Successful!");

    // Get current user
    const { data: sessionData } = await supabase.auth.getUser();

    const userId = sessionData.user?.id;

    if (!userId) {
      alert("Please login first");
      return;
    }

    // Insert enrollment
    await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
    });

    alert("Enrollment created!");
  };

  return (
    <button
      onClick={handleEnroll}
      className="bg-black text-white px-6 py-3 rounded mt-4"
    >
      {price === 0 ? "Enroll Free" : `Buy Now ₹${price}`}
    </button>
  );
}
