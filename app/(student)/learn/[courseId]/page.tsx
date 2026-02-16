"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Course, CourseSection, CourseLesson, User } from "@/app/lib/types";
import Link from "next/link";

export default function CourseLearningPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { courseId } = useParams();

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        // Check auth
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

        setCurrentUser(userProfile);

        // Get course
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .eq("status", "approved")
          .single();

        if (!courseData) {
          router.push("/");
          return;
        }

        setCourse(courseData);

        // Check enrollment
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

        // Get sections
        const { data: sectionsData } = await supabase
          .from("course_sections")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index");

        setSections(sectionsData || []);

        // Get all lessons
        if (sectionsData && sectionsData.length > 0) {
          const { data: lessonsData } = await supabase
            .from("course_lessons")
            .select("*")
            .in("section_id", sectionsData.map((s) => s.id))
            .order("order_index");

          setLessons(lessonsData || []);

          // Set first lesson as current
          if (lessonsData && lessonsData.length > 0) {
            setCurrentLesson(lessonsData[0]);
          }
        }

        // Get completed lessons
        const { data: progressData } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("student_id", authUser.id)
          .eq("is_completed", true);

        setCompletedLessons(progressData?.map((p) => p.lesson_id) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, router]);

  const markLessonComplete = async () => {
    if (!currentLesson || !currentUser) return;

    try {
      const { error } = await supabase.from("lesson_progress").upsert({
        student_id: currentUser.id,
        lesson_id: currentLesson.id,
        is_completed: true,
      });

      if (error) throw error;

      setCompletedLessons([...completedLessons, currentLesson.id]);
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const renderVideoEmbed = (url: string | undefined) => {
    if (!url) return <p className="text-slate-400">No video available</p>;

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URL(url).searchParams.get("v");
      return (
        <iframe
          className="w-full h-96 rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          allowFullScreen
        ></iframe>
      );
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return (
        <iframe
          className="w-full h-96 rounded-lg"
          src={`https://player.vimeo.com/video/${videoId}`}
          allowFullScreen
        ></iframe>
      );
    }

    // Direct link or custom
    return (
      <video className="w-full h-96 bg-black rounded-lg" controls>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
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

  const progressPercentage = Math.round(
    (completedLessons.length / lessons.length) * 100
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-slate-400 text-sm">
              Progress: {Math.round(progressPercentage)}%
            </p>
          </div>
          <Link
            href="/student"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentLesson ? (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="bg-slate-900 rounded-lg overflow-hidden">
                {renderVideoEmbed(currentLesson.video_url)}
              </div>

              {/* Lesson Info */}
              <div className="bg-slate-900 rounded-lg p-6 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {currentLesson.title}
                  </h2>
                  {currentLesson.description && (
                    <p className="text-slate-400">{currentLesson.description}</p>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-4">
                  {completedLessons.includes(currentLesson.id) ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <span className="text-xl">✓</span>
                      <span>You've completed this lesson</span>
                    </div>
                  ) : (
                    <button
                      onClick={markLessonComplete}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold">Course Progress</p>
                  <p className="text-sm">{progressPercentage}%</p>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-lg p-8 text-center">
              <p className="text-slate-400">No lessons available</p>
            </div>
          )}
        </div>

        {/* Sidebar - Lessons List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-lg overflow-hidden sticky top-8">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold">Course Content</h3>
              <p className="text-xs text-slate-400">
                {completedLessons.length} of {lessons.length} completed
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {sections.map((section) => {
                const sectionLessons = lessons.filter(
                  (l) => l.section_id === section.id
                );
                return (
                  <div key={section.id}>
                    <div className="px-4 py-2 bg-slate-800 text-sm font-semibold border-b border-slate-700">
                      {section.title}
                    </div>
                    {sectionLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-700 transition text-sm ${
                          currentLesson?.id === lesson.id
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-slate-800 text-slate-300"
                        } ${
                          completedLessons.includes(lesson.id)
                            ? "opacity-75"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {completedLessons.includes(lesson.id) ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="w-4"></span>
                          )}
                          <span className="line-clamp-2">{lesson.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
