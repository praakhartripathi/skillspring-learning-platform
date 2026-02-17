"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function LearnCourse() {
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitReviewForm, setSubmitReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [overallProgress, setOverallProgress] = useState(0);
  const router = useRouter();
  const { courseId } = useParams();

  useEffect(() => {
    if (!courseId) return;

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
          .eq("course_id", courseId)
          .single();

        if (!enrollment) {
          router.push(`/courses/${courseId}`);
          return;
        }

        // Get course
        const { data: courseData } = await supabase
          .from("courses")
          .select(`
            *,
            users(id, name, email, bio),
            categories(id, name)
          `)
          .eq("id", courseId)
          .single();

        setCourse(courseData);

        // Get sections with lessons
        const { data: sectionsData } = await supabase
          .from("course_sections")
          .select(`
            *,
            course_lessons(
              id,
              title,
              video_url,
              order_index
            )
          `)
          .eq("course_id", courseId)
          .order("order_index");

        setSections(sectionsData || []);

        // Get lesson IDs for this course to filter progress
        const lessonIds = (sectionsData || [])
          .flatMap((section: any) => section.course_lessons?.map((l: any) => l.id) || [])
          .filter(Boolean);

        // Get lesson progress filtered to this course only
        let progressData = [];
        if (lessonIds.length > 0) {
          const { data } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("student_id", authUser.id)
            .in("lesson_id", lessonIds);
          progressData = data || [];
        }

        setLessonProgress(progressData || []);

        // Get reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, users(name)")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });

        setReviews(reviewsData || []);

        // Set first lesson as selected
        if (sectionsData && sectionsData.length > 0) {
          const firstLesson = (sectionsData[0] as any).course_lessons?.[0];
          if (firstLesson) {
            setSelectedLessonId(firstLesson.id);
            setSelectedLesson(firstLesson);
          }
        }

        // Calculate overall progress for this course
        if (sectionsData && sectionsData.length > 0) {
          const totalLessons = sectionsData.reduce(
            (acc: number, section: any) => acc + (section.course_lessons?.length || 0),
            0
          );
          const courseLessonIds = new Set(
            sectionsData.flatMap((section: any) => section.course_lessons?.map((l: any) => l.id) || [])
          );
          const completedLessons = (progressData || []).filter(
            (p: any) => p.is_completed && courseLessonIds.has(p.lesson_id)
          ).length;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          setOverallProgress(progress);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, router]);

  const handleSelectLesson = (lesson: any) => {
    setSelectedLessonId(lesson.id);
    setSelectedLesson(lesson);
  };

  const handleMarkLessonComplete = async () => {
    if (!currentUser || !selectedLesson) return;

    try {
      const { error } = await supabase.from("lesson_progress").upsert({
        student_id: currentUser.id,
        lesson_id: selectedLesson.id,
        is_completed: true,
        completed_at: new Date(),
      });

      if (error) throw error;

      // Update local progress state
      const updatedProgress = lessonProgress.map((p: any) =>
        p.lesson_id === selectedLesson.id ? { ...p, is_completed: true } : p
      );
      if (!updatedProgress.some((p: any) => p.lesson_id === selectedLesson.id)) {
        updatedProgress.push({
          student_id: currentUser.id,
          lesson_id: selectedLesson.id,
          is_completed: true,
        });
      }
      setLessonProgress(updatedProgress);

      // Recalculate progress for this course only
      const totalLessons = sections.reduce(
        (acc: number, section: any) => acc + (section.course_lessons?.length || 0),
        0
      );
      const courseLessonIds = new Set(
        sections.flatMap((section: any) => section.course_lessons?.map((l: any) => l.id) || [])
      );
      const completedLessons = updatedProgress.filter(
        (p: any) => p.is_completed && courseLessonIds.has(p.lesson_id)
      ).length;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setOverallProgress(progress);
    } catch (error) {
      alert("Error marking lesson complete: " + error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !course) return;

    // Validate review text
    const text = reviewText?.trim();
    if (!text) {
      alert("Please write a review before submitting.");
      return;
    }

    try {
      const { error } = await supabase.from("reviews").upsert({
        course_id: course.id,
        student_id: currentUser.id,
        rating,
        review_text: text,
      });

      if (error) throw error;

      alert("Review submitted!");
      setReviewText("");
      setRating(5);
      setSubmitReviewForm(false);
      
      // Refresh reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, users(name)")
        .eq("course_id", course.id)
        .order("created_at", { ascending: false });
      setReviews(reviewsData || []);
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

  const isLessonComplete = lessonProgress.some(
    (p: any) => p.lesson_id === selectedLessonId && p.is_completed
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/student" className="text-2xl font-bold text-indigo-500">
            SkillSpring
          </Link>
          <Link
            href="/student"
            className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Lessons */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto flex-shrink-0">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>
            <p className="text-sm text-slate-400 mb-4">By {course.users?.name}</p>
            
            {/* Overall Progress */}
            <div className="mb-6">
              <p className="text-sm text-slate-300 mb-2">Course Progress</p>
              <div className="bg-slate-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{overallProgress}% complete</p>
            </div>

            {/* Sections and Lessons */}
            <div className="space-y-4">
              {sections.map((section: any) => (
                <div key={section.id}>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2 ml-2">
                    {section.course_lessons?.map((lesson: any) => {
                      const isCompleted = lessonProgress.some(
                        (p: any) => p.lesson_id === lesson.id && p.is_completed
                      );
                      const isSelected = selectedLessonId === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-slate-500">○</span>
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Video Player */}
            {selectedLesson && (
              <div className="mb-8">
                <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video mb-6">
                  {selectedLesson.video_url ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={
                        selectedLesson.video_url.includes("youtu.be")
                          ? selectedLesson.video_url.replace("youtu.be/", "youtube.com/embed/").split("?")[0]
                          : selectedLesson.video_url.includes("youtube.com/watch")
                            ? selectedLesson.video_url.replace("watch?v=", "embed/").split("&")[0]
                            : selectedLesson.video_url.includes("youtube.com/embed")
                              ? selectedLesson.video_url
                              : selectedLesson.video_url
                      }
                      title={selectedLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No video available
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-white">{selectedLesson.title}</h1>
                  <button
                    onClick={handleMarkLessonComplete}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      isLessonComplete
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isLessonComplete ? "✓ Completed" : "Mark as Complete"}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="border-t border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Reviews & Ratings</h2>
                <button
                  onClick={() => setSubmitReviewForm(!submitReviewForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {submitReviewForm ? "Cancel" : "Leave a Review"}
                </button>
              </div>

              {/* Submit Review Form */}
              {submitReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-slate-900 rounded-lg p-6 mb-8">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-3xl transition ${
                            star <= rating ? "text-yellow-400" : "text-slate-600"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts about this course..."
                      className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={4}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Submit Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review: any) => {
                    const safeRating = Math.max(0, Math.min(5, Math.floor(Number(review.rating) || 0)));
                    return (
                      <div key={review.id} className="bg-slate-900 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{review.users?.name}</h3>
                          <div className="flex gap-1">
                            {Array.from({ length: safeRating }).map((_, i) => (
                              <span key={i} className="text-yellow-400">
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm">{review.review_text}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}