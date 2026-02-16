"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function CourseBuilder({ params }: any) {

  // Section state
  const [sectionTitle, setSectionTitle] = useState("");

  // Lesson state
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sectionId, setSectionId] = useState(""); // This is temporary

  const addSection = async () => {
    await supabase.from("course_sections").insert({
      course_id: params.id,
      title: sectionTitle,
    });
    setSectionTitle("");
  };

  const addLesson = async () => {
    // In a real app, you'd get section_id from the UI, not a text input
    await supabase.from("course_lessons").insert({
      section_id: sectionId,
      title: lessonTitle,
      video_url: videoUrl,
    });
    setLessonTitle("");
    setVideoUrl("");
    setSectionId("");
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Uploads the file and overwrites if it already exists
    await supabase.storage
      .from("thumbnails")
      .upload(`course-${params.id}`, file, { upsert: true });
  };

  const submitForApproval = async () => {
    await supabase
      .from("courses")
      .update({ status: "pending" })
      .eq("id", params.id);
    // Optionally, redirect or show a success message
  };

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-bold">
        Course Builder
      </h1>

      {/* 1. Add Section */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Add Section</h2>
        <input
          className="border p-2 w-full"
          placeholder="New Section Title"
          onChange={(e) => setSectionTitle(e.target.value)}
          value={sectionTitle}
        />
        <button onClick={addSection} className="bg-black text-white px-4 py-2">Add Section</button>
      </div>

      {/* 2. Add Lesson */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Add Lesson</h2>
        <input className="border p-2 w-full" placeholder="Section ID (temporary)" onChange={(e) => setSectionId(e.target.value)} value={sectionId} />
        <input className="border p-2 w-full" placeholder="Lesson Title" onChange={(e) => setLessonTitle(e.target.value)} value={lessonTitle} />
        <input className="border p-2 w-full" placeholder="Video URL" onChange={(e) => setVideoUrl(e.target.value)} value={videoUrl} />
        <button onClick={addLesson} className="bg-black text-white px-4 py-2">Add Lesson</button>
      </div>

      {/* 3. Upload Thumbnail */}
      <div className="space-y-2 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Upload Thumbnail</h2>
        <input type="file" onChange={handleUpload} />
      </div>

      {/* 4. Submit for Approval */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Submit For Approval</h2>
        <button onClick={submitForApproval} className="mt-2 bg-blue-500 text-white px-6 py-2 rounded">Submit For Approval</button>
      </div>
    </div>
  );
}
