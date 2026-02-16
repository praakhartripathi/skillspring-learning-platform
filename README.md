# SkillSpring - Online Learning Platform

A complete Udemy-like learning platform built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), and [Tailwind CSS](https://tailwindcss.com). Supports instructors uploading courses, students enrolling and watching lessons, course reviews, progress tracking, and admin moderation.

## 🚀 Features

### For Students
- **Course Discovery** - Browse, search, and filter courses by category, price, level, and rating
- **Enrollment** - Enroll in free and paid courses (mock payment system)
- **Course Player** - Watch lessons with video player (YouTube, Vimeo, MP4 support)
- **Progress Tracking** - Track lesson completion percentage per course
- **Reviews & Ratings** - Leave reviews and star ratings for enrolled courses
- **Dashboard** - View all enrolled courses with progress overview

### For Instructors
- **Course Creation** - Create courses with title, description, category, level, and pricing
- **Course Builder** - Add sections and lessons with video URLs directly
- **Course Status** - Monitor course approval status (Draft → Pending → Approved)
- **Dashboard** - View all courses with filtering by status
- **Publishing** - Submit courses for admin approval

### For Admins
- **Approval Queue** - Review pending courses with instructor and category details
- **Course Management** - Approve or reject course submissions with optional feedback
- **Platform Analytics** - View total users, courses, enrollments, and pending approvals
- **Dashboard** - Centralized overview of platform health

### General Features
- **Auth System** - Email/password signup with role selection (Student/Instructor)
- **Role-Based Access** - Middleware-enforced route protection
- **Database** - PostgreSQL with Supabase hosting
- **Video Hosting** - Supports YouTube embeds, Vimeo, and direct MP4 links

## 📋 Tech Stack

- **Frontend**: Next.js 16 with App Router, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Video Player**: HTML5 + embedded frames
- **Database**: PostgreSQL with row-level security foundation

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier available)
- GitHub account (for Vercel deployment)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd skillspring-learning-platform
npm install
```

### 2. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, paste the contents of `supabase-schema.sql` and execute
3. This creates 10 tables with seed categories (Web Development, Data Science, etc.)

### 3. Create Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from Supabase dashboard: Settings → API → Project URL and anon key

### 4. Create Demo Accounts

Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign up as:

**Student Account:**
- Email: `student@test.com`
- Password: `test123456`
- Role: Student

**Instructor Account:**
- Email: `instructor@test.com`
- Password: `test123456`
- Role: Instructor

**Admin Account:**
- Email: `admin@test.com`
- Password: `test123456`
- Role: Student (first), then update via SQL:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
  ```

### 5. Run Locally

```bash
npm run dev
```

The app will start on http://localhost:3000

## 📁 Project Structure

```
app/
├── (admin)/               # Admin role routes
│   └── admin/
│       ├── page.tsx       # Dashboard with approvals & analytics
│       └── categories/    # Category management
├── (auth)/                # Authentication routes
│   ├── login/
│   └── signup/
├── (instructor)/          # Instructor role routes
│   └── instructor/
│       ├── page.tsx       # Dashboard showing courses
│       ├── create-course/ # Course creation form
│       └── course-builder/[id]/ # Add sections & lessons
├── (student)/             # Student role routes
│   ├── student/           # Dashboard with enrolled courses
│   └── learn/[courseId]/  # Video player
├── components/            # Reusable components
│   ├── CourseCard.tsx
│   ├── EnrollButton.tsx
│   └── ReviewForm.tsx
├── courses/               # Public course routes
│   └── [id]/              # Course detail page
├── lib/                   # Utilities
│   ├── types.ts           # TypeScript interfaces
│   ├── auth.ts            # Auth helpers
│   └── supabaseClient.ts  # Supabase client
├── middleware.ts          # Route protection
├── layout.tsx             # Root layout
├── page.tsx               # Homepage with filters
└── globals.css            # Tailwind styles
```

## 🗄️ Database Schema

**Tables:**
1. `users` - User profiles with role (admin/instructor/student)
2. `categories` - Course categories (Web Dev, Data Science, etc.)
3. `courses` - Courses with status (draft/pending/approved)
4. `course_sections` - Course sections/modules
5. `course_lessons` - Individual lessons with video URLs
6. `enrollments` - Student course enrollments
7. `lesson_progress` - Track completed lessons per student
8. `reviews` - Course reviews with ratings (1-5 stars)
9. `payments` - Payment records (mock system)
10. `course_approval_logs` - Audit trail for approvals

**Key Relationships:**
- Course → Instructor (user_id)
- Course → Category
- Course → Sections → Lessons
- Enrollment → Student (user_id) + Course
- Review → Student (user_id) + Course
- LessonProgress → Student (user_id) + Lesson

## 🎬 Video URL Formats Supported

All lesson URLs should be provided as:

**YouTube:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Vimeo:**
```
https://vimeo.com/123456789
```

**Direct MP4:**
```
https://example.com/videos/lesson1.mp4
```

The player automatically detects format and embeds appropriately.

## 💳 Payment System

Currently a **mock payment system**:
- Click "Enroll Now" on any course
- Enrollment succeeds immediately (no actual payment processed)
- In production, integrate with Stripe/Razorpay:
  - Add `stripe_payment_id` to enrollments table
  - Check payment status before enrollment confirmation
  - Webhook handling for payment completion

## 🔑 Key Workflows

### 1. Course Creation → Approval → Enrollment

```
Instructor creates course (Draft)
    ↓
Instructor adds sections & lessons via course-builder
    ↓
Instructor publishes/submits for approval (Pending)
    ↓
Admin reviews in approval queue & approves (Approved)
    ↓
Course visible on homepage to all students
    ↓
Student enrolls → redirected to course player
    ↓
Student watches lessons, marks complete, leaves review
```

