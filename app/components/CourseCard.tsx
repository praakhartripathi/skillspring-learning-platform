import Link from "next/link";

export default function CourseCard({ course }: any) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">

        {/* Thumbnail */}
        <img
          src={course.thumbnail || "https://picsum.photos/400"}
          alt={course.title}
          className="w-full h-40 object-cover"
        />

        <div className="p-4 space-y-2">

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-sm text-gray-500">
            {course.instructor_name || "Unknown Instructor"}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 text-sm">
            ⭐ {course.rating || 0}
          </div>

          {/* Lessons Count */}
          <p className="text-xs text-gray-400">
            {course.total_lessons || 0} lessons
          </p>

          {/* Price */}
          <p className="font-bold text-lg">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </p>

        </div>
      </div>
    </Link>
  );
}
