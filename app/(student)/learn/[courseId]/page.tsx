"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function CoursePlayer({
  params,
}: {
  params: { courseId: string };
}) {
  const [sections, setSections] = useState<any[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastWatchedLessonId, setLastWatchedLessonId] = useState<string | null>(null);

  useEffect(() => {
    const initializePlayer = async () => {
      // 1. Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // 2. Fetch course content
      const { data: fetchedSections } = await supabase
        .from("course_sections")
        .select(`id, title, course_lessons (id, title, video_url)`)
        .eq("course_id", params.courseId);

      if (!fetchedSections || fetchedSections.length === 0) return;
      setSections(fetchedSections);

      // 3. Fetch user progress to find where they left off
      const lessonIds = fetchedSections.flatMap(s => s.course_lessons.map((l: any) => l.id));
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, last_watched")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      // 4. Find the last watched lesson
      const lastWatchedProgress = progress?.find(p => p.last_watched);
      let lessonToPlay;

      if (lastWatchedProgress) {
        for (const section of fetchedSections) {
          const foundLesson = section.course_lessons.find((l: any) => l.id === lastWatchedProgress.lesson_id);
          if (foundLesson) {
            lessonToPlay = foundLesson;
            setLastWatchedLessonId(foundLesson.id);
            break;
          }
        }
      }

      // 5. Default to the first lesson if none was watched
      if (!lessonToPlay) {
        lessonToPlay = fetchedSections[0]?.course_lessons[0];
      }

      // 6. Set the initial video
      if (lessonToPlay) {
        setCurrentVideoUrl(lessonToPlay.video_url);
        setCurrentLessonId(lessonToPlay.id);
      }
    };

    initializePlayer();
  }, [params.courseId]);

  const handleLessonClick = async (lesson: any) => {
    setCurrentVideoUrl(lesson.video_url);
    setCurrentLessonId(lesson.id);

    if (userId) {
      // Update last_watched status
      if (lastWatchedLessonId && lastWatchedLessonId !== lesson.id) {
        await supabase.from("lesson_progress").update({ last_watched: false }).match({ user_id: userId, lesson_id: lastWatchedLessonId });
      }
      await supabase.from("lesson_progress").upsert({ lesson_id: lesson.id, user_id: userId, last_watched: true });
      setLastWatchedLessonId(lesson.id);
    }
  };

  const markComplete = async () => {
    if (userId && currentLessonId) {
      await supabase.from("lesson_progress").upsert({
        lesson_id: currentLessonId,
        user_id: userId,
        completed: true,
      });
      alert("Lesson marked as complete!");
    }
  };

  return (
    <div className="flex h-screen">

      {/* 🎬 VIDEO PLAYER */}
      <div className="flex-1 p-6">
        {currentVideoUrl ? (
          <iframe
            key={currentVideoUrl}
            className="w-full h-[500px]"
            src={currentVideoUrl}
            allowFullScreen
          />
        ) : (
          <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">Select a lesson to begin.</div>
        )}
        <button onClick={markComplete} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Mark Complete
        </button>
      </div>

      {/* 📚 LESSON SIDEBAR */}
      <div className="w-80 border-l p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">Lessons</h2>

        {sections.map((section: any) => (
          <div key={section.id} className="mb-4">
            <h3 className="font-semibold">{section.title}</h3>

            {section.course_lessons.map((lesson: any) => (
              <div key={lesson.id} onClick={() => handleLessonClick(lesson)} className="text-sm p-2 hover:bg-gray-100 cursor-pointer">
                ▶ {lesson.title}
              </div>
            ))}
          </div>
        ))}

      </div>

    </div>
  );
}
