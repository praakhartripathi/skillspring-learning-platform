"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Course, CourseSection, CourseLesson } from "@/app/lib/types";
import Link from "next/link";

export default function CourseBuilderPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          router.push("/login");
          return;
        }

        // Get course
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();

        if (!courseData || courseData.instructor_id !== authUser.id) {
          router.push("/instructor");
          return;
        }

        setCourse(courseData);

        // Get sections
        const { data: sectionsData } = await supabase
          .from("course_sections")
          .select("*")
          .eq("course_id", id)
          .order("order_index");

        setSections(sectionsData || []);
        const sections = sectionsData || [];
        if (sections.length > 0) {
          setActiveSection(sections[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!activeSection) {
        setLessons([]);
        return;
      }
      setLessonsLoading(true);
      try {
        const { data } = await supabase
          .from("course_lessons")
          .select("*")
          .eq("section_id", activeSection)
          .order("order_index");
        setLessons(data || []);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
  }, [activeSection]);

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle || !course) return;

    try {
      const { data, error } = await supabase
        .from("course_sections")
        .insert({
          course_id: course.id,
          title: sectionTitle,
          order_index: sections.length,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSections([...sections, data]);
      setSectionTitle("");
      setShowAddSection(false);
      setActiveSection(data.id);
    } catch (err: any) {
      console.error("Error adding section:", err);
      alert(`Error adding section: ${err.message}`);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !activeSection) return;

    try {
      const { data, error } = await supabase
        .from("course_lessons")
        .insert({
          section_id: activeSection,
          title: lessonTitle,
          video_url: videoUrl,
          order_index: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setLessons([...lessons, data]);
      setLessonTitle("");
      setVideoUrl("");
      alert("Lesson added successfully!");
    } catch (error) {
      alert("Error adding lesson: " + error);
    }
  };

  const handlePublish = async () => {
    if (!course) return;

    if (sections.length === 0) {
      alert("Please add at least one section to your course before publishing.");
      return;
    }

    let totalLessons = 0;
    for (const section of sections) {
      const { data } = await supabase
        .from("course_lessons")
        .select("id")
        .eq("section_id", section.id);
      totalLessons += data?.length || 0;
    }

    if (totalLessons === 0) {
      alert("Please add at least one lesson to your course before publishing.");
      return;
    }

    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "pending" })
        .eq("id", course.id);

      if (error) throw error;

      alert("Course submitted for approval! Admins will review it shortly.");
      router.push("/instructor");
    } catch (error: any) {
      alert("Error publishing course: " + (error.message || error));
    }
  };

  if (loading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!course)
    return <div className="flex items-center justify-center min-h-screen">Course not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-slate-400">Status: {course.status}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePublish}
              disabled={course.status !== "draft"}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish & Submit for Approval
            </button>
            <Link
              href="/instructor"
              className="px-4 py-2 text-slate-300 bg-slate-800 rounded hover:bg-slate-700 transition"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflow Guide */}
        <div className="lg:col-span-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6 text-slate-100">
            <h3 className="text-xl font-bold mb-4">📋 Course Setup Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-semibold">Create Course</p>
                  <p className="text-xs text-indigo-200">✓ Done</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${sections.length > 0 ? "bg-green-600" : "bg-slate-700"}`}>2</span>
                <div>
                  <p className="font-semibold">Add Sections</p>
                  <p className="text-xs text-indigo-200">{sections.length > 0 ? `✓ ${sections.length} added` : "Pending"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${lessons.length > 0 ? "bg-green-600" : "bg-slate-700"}`}>3</span>
                <div>
                  <p className="font-semibold">Add Lessons</p>
                  <p className="text-xs text-indigo-200">{lessons.length > 0 ? `✓ ${lessons.length} added` : "Pending"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${sections.length > 0 && lessons.length > 0 ? "bg-green-600" : "bg-slate-700"}`}>4</span>
                <div>
                  <p className="font-semibold">Add Videos</p>
                  <p className="text-xs text-indigo-200">YouTube/Vimeo/MP4</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${sections.length > 0 && lessons.length > 0 ? "bg-green-600" : "bg-slate-700"}`}>5</span>
                <div>
                  <p className="font-semibold">Publish</p>
                  <p className="text-xs text-indigo-200">Submit to admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left: Sections */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold mb-4">📚 Course Modules</h2>

              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded mb-2 transition ${
                    activeSection === section.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {section.title}
                </button>
              ))}

              <button
                onClick={() => setShowAddSection(!showAddSection)}
                className="w-full mt-4 px-4 py-2 border-2 border-dashed border-slate-700 rounded text-slate-400 hover:bg-slate-800 transition"
              >
                + Add Module/Section
              </button>

              {showAddSection && (
                <form onSubmit={handleAddSection} className="mt-4 space-y-2">
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. Basics, Advanced Topics"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700 transition"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddSection(false)}
                      className="flex-1 bg-slate-700 text-slate-300 py-2 rounded text-sm hover:bg-slate-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Helper Tips */}
            <div className="bg-slate-800 border border-slate-700 rounded p-3 mt-6">
              <p className="text-xs font-semibold text-indigo-400 mb-2">💡 Pro Tips</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>✓ Create 3-5 modules for a complete course</li>
                <li>✓ Add 5-10 lessons per module</li>
                <li>✓ Use clear, descriptive titles</li>
                <li>✓ Include video links for all lessons</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Add Lesson */}
        {activeSection && (
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-2">
                  ➕ Add Lesson to "{sections.find((s) => s.id === activeSection)?.title}"
                </h2>
                <p className="text-sm text-slate-400">Complete the form below to add a new lesson</p>
              </div>

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. Introduction to Variables, Advanced Concepts"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Supported: YouTube, Vimeo, Loom, or direct MP4 links
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded font-semibold hover:bg-indigo-700 transition"
                >
                  Add Lesson
                </button>
              </form>

              {/* Display existing lessons */}
              <div className="border-t border-slate-800 pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>📝 Lessons in this module</span>
                  <span className="ml-auto bg-indigo-600 rounded-full px-2 py-1 text-sm font-bold">{lessons.length}</span>
                </h3>
                <div className="space-y-2" id={`lessons-${activeSection}`}>
                  {lessonsLoading ? (
                    <p className="text-slate-400 text-sm">Loading lessons...</p>
                  ) : lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between bg-slate-800 border border-slate-700 p-3 rounded hover:border-indigo-600 transition"
                      >
                        <div className="flex-1">
                          <p className="text-slate-300 font-medium">{lesson.title}</p>
                          {lesson.video_url && (
                            <p className="text-xs text-green-400 mt-1">✓ Video linked</p>
                          )}
                        </div>
                        {lesson.video_url && (
                          <a
                            href={lesson.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                          >
                            View →
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm bg-slate-800 p-3 rounded">
                      No lessons in this module yet. Add your first lesson above! 👆
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

