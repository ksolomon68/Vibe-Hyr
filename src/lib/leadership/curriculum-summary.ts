// src/lib/leadership/curriculum-summary.ts
// Lightweight metadata for the Leadership vertical to optimize dashboard performance.

export interface CourseSummary {
  id:           string
  num:          number
  title:        string
  tierRequired: 'free' | 'architect' | 'elite'
  color:        string
  lessonCount:  number
}

export const LEADERSHIP_COURSES_SUMMARY: CourseSummary[] = [
  {
    id:           "leadership_course_1",
    num:          1,
    title:        "The Internal Authority",
    tierRequired: "free",
    color:        "#E8621A",
    lessonCount:  6,
  },
  {
    id:           "leadership_course_2",
    num:          2,
    title:        "Visionary Architecture",
    tierRequired: "architect",
    color:        "#C9A84C",
    lessonCount:  6,
  },
  {
    id:           "leadership_course_3",
    num:          3,
    title:        "The Bridge of Incidents",
    tierRequired: "architect",
    color:        "#A855F7",
    lessonCount:  6,
  },
  {
    id:           "leadership_course_4",
    num:          4,
    title:        "Echo Theory Mastery",
    tierRequired: "elite",
    color:        "#0F505A",
    lessonCount:  6,
  },
]
