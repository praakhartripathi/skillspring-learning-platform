// Types for the entire application
export type UserRole = 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile_picture_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  category_id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rating: number;
  total_rating_count: number;
  created_at: string;
  updated_at: string;
  users?: User; // instructor details
  categories?: Category; // category details
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  is_completed: boolean;
  watched_duration_seconds: number;
  completed_at?: string;
}

export interface Review {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
  users?: User; // reviewer info
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  payment_method: 'mock' | 'stripe' | 'razorpay';
  status: 'pending' | 'success' | 'failed';
  transaction_id?: string;
  created_at: string;
}
