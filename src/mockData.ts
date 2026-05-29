import { Student, Teacher, Announcement, CalendarEvent } from './types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Inter-School Sports Competition',
    content: 'We are pleased to announce that Saako Holy Child Academy will be competing in the Sawla Zone Inter-School Athletics Competition. All selected pupils should attend regular training with Mr. Ernest Kofi. Holiness is our key to disciplined victory!',
    date: '2026-05-25',
    category: 'Event',
    author: 'Principal Hakeem'
  },
  {
    id: 'ann-2',
    title: 'Mid-Term Examinations Schedule',
    content: 'Please note that the third-term mid-term examinations scheduled for all classes from Primary 1 through JHS 3 will start next Monday, June 1st. Please ensure all balance school fees are settled before the exams.',
    date: '2026-05-20',
    category: 'Urgent',
    author: 'Academic Registrar'
  },
  {
    id: 'ann-3',
    title: 'PTA General Assembly meeting',
    content: 'The Parents Teachers Association (PTA) will have its general meeting on Sunday, June 14th on the school grounds at exactly 1:00 PM GMT. Important matters regarding security, transport, and e-learning facilities will be deliberated.',
    date: '2026-05-18',
    category: 'General',
    author: 'PTA President'
  },
  {
    id: 'ann-4',
    title: 'Whit Monday School Holiday',
    content: 'All classrooms will remain closed on Monday following Whit Sunday. Work resume in full on Tuesday morning with prayer devotion block.',
    date: '2026-05-15',
    category: 'Holiday',
    author: 'Administration Office'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Mid-Term Exam Kickoff',
    date: '2026-06-01',
    type: 'Exam',
    description: 'Third-term mid-term examinations for all grades.'
  },
  {
    id: 'ev-2',
    title: 'PTA Assembly',
    date: '2026-06-14',
    type: 'Meeting',
    description: 'General Parents Teachers Assembly on school compounds.'
  },
  {
    id: 'ev-3',
    title: 'Speech & Prize Giving Day',
    date: '2026-07-25',
    type: 'Activity',
    description: 'Award ceremony for scholars and moral exemplars.'
  },
  {
    id: 'ev-4',
    title: 'Republic Day Holiday',
    date: '2026-07-01',
    type: 'Holiday',
    description: 'Ghana National Republic Day commemoration. No school.'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    name: 'Mr. Emmanuel Appiah',
    email: 'eappiah@holychild.edu.gh',
    phone: '+233244123456',
    gradeAssigned: 'JHS 3',
    subjects: ['Mathematics', 'I.C.T.'],
    status: 'Active'
  },
  {
    id: 'tch-2',
    name: 'Mrs. Faustina Mensah',
    email: 'fmensah@holychild.edu.gh',
    phone: '+233543987654',
    gradeAssigned: 'Primary 5',
    subjects: ['English Language', 'R.M.E.'],
    status: 'Active'
  },
  {
    id: 'tch-3',
    name: 'Rev. Ernest Kofi Gyamfi',
    email: 'ekgkofi@holychild.edu.gh',
    phone: '+233202998811',
    gradeAssigned: 'JHS 2',
    subjects: ['Integrated Science', 'Social Studies'],
    status: 'Active'
  },
  {
    id: 'tch-4',
    name: 'Madam Abena Boatemaa',
    email: 'abboat@holychild.edu.gh',
    phone: '+233503112233',
    gradeAssigned: 'Primary 2',
    subjects: ['General Studies', 'Creative Arts'],
    status: 'Active'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Kwame Osei Boateng',
    grade: 'JHS 3',
    gender: 'Male',
    guardianName: 'Ebenezer Boateng',
    guardianPhone: '+233244889911',
    feesTotal: 1200,
    feesPaid: 1200,
    attendanceRate: 98,
    grades: {
      'Mathematics': 85,
      'Integrated Science': 92,
      'English Language': 78,
      'Social Studies': 88,
      'R.M.E.': 95,
      'I.C.T.': 90
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Excellent',
    achievements: ['Outstanding Maths Student', 'Devotional Leader']
  },
  {
    id: 'std-2',
    name: 'Efua Mansa Darko',
    grade: 'JHS 3',
    gender: 'Female',
    guardianName: 'Leticia Darko',
    guardianPhone: '+233545672233',
    feesTotal: 1200,
    feesPaid: 800,
    attendanceRate: 96,
    grades: {
      'Mathematics': 72,
      'Integrated Science': 84,
      'English Language': 91,
      'Social Studies': 80,
      'R.M.E.': 89,
      'I.C.T.': 85
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Late',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Very Good',
    achievements: ['Creative Writing Prize']
  },
  {
    id: 'std-3',
    name: 'Kofi Gyasi Addo',
    grade: 'JHS 2',
    gender: 'Male',
    guardianName: 'Rev. Samuel Addo',
    guardianPhone: '+233202114455',
    feesTotal: 1100,
    feesPaid: 1100,
    attendanceRate: 99,
    grades: {
      'Mathematics': 94,
      'Integrated Science': 91,
      'English Language': 86,
      'Social Studies': 92,
      'R.M.E.': 98,
      'I.C.T.': 95
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Excellent',
    achievements: ['First in Class Term 1', 'Chapel Prefect']
  },
  {
    id: 'std-4',
    name: 'Akua Serwaa Owusu',
    grade: 'JHS 2',
    gender: 'Female',
    guardianName: 'Dr. Michael Owusu',
    guardianPhone: '+233243990088',
    feesTotal: 1100,
    feesPaid: 500,
    attendanceRate: 92,
    grades: {
      'Mathematics': 65,
      'Integrated Science': 70,
      'English Language': 82,
      'Social Studies': 75,
      'R.M.E.': 80,
      'I.C.T.': 74
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Absent',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Good',
    achievements: ['Inter-school Football Captain']
  },
  {
    id: 'std-5',
    name: 'Yaw Ofori Kyeremeh',
    grade: 'Primary 5',
    gender: 'Male',
    guardianName: 'Priscilla Kyeremeh',
    guardianPhone: '+233245456789',
    feesTotal: 950,
    feesPaid: 950,
    attendanceRate: 95,
    grades: {
      'Mathematics': 88,
      'Integrated Science': 79,
      'English Language': 85,
      'Social Studies': 81,
      'R.M.E.': 90,
      'I.C.T.': 88
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Very Good',
    achievements: ['Cleanest Pupil Award']
  },
  {
    id: 'std-6',
    name: 'Abena Animah Gyamfi',
    grade: 'Primary 5',
    gender: 'Female',
    guardianName: 'David Gyamfi',
    guardianPhone: '+233543123123',
    feesTotal: 950,
    feesPaid: 400,
    attendanceRate: 88,
    grades: {
      'Mathematics': 58,
      'Integrated Science': 64,
      'English Language': 72,
      'Social Studies': 69,
      'R.M.E.': 82,
      'I.C.T.': 60
    },
    attendanceHistory: {
      '2026-05-25': 'Late',
      '2026-05-26': 'Present',
      '2026-05-27': 'Absent',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Needs Improvement',
    achievements: []
  },
  {
    id: 'std-7',
    name: 'Prince Kwadwo Dufour',
    grade: 'Primary 2',
    gender: 'Male',
    guardianName: 'Comfort Dufour',
    guardianPhone: '+233203991199',
    feesTotal: 900,
    feesPaid: 900,
    attendanceRate: 100,
    grades: {
      'Mathematics': 96,
      'Integrated Science': 94,
      'English Language': 95,
      'Social Studies': 90,
      'R.M.E.': 98,
      'I.C.T.': 92
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Excellent',
    achievements: ['Perfect Attendance', 'Spelling Bee Winner']
  },
  {
    id: 'std-8',
    name: 'Joycelyn Adwoa Frimpong',
    grade: 'Primary 2',
    gender: 'Female',
    guardianName: 'Augustine Frimpong',
    guardianPhone: '+233244778844',
    feesTotal: 900,
    feesPaid: 900,
    attendanceRate: 97,
    grades: {
      'Mathematics': 81,
      'Integrated Science': 83,
      'English Language': 89,
      'Social Studies': 85,
      'R.M.E.': 92,
      'I.C.T.': 84
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Excellent',
    achievements: ['Bible Recitation Trophy']
  },
  {
    id: 'std-9',
    name: 'Abena Mansah Owusu',
    grade: 'Nur',
    gender: 'Female',
    guardianName: 'George Owusu',
    guardianPhone: '+233201445588',
    feesTotal: 800,
    feesPaid: 400,
    attendanceRate: 98,
    grades: {
      'Mathematics': 88,
      'English Language': 90,
      'Creative Arts / Design': 95
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Excellent',
    achievements: ['Creative Fingerpainting Pen']
  },
  {
    id: 'std-10',
    name: 'Kofi Mensah Annan',
    grade: 'KG1',
    gender: 'Male',
    guardianName: 'John Annan',
    guardianPhone: '+233501223344',
    feesTotal: 850,
    feesPaid: 850,
    attendanceRate: 92,
    grades: {
      'Mathematics': 82,
      'English Language': 80,
      'Creative Arts / Design': 85
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Late',
      '2026-05-27': 'Present',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Very Good',
    achievements: ['Alphabets Memorization Badge']
  },
  {
    id: 'std-11',
    name: 'Yaa Asantewaa Bonsu',
    grade: 'KG2',
    gender: 'Female',
    guardianName: 'Kwaku Bonsu',
    guardianPhone: '+233277556677',
    feesTotal: 850,
    feesPaid: 600,
    attendanceRate: 95,
    grades: {
      'Mathematics': 85,
      'English Language': 88,
      'Creative Arts / Design': 92
    },
    attendanceHistory: {
      '2026-05-25': 'Present',
      '2026-05-26': 'Present',
      '2026-05-27': 'Absent',
      '2026-05-28': 'Present'
    },
    behaviorRating: 'Excellent',
    achievements: ['Best Storyteller Star']
  }
];

export const AVAILABLE_GRADES_LIST = [
  'Nur',
  'KG1',
  'KG2',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JHS 1',
  'JHS 2',
  'JHS 3'
];

export const GHANA_SUBJECTS = [
  'Mathematics',
  'Integrated Science',
  'English Language',
  'Social Studies',
  'R.M.E. (Religious and Moral Education)',
  'I.C.T. (Information & Communications Tech)',
  'Creative Arts / Design',
  'Our World Our People'
];
