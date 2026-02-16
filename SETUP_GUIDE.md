# SkillSpring Learning Platform - Setup Guide

## Quick Start (24-Hour Build)

### 1. ✅ Database Setup (REQUIRED - Do This First!)
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project → SQL Editor
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste and run the query
5. Add demo categories:
   ```sql
   INSERT INTO categories (name, description) VALUES 
     ('Web Development', 'Learn HTML, CSS, JavaScript, React, Next.js'),
     ('Data Science', 'Python, Data Analysis, Machine Learning'),
     ('Mobile Development', 'iOS, Android, React Native'),
     ('UI/UX Design', 'Design principles, Figma, Prototyping'),
     ('Cloud & DevOps', 'AWS, Docker, Kubernetes')
   ON CONFLICT (name) DO NOTHING;
   ```

### 2. 🔑 Create Demo User Accounts
Run these SQL commands in Supabase SQL Editor:

```sql
-- INSERT DEMO USERS
-- Password: password123 (will be set via auth)

-- For this, use Supabase Auth UI or the sign-up form on the app
-- Or manually create users via:
-- INSERT INTO auth.users with email: student@test.com, instructor@test.com, admin@test.com

-- Then update their roles:
UPDATE users SET role = 'student' WHERE email = 'student@test.com';
UPDATE users SET role = 'instructor' WHERE email = 'instructor@test.com';
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

### 3. 🚀 Start Development Server
```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## User Roles & Workflows

### 👨‍🎓 Student
1. Login as student
2. Browse courses on homepage
3. Click course → Click "Enroll Now"
4. Go to dashboard → Click course → Watch lessons
5. Mark lessons complete → Leave review

**Demo Account:** student@test.com / password123

### 👨‍🏫 Instructor
1. Signup as Instructor
2. Go to Instructor Dashboard
3. Click "+ Create Course"
4. Fill in course details
5. Click "Create Course & Continue"
6. Add Sections → Add Lessons (with YouTube/Vimeo URLs)
7. Click "Publish & Submit for Approval"
8. Wait for admin approval

**Demo Account:** instructor@test.com / password123

### 🛡️ Admin
1. Login as admin
2. Go to Admin Dashboard
3. See pending courses in approval queue
4. Click "Approve" or "Reject"
5. View platform statistics

**Demo Account:** admin@test.com / password123

---

## Features Implemented

### ✅ Authentication
- Signup with role selection
- Login with automatic role-based redirection
- Logout functionality
- Protected routes (middleware)

### ✅ Marketplace
- Browse all approved courses
- Filter by category, price, rating, level
- Course detail page with full info
- Enrollment functionality

### ✅ Instructor Features
- Create courses
- Add course sections
- Add lessons with video URLs (YouTube, Vimeo, custom links)
- Set pricing and course details
- Submit for admin approval
- View course status (Draft, Pending, Approved)

### ✅ Student Features
- Browse and enroll in courses
- Course player with lesson sidebar
- Mark lessons as complete
- Progress tracking (%)
- Leave reviews & ratings
- View all enrolled courses on dashboard

### ✅ Admin Features
- Dashboard with platform stats
- Approve/reject courses
- View pending course queue
- Manage user roles

### ✅ Reviews & Ratings
- Students can review only if enrolled
- 1-5 star ratings
- Review text
- Auto-calculated course rating

---

## Video URL Formats Supported

1. **YouTube:** `https://www.youtube.com/watch?v=VIDEO_ID`
2. **Vimeo:** `https://vimeo.com/VIDEO_ID`
3. **Custom MP4:** `https://example.com/video.mp4`

---

## Database Schema

```
users (id, email, name, role, profile_picture_url, bio)
categories (id, name, description)
courses (id, instructor_id, category_id, title, description, price, level, status, rating)
course_sections (id, course_id, title, order_index)  
course_lessons (id, section_id, title, video_url, duration_minutes, order_index)
enrollments (id, student_id, course_id, progress_percentage)
lesson_progress (id, student_id, lesson_id, is_completed, watched_duration_seconds)
reviews (id, course_id, student_id, rating, review_text)
payments (optional - for future payment integration)
```

---

## Testing Checklist

- [ ] Signup as student/instructor works
- [ ] Login redirects to correct dashboard
- [ ] Instructor can create a course
- [ ] Admin can approve course
- [ ] Student can enroll in course
- [ ] Course player loads lessons
- [ ] Marking lesson complete updates progress
- [ ] Reviews can be left only when enrolled
- [ ] Admin dashboard shows stats
- [ ] Filters on homepage work

---

## Deployment to Vercel

```bash
git add .
git commit -m "SkillSpring platform complete"
git push origin main
```

Then:
1. Go to [Vercel Dashboard](https://vercel.com)
2. Import project from GitHub
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## Next Steps (Future Enhancements)

- [ ] Payment integration (Razorpay/Stripe)
- [ ] Video upload to Supabase Storage
- [ ] Email notifications
- [ ] Certificate generation
- [ ] Advanced search & recommendations
- [ ] Instructor earnings dashboard
- [ ] Wishlist functionality
- [ ] Mobile app (React Native)

---

## Support

For issues, check:
1. Supabase logs
2. Browser console errors
3. Auth status on `/login`
4. Database schema matches `supabase-schema.sql`
