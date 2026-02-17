"use client";

import Link from "next/link";

function extractYouTubeThumbnail(videoUrl: string | undefined): string {
  if (!videoUrl) return "https://picsum.photos/400/200";

  // Extract video ID from various YouTube URL formats
  let videoId = "";

  if (videoUrl.includes("youtu.be/")) {
    videoId = videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (videoUrl.includes("youtube.com/watch")) {
    videoId = new URL(videoUrl).searchParams.get("v") || "";
  } else if (videoUrl.includes("youtube.com/embed/")) {
    videoId = videoUrl.split("embed/")[1]?.split("?")[0] || "";
  }

  return videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : "https://picsum.photos/400/200";
}

export default function CourseCard({ course }: any) {
  // Get first lesson's video URL for thumbnail
  const firstLesson = Array.isArray(course.course_lessons)
    ? course.course_lessons[0]
    : null;
  const videoUrl = firstLesson?.video_url;
  const instructorName = course.users?.name || "Unknown Instructor";
  const thumbnail = extractYouTubeThumbnail(videoUrl) || course.thumbnail || "https://picsum.photos/400/200";
  const lessonCount = Array.isArray(course.course_lessons) ? course.course_lessons.length : 0;

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="border border-slate-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-500 transition cursor-pointer bg-slate-900 h-full flex flex-col">

        {/* Thumbnail */}
        <div className="relative w-full h-40 bg-slate-800 overflow-hidden">
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/400/200";
            }}
          />
        </div>

        <div className="p-4 space-y-2 flex-1 flex flex-col">

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-slate-400">
            {instructorName}
          </p>

          <div className="flex-1"></div>

          {/* Rating and Lessons in one row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-slate-300">
              ⭐ <span className="text-slate-400">New</span>
            </div>
            <p className="text-xs text-slate-400">
              {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Price */}
          <p className="font-bold text-lg text-indigo-400">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </p>

        </div>
      </div>
    </Link>
  );
}
