"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { Course, CourseSection, CourseLesson } from "@/app/lib/types";
import Link from "next/link";

export default function CourseBuilderPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
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
        if (sectionsData?.length > 0) {
          setActiveSection(sectionsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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

      if (error) throw error;

      setSections([...sections, data]);
      setSectionTitle("");
      setShowAddSection(false);
      setActiveSection(data.id);
    } catch (error) {
      alert("Error adding section: " + error);
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

      alert("Lesson added successfully!");
      setLessonTitle("");
      setVideoUrl("");
    } catch (error) {
      alert("Error adding lesson: " + error);
    }
  };

  const handlePublish = async () => {
    if (!course) return;

    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: "pending" })
        .eq("id", course.id);

      if (error) throw error;

      alert("Course submitted for approval! Admins will review it shortly.");
      router.push("/instructor");
    } catch (error) {
      alert("Error publishing course: " + error);
    }
  };

  if (loading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!course)
    return <div className="flex items-center justify-center min-h-screen">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600">Status: {course.status}</p>
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
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Sections */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-4">Sections</h2>

            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-2 rounded mb-2 transition ${
                  activeSection === section.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {section.title}
              </button>
            ))}

            <button
              onClick={() => setShowAddSection(!showAddSection)}
              className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition"
            >
              + Add Section
            </button>

            {showAddSection && (
              <form onSubmit={handleAddSection} className="mt-4 space-y-2">
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Section title"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded text-sm hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Add Lesson */}
        {activeSection && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">
                Add Lesson to {sections.find((s) => s.id === activeSection)?.title}
              </h2>

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. Introduction to Variables"
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (YouTube/Vimeo link or custom)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Paste YouTube, Vimeo, or Loom URLs directly
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition"
                >
                  Add Lesson
                </button>
              </form>

              {/* Display existing lessons */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Lessons in this section</h3>
                <div className="space-y-2" id={`lessons-${activeSection}`}>
                  {/* Will be populated by fetching lessons */}
                  <p className="text-gray-600 text-sm">Load lessons component</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
