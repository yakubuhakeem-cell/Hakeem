export interface Student {
  id: string;
  name: string;
  grade: string;
  gender: 'Male' | 'Female';
  guardianName: string;
  guardianPhone: string;
  feesTotal: number;
  feesPaid: number;
  attendanceRate: number; // e.g. 95 (out of 100)
  grades: {
    [subject: string]: number; // subject code/name -> mark out of 100
  };
  attendanceHistory: {
    [date: string]: 'Present' | 'Absent' | 'Late';
  };
  behaviorRating: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
  achievements: string[];
  reportComment?: string;
  adminNotes?: string;
  photo?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  gradeAssigned: string;
  subjects: string[];
  status: 'Active' | 'On Leave';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Urgent' | 'General' | 'Event' | 'Holiday';
  author: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Exam' | 'Holiday' | 'Activity' | 'Meeting';
  description: string;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  subject: string;
  grade: string;
  topic: string;
  duration: string;
  objectives: string[];
  materialsNeeded: string[];
  introduction: string;
  body: string;
  conclusion: string;
  assessment: string;
  createdAt: string;
}
