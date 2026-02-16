import Link from "next/link";

export default function CourseCard({ course }: any) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="border border-slate-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:border-indigo-500 transition cursor-pointer bg-slate-900">

        {/* Thumbnail */}
        <img
          src={course.thumbnail || "https://picsum.photos/400"}
          alt={course.title}
          className="w-full h-40 object-cover"
        />

        <div className="p-4 space-y-2">

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 text-slate-100">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-slate-400">
            {course.instructor_name || "Unknown Instructor"}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            ⭐ {course.rating || 0}
          </div>

          {/* Lessons Count */}
          <p className="text-xs text-slate-500">
            {course.total_lessons || 0} lessons
          </p>

          {/* Price */}
          <p className="font-bold text-lg text-indigo-400">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </p>

        </div>
      </div>
    </Link>
  );
}
