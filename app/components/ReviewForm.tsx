"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

// Define props interface for type safety
interface ReviewFormProps {
  courseId: string;
  userId: string;
}

export default function ReviewForm({ courseId, userId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const submitReview = async () => {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      // ✅ Check enrollment first
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id") // Only select what's needed
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .single();

      // Ignore the error when no rows are found, but throw other errors.
      if (enrollmentError && enrollmentError.code !== 'PGRST116') {
        throw enrollmentError;
      }

      if (!enrollment) {
        setFeedbackMessage({ type: 'error', message: "You must be enrolled in this course to leave a review." });
        setIsSubmitting(false);
        return;
      }

      // Insert review
      const { error: reviewError } = await supabase.from("reviews").insert({
        course_id: courseId,
        user_id: userId,
        rating,
        comment,
      });

      if (reviewError) {
        throw reviewError;
      }

      setFeedbackMessage({ type: 'success', message: "Review submitted successfully!" });
      setComment(""); // Clear form
      setRating(5);   // Reset rating
    } catch (error: any) {
      setFeedbackMessage({ type: 'error', message: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg space-y-3">
      <h3 className="font-bold">Leave a Review</h3>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className={`p-2 rounded text-sm ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedbackMessage.message}
        </div>
      )}

      <select
        value={rating} // Controlled component
        className="border p-2"
        onChange={(e) => setRating(Number(e.target.value))}
        disabled={isSubmitting}
      >
        {[1, 2, 3, 4, 5].reverse().map((r) => ( // Show 5 stars first
          <option key={r} value={r}>{r} ⭐</option>
        ))}
      </select>

      <textarea
        value={comment} // Controlled component
        className="border p-2 w-full"
        placeholder="Write your review..."
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
      />

      <button
        onClick={submitReview}
        className="bg-black text-white px-4 py-2 disabled:bg-gray-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