### 2. Course Rating Calculation

```
Student 1 leaves 5★ review
Student 2 leaves 4★ review
    ↓
Average: (5 + 4) / 2 = 4.5★ rating
    ↓
Displayed on course card & detail page
```

### 3. Progress Tracking

```
Lesson 1: Mark as complete (1/5 lessons = 20%)
Lesson 2: Mark as complete (2/5 lessons = 40%)
Lesson 3: Auto-marked as viewed (3/5 lessons = 60%)
    ↓
Progress bar shows 60% on student dashboard
```

## 🧪 Testing Checklist

- [ ] Sign up as student, verify redirect to /student
- [ ] Sign up as instructor, verify redirect to /instructor
- [ ] As instructor: Create course with title, description, category
- [ ] As instructor: Add 2 sections with 3 lessons each in course-builder
- [ ] As instructor: Submit course (status should change from Draft to Pending)
- [ ] As admin: See pending course in approval queue
- [ ] As admin: Click Approve to change status to Approved
- [ ] As student: See approved course on homepage
- [ ] As student: Enroll in course, redirected to /learn/[courseId]
- [ ] As student: Click lesson, verify video player works (YouTube/Vimeo/MP4)
- [ ] As student: Mark lesson complete, verify progress increases
- [ ] As student: Go back to course detail, verify "Continue Learning" button shows
- [ ] As student: Leave 5★ review with text
- [ ] As student: Verify review appears on course detail page
- [ ] As instructor: See course has review, rating updated
- [ ] Homepage filters: Test by category, price range, level, rating
- [ ] Verify unauthenticated users can browse courses but not enroll

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit: SkillSpring platform"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
5. Click "Deploy"

### 3. Test Live

- Visit your Vercel URL
- Sign up and walk through complete workflow
- Test video player with real YouTube links
- Verify database connections work (should be automatic)

## 📱 Mobile Support

The app is responsive and works on mobile:
- Hamburger navigation (implement in future)
- Touch-friendly buttons
- Responsive grid (1 col mobile, 2 tablet, 4 desktop)
- Video player adapts to screen size

## 🔐 Security Features

- **Authentication**: Supabase Auth (built-in email verification option)
- **Role-Based Access**: Middleware enforces route access
- **SQL Injection Protection**: Supabase client library
- **XSS Prevention**: Next.js auto-escapes
- **CORS**: Next.js API routes (ready if needed)
- **Row-Level Security**: Foundation set in schema (can activate per table)

## 🎨 Styling

Uses **Tailwind CSS 4** with custom configuration:
- Primary color: Indigo-600 (course actions)
- Success: Green-500 (completed lessons)
- Danger: Red-500 (rejections)
- Neutral: Gray-100 to Gray-900
- Dark mode support ready (implement in future)

## 🐛 Troubleshooting

**"Page not found" error after signup:**
- Check that user role was inserted correctly
- Verify middleware.ts includes the new role paths

**"Video not playing":**
- For YouTube: Use watch URL format, not shortened URL
- For Vimeo: Use full vimeo.com URL, not player link
- For MP4: Ensure URL returns valid video file (test in browser)

**"Enrollment fails with duplicate error":**
- Student already enrolled in this course
- Clear browser cache and try again
- Check enrollments table for duplicate records

**"Env variables undefined":**
- Restart dev server after adding .env.local
- Check variable names match exactly (case-sensitive)
- For Vercel: Deployment > Settings > Environment Variables

## 📚 Database Queries Reference

Common queries used in the app:

```sql
-- Get user with full profile
SELECT * FROM users WHERE id = 'user-uuid';

-- Get approved courses with lesson count
SELECT c.*, COUNT(cl.id) as lesson_count 
FROM courses c 
LEFT JOIN course_sections cs ON c.id = cs.course_id
LEFT JOIN course_lessons cl ON cs.id = cl.section_id
WHERE c.status = 'approved' GROUP BY c.id;

-- Get student progress on a course
SELECT COUNT(DISTINCT lp.lesson_id) as completed_lessons,
       COUNT(DISTINCT cl.id) as total_lessons,
       ROUND(100.0 * COUNT(DISTINCT lp.lesson_id) / COUNT(DISTINCT cl.id)) as progress_percentage
FROM lesson_progress lp
RIGHT JOIN course_lessons cl ON lp.lesson_id = cl.id
WHERE cl.course_id = 'course-uuid' AND lp.student_id = 'user-uuid';

-- Get average course rating
SELECT ROUND(AVG(rating)::numeric, 1) as average_rating 
FROM reviews WHERE course_id = 'course-uuid';
```

## 🔮 Future Enhancements

- **Payments**: Integrate Stripe or Razorpay
- **Certificates**: Generate certificates on course completion
- **Messages**: Instructor-student messaging
- **Quizzes**: Assessment system with passing grades
- **Wishlist**: Save courses for later
- **Advanced Analytics**: Video watch time, drop-off rates
- **Email Notifications**: Course approvals, purchase receipts
- **Gamification**: Badges, leaderboards
- **Search**: Full-text search optimization
- **Dark Mode**: Toggle theme preference

## 📞 Support

For issues or questions:
1. Check the SETUP_GUIDE.md for detailed instructions
2. Review this README for common solutions
3. Check Supabase logs in dashboard
4. Review Next.js documentation for framework questions

## 📄 License

MIT - Feel free to use for personal or commercial projects.

---

**Built with ❤️ for online learners worldwide**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
