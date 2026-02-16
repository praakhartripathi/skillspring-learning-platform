-- ============================================================
-- SkillSpring Learning Platform - Recommended Supabase Schema
-- This schema is designed to support the features observed in the codebase.
-- ============================================================

-- 1. USERS TABLE
-- Extends Supabase's built-in auth.users table with public user data.
-- The 'role' column is essential for differentiating between students, instructors, and admins.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('admin', 'instructor', 'student')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES TABLE
-- Stores course categories. Used in the 'Create Course' page.
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. COURSES TABLE
-- The core table for courses. Includes all fields from the 'Create Course' form
-- and a 'status' field for the approval workflow.
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  level VARCHAR(50) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  status VARCHAR(50) CHECK (status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COURSE_SECTIONS TABLE (MODULES)
-- Represents the sections or modules within a course.
-- 'order_index' is crucial for maintaining the order of sections as seen in the course builder.
CREATE TABLE IF NOT EXISTS public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COURSE_LESSONS TABLE
-- Represents the individual lessons within a section.
-- 'order_index' is used to order lessons correctly.
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  video_url TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENROLLMENTS TABLE
-- Tracks which students are enrolled in which courses.
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- 7. LESSON_PROGRESS TABLE
-- Tracks a student's progress through a course's lessons.
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, lesson_id)
);

-- 8. REVIEWS TABLE
-- Stores student ratings and reviews for courses.
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(course_id, student_id)
);

-- ============================================================
-- INDEXES (for improving query performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON public.course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_section_id ON public.course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- ============================================================
-- SEED DATA (Optional - for initial setup and testing)
-- ============================================================
-- Categories (already included for quick setup)
INSERT INTO public.categories (name) VALUES 
  ('Web Development'),
  ('Data Science'),
  ('Mobile Development'),
  ('UI/UX Design'),
  ('Cloud & DevOps')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------
-- Demo courses, sections, lessons, enrollment and a sample review
-- NOTE: these are conditional and will only insert if you have the
-- demo auth users (create via app signup or Supabase Auth UI):
--   instructor@test.com (role = 'instructor')
--   student@test.com    (role = 'student')
-- See `SETUP_GUIDE.md` for creating the demo users first.
-- ----------------------------------------------------------------

-- Course IDs are fixed here so related sections/lessons can reference them.
-- Course 1: Next.js Crash Course (free, approved)
INSERT INTO public.courses (id, instructor_id, category_id, title, description, thumbnail, price, level, status, created_at, updated_at)
SELECT
  '10000000-0000-0000-0000-000000000001'::uuid,
  u.id,
  c.id,
  'Next.js Crash Course',
  'A short crash course covering Next.js fundamentals — routing, server components, and data fetching.',
  'https://picsum.photos/seed/nextjs/800/450',
  0.00,
  'Beginner',
  'approved',
  now(),
  now()
FROM public.users u
JOIN public.categories c ON c.name = 'Web Development'
WHERE u.email = 'instructor@test.com'
ON CONFLICT (id) DO NOTHING;

-- Course 2: Advanced React Patterns (paid, approved)
INSERT INTO public.courses (id, instructor_id, category_id, title, description, thumbnail, price, level, status, created_at, updated_at)
SELECT
  '10000000-0000-0000-0000-000000000002'::uuid,
  u.id,
  c.id,
  'Advanced React Patterns',
  'Deep-dive into advanced React patterns, hooks, and performance optimization.',
  'https://picsum.photos/seed/react/800/450',
  49.99,
  'Intermediate',
  'approved',
  now(),
  now()
FROM public.users u
JOIN public.categories c ON c.name = 'Web Development'
WHERE u.email = 'instructor@test.com'
ON CONFLICT (id) DO NOTHING;

-- Sections for Course 1
INSERT INTO public.course_sections (id, course_id, title, order_index, created_at)
SELECT '20000000-0000-0000-0000-000000000001'::uuid, c.id, 'Getting Started', 0, now()
FROM public.courses c WHERE c.id = '10000000-0000-0000-0000-000000000001'::uuid
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.course_sections (id, course_id, title, order_index, created_at)
SELECT '20000000-0000-0000-0000-000000000002'::uuid, c.id, 'Core Concepts', 1, now()
FROM public.courses c WHERE c.id = '10000000-0000-0000-0000-000000000001'::uuid
ON CONFLICT (id) DO NOTHING;

-- Lessons for Course 1 (YouTube example links)
INSERT INTO public.course_lessons (id, section_id, title, video_url, order_index)
SELECT '30000000-0000-0000-0000-000000000001'::uuid, s.id, 'Introduction & Setup', 'https://www.youtube.com/watch?v=ysz5S6PUM-U', 0
FROM public.course_sections s WHERE s.id = '20000000-0000-0000-0000-000000000001'::uuid
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.course_lessons (id, section_id, title, video_url, order_index)
SELECT '30000000-0000-0000-0000-000000000002'::uuid, s.id, 'Pages & Routing', 'https://www.youtube.com/watch?v=QJ6j0VZ6WkA', 1
FROM public.course_sections s WHERE s.id = '20000000-0000-0000-0000-000000000002'::uuid
ON CONFLICT (id) DO NOTHING;

-- Sections & Lessons for Course 2
INSERT INTO public.course_sections (id, course_id, title, order_index, created_at)
SELECT '20000000-0000-0000-0000-000000000003'::uuid, c.id, 'Patterns', 0, now()
FROM public.courses c WHERE c.id = '10000000-0000-0000-0000-000000000002'::uuid
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.course_lessons (id, section_id, title, video_url, order_index)
SELECT '30000000-0000-0000-0000-000000000003'::uuid, s.id, 'Higher-Order Components', 'https://www.youtube.com/watch?v=YbJ1l2cpagM', 0
FROM public.course_sections s WHERE s.id = '20000000-0000-0000-0000-000000000003'::uuid
ON CONFLICT (id) DO NOTHING;

-- Enroll the demo student into Course 1 (if student exists)
INSERT INTO public.enrollments (student_id, course_id)
SELECT u.id, c.id
FROM public.users u
JOIN public.courses c ON c.id = '10000000-0000-0000-0000-000000000001'::uuid
WHERE u.email = 'student@test.com'
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Add a sample review (if student exists)
INSERT INTO public.reviews (id, course_id, student_id, rating, review_text)
SELECT '40000000-0000-0000-0000-000000000001'::uuid, c.id, u.id, 5, 'Fantastic crash course — highly recommended!'
FROM public.users u
JOIN public.courses c ON c.id = '10000000-0000-0000-0000-000000000001'::uuid
WHERE u.email = 'student@test.com'
ON CONFLICT (course_id, student_id) DO NOTHING;

-- NOTE: Run this seed after creating demo users (see `SETUP_GUIDE.md`).
-- If you signed up `instructor@test.com` and `student@test.com` via the app,
-- these demo courses/lessons will be inserted automatically.
