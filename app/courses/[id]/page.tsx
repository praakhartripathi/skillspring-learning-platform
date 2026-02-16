"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { Course, CourseSection, Review, User } from "@/app/lib/types";

export default function CourseDetail() {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitReviewForm, setSubmitReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();
          setCurrentUser(userProfile);

          // Check if enrolled
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("*")
            .eq("student_id", authUser.id)
            .eq("course_id", id)
            .single();
          setIsEnrolled(!!enrollment);
        }

        // Get course
        const { data: courseData } = await supabase
          .from("courses")
          .select(
            `
            *,
            users(id, name, email, bio),
            categories(id, name)
          `
          )
          .eq("id", id)
          .single();

        setCourse(courseData);

        // Get sections
        const { data: sectionsData } = await supabase
          .from("course_sections")
          .select("*")
          .eq("course_id", id)
          .order("order_index");

        setSections(sectionsData || []);

        // Get reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, users(name, profile_picture_url)")
          .eq("course_id", id)
          .order("created_at", { ascending: false });

        setReviews(reviewsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!course) return;

    try {
      // Create enrollment
      const { error } = await supabase.from("enrollments").insert({
        student_id: currentUser.id,
        course_id: course.id,
        progress_percentage: 0,
      });

      if (error) throw error;

      setIsEnrolled(true);
      alert("Successfully enrolled!");
      router.push(`/learn/${course.id}`);
    } catch (error) {
      alert("Error enrolling: " + error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !course) return;

    try {
      const { error } = await supabase.from("reviews").upsert({
        course_id: course.id,
        student_id: currentUser.id,
        rating,
        review_text: reviewText,
      });

      if (error) throw error;

      alert("Review submitted!");
      setReviewText("");
      setSubmitReviewForm(false);
      // Refresh reviews
      window.location.reload();
    } catch (error) {
      alert("Error submitting review: " + error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        Loading...
      </div>
    );

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        Course not found
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with back button */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-indigo-400 hover:underline">
            ← Back to Courses
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg mb-4">{course.description}</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm opacity-90">Instructor</p>
                <p className="font-semibold">{course.users?.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Category</p>
                <p className="font-semibold">{course.categories?.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Level</p>
                <p className="font-semibold">{course.level}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg shadow-lg p-6">
            <img
              src={course.thumbnail || "https://picsum.photos/400/250"}
              alt={course.title}
              className="w-full h-40 object-cover rounded mb-4"
            />
            <div className="mb-4">
              <p className="text-3xl font-bold">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </p>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-lg font-semibold">
                {course.rating.toFixed(1)} ({course.total_rating_count} reviews)
              </span>
            </div>

            {!isEnrolled ? (
              <button
                onClick={handleEnroll}
                disabled={!currentUser}
                className="w-full bg-indigo-600 text-white py-3 rounded font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {currentUser ? "Enroll Now" : "Login to Enroll"}
              </button>
            ) : (
              <Link
                href={`/learn/${course.id}`}
                className="block w-full text-center bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 transition"
              >
                Continue Learning →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Curriculum */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-slate-100">Course Curriculum</h2>

              {sections.length === 0 ? (
                <p className="text-slate-400">No lessons available yet</p>
              ) : (
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="border border-slate-700 rounded-lg p-4 hover:border-indigo-500 transition">
                      <h3 className="font-semibold text-lg text-slate-100">{section.title}</h3>
                      {section.description && (
                        <p className="text-slate-400 text-sm mt-2">
                          {section.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Instructor Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-slate-100">About Instructor</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-100">{course.users?.name}</h3>
                  <p className="text-slate-400">{course.users?.bio}</p>
                  <p className="text-sm text-slate-500">
                    {course.users?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-slate-100">Reviews & Ratings</h2>

              {isEnrolled && currentUser && (
                <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
                  {!submitReviewForm ? (
                    <button
                      onClick={() => setSubmitReviewForm(true)}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      + Write a Review
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Rating
                        </label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="bg-slate-700 border border-slate-600 text-slate-100 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          placeholder="Share your thoughts..."
                          rows={4}
                          className="bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmitReviewForm(false)}
                          className="flex-1 bg-slate-700 text-slate-300 py-2 rounded hover:bg-slate-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-slate-400">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-700 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-100">
                            {review.users?.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            {"⭐".repeat(review.rating)}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-slate-300">{review.review_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Stats */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Created on</p>
                    <p className="font-semibold text-slate-100">
                      {new Date(course.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Lessons</p>
                    <p className="font-semibold text-slate-100">{sections.length} sections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
