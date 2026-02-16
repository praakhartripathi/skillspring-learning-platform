"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface ReviewFormProps {
  courseId: string;
  userId: string;
}

export default function ReviewForm({ courseId, userId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Check enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .single();

      if (enrollmentError && enrollmentError.code !== "PGRST116") {
        throw enrollmentError;
      }

      if (!enrollment) {
        setMessage({
          type: "error",
          text: "You must be enrolled in this course to leave a review.",
        });
        setIsSubmitting(false);
        return;
      }

      // Submit review
      const { error } = await supabase.from("reviews").upsert({
        course_id: courseId,
        student_id: userId,
        rating,
        review_text: reviewText,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Review submitted successfully!",
      });
      setReviewText("");
      setRating(5);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error submitting review",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4 text-slate-100">Leave a Review</h3>

      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success"
              ? "bg-green-950 border border-green-800 text-green-200"
              : "bg-red-950 border border-red-800 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={submitReview} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Rating
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Very Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this course..."
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
  );
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
