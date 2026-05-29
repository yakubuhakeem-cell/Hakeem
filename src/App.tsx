import React, { useState, useEffect, useRef } from 'react';
import { 
  School, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Megaphone, 
  Search, 
  Plus, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Cpu, 
  UserPlus, 
  Clipboard, 
  Check, 
  Trash2, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Info, 
  FileText, 
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Award,
  Printer,
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  Lock,
  Download
} from 'lucide-react';
import { Student, Teacher, Announcement, CalendarEvent, LessonPlan } from './types';
import { SchoolCrest } from './components/SchoolCrest';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart, 
  Bar, 
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_TEACHERS, 
  INITIAL_STUDENTS, 
  AVAILABLE_GRADES_LIST, 
  GHANA_SUBJECTS 
} from './mockData';

export default function App() {
  // --- Persistent State ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sha_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('sha_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('sha_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('sha_calendar_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem('sha_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sha_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('sha_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('sha_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // --- UI Navigation State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'teachers' | 'ai-tools'>('dashboard');

  // --- Filtering & Selection States ---
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('All');
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [trendSubject, setTrendSubject] = useState<string>('All');
  const [adminViewEnabled, setAdminViewEnabled] = useState<boolean>(true);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  // --- Create/Edit Student Modal ---
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState<{
    name: string;
    grade: string;
    gender: 'Male' | 'Female';
    guardianName: string;
    guardianPhone: string;
    feesTotal: number;
    feesPaid: number;
    behaviorRating: Student['behaviorRating'];
    photo?: string;
  }>({
    name: '',
    grade: AVAILABLE_GRADES_LIST[0] || 'Primary 1',
    gender: 'Male',
    guardianName: '',
    guardianPhone: '',
    feesTotal: 1000,
    feesPaid: 0,
    behaviorRating: 'Excellent',
    photo: undefined
  });

  // --- Student Device Camera Capture States ---
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError('');
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError('Unable to access secondary device camera. Please make sure the physical camera is linked and browser permissions are granted.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirrored for logical feedback standard positioning
        ctx.translate(320, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setStudentForm(prev => ({ ...prev, photo: dataUrl }));
      }
      stopCamera();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setStudentForm(prev => ({ ...prev, photo: undefined }));
    stopCamera();
  };

  // --- Quick Record Payment Dialog ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentStudentId, setPaymentStudentId] = useState<string>('');

  // --- Create Teacher Modal ---
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    phone: '',
    gradeAssigned: AVAILABLE_GRADES_LIST[0] || 'Primary 1',
    subjectsInput: 'Mathematics',
    status: 'Active' as 'Active' | 'On Leave'
  });

  // --- Add Announcement Modal ---
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    category: 'General' as Announcement['category'],
    author: 'Admin Office'
  });

  // --- AI Report Comment Generator State ---
  const [selectedAIStudentId, setSelectedAIStudentId] = useState<string>('');
  const [aiReportOutput, setAIReportOutput] = useState('');
  const [isGeneratingAIComment, setIsGeneratingAIComment] = useState(false);
  const [aiKeyTraits, setAIKeyTraits] = useState<string[]>(['Determined', 'Polite', 'God-fearing']);
  const [rawTraitInput, setRawTraitInput] = useState('');
  const [aiSimulationTag, setAISimulationTag] = useState(false);

  // --- AI GES Lesson Planner State ---
  const [selectedLessonSubject, setSelectedLessonSubject] = useState('R.M.E. (Religious and Moral Education)');
  const [selectedLessonGrade, setSelectedLessonGrade] = useState('JHS 1');
  const [lessonTopic, setLessonTopic] = useState('The Attributes of God in Creation');
  const [lessonDuration, setLessonDuration] = useState('60 minutes');
  const [lessonObjectives, setLessonObjectives] = useState('Pupils will examine creative works, list moral lessons of stewardship, and identify their responsibilities.');
  const [lessonPlanOutput, setLessonPlanOutput] = useState('');
  const [isGeneratingLessonPlan, setIsGeneratingLessonPlan] = useState(false);

  // --- Bulk Attendance States ---
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [bulkAttendanceGrade, setBulkAttendanceGrade] = useState(AVAILABLE_GRADES_LIST[0] || 'Primary 1');
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([]);
  const [bulkAttendanceDate, setBulkAttendanceDate] = useState('2026-05-28');
  const [bulkFeedbackMsg, setBulkFeedbackMsg] = useState('');

  // --- Bulk Grades Entry States ---
  const [isBulkGradesOpen, setIsBulkGradesOpen] = useState(false);
  const [bulkGradesGrade, setBulkGradesGrade] = useState(AVAILABLE_GRADES_LIST[0] || 'Primary 1');
  const [bulkGradesSelectedStudentIds, setBulkGradesSelectedStudentIds] = useState<string[]>([]);
  const [bulkGradesSubject, setBulkGradesSubject] = useState(GHANA_SUBJECTS[0] || 'Mathematics');
  const [bulkGradesScore, setBulkGradesScore] = useState<string>('');
  const [bulkGradesFeedbackMsg, setBulkGradesFeedbackMsg] = useState('');

  const resetBulkGradesSelectionForGrade = (grade: string) => {
    setBulkGradesGrade(grade);
    const studentsInGrade = students.filter(s => s.grade === grade);
    setBulkGradesSelectedStudentIds(studentsInGrade.map(s => s.id));
    setBulkGradesFeedbackMsg('');
    setBulkGradesScore('');
  };

  const handleBulkUpdateGrades = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedScore = parseFloat(bulkGradesScore);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      setBulkGradesFeedbackMsg('Please input a valid grade mark between 0 and 100.');
      return;
    }

    if (bulkGradesSelectedStudentIds.length === 0) {
      setBulkGradesFeedbackMsg('Please select at least one pupil.');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (bulkGradesSelectedStudentIds.includes(s.id)) {
        return {
          ...s,
          grades: {
            ...s.grades,
            [bulkGradesSubject]: parsedScore
          }
        };
      }
      return s;
    }));

    // Update the selected student if their grade was updated
    if (selectedStudent && bulkGradesSelectedStudentIds.includes(selectedStudent.id)) {
      setSelectedStudent(prev => prev ? {
        ...prev,
        grades: {
          ...prev.grades,
          [bulkGradesSubject]: parsedScore
        }
      } : null);
    }

    setBulkGradesFeedbackMsg(`Successfully enrolled a score of ${parsedScore}% in ${bulkGradesSubject} for ${bulkGradesSelectedStudentIds.length} scholars!`);
    
    // Auto clear feedback after short delay
    setTimeout(() => {
      setBulkGradesFeedbackMsg('');
    }, 4000);
  };

  // --- PDF Report Card States ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [editableReportComment, setEditableReportComment] = useState('');
  const [isCompilingReportComment, setIsCompilingReportComment] = useState(false);
  const [reportCommentFeedback, setReportCommentFeedback] = useState('');

  // --- Fee Collection Monitor Red Flag State ---
  const [redFlagThreshold, setRedFlagThreshold] = useState<number>(250);

  const resetBulkSelectionForGrade = (grade: string) => {
    setBulkAttendanceGrade(grade);
    const studentsInGrade = students.filter(s => s.grade === grade);
    setBulkSelectedStudentIds(studentsInGrade.map(s => s.id));
    setBulkFeedbackMsg('');
  };

  // --- Global School metadata ---
  const schoolInfo = {
    name: "Saako Holy Child Academy",
    motto: "Holiness is our key",
    phone: "+233545029200",
    email: "saakohca@gmail.com",
    address: "Jelinkon road, Sawla, Savannah Region, Ghana",
    established: 2003,
  };

  // --- Stats Calculations & Helpers ---
  const getStudentGradeAverage = (stud: Student | undefined): number => {
    if (!stud) return 0;
    const scores = Object.values(stud.grades);
    if (scores.length === 0) return 0;
    const total = scores.reduce((acc, score) => acc + (score as number), 0);
    return Math.round(total / scores.length);
  };

  const getTrendDataForSubject = (student: Student, subject: string) => {
    if (subject === 'All') {
      const subjectList = Object.keys(student.grades);
      if (subjectList.length === 0) return [];
      
      const milestones = ['Week 3', 'Week 6', 'Week 9', 'Week 12'];
      return milestones.map((m, idx) => {
        let sum = 0;
        subjectList.forEach(subj => {
          const G = student.grades[subj] || 0;
          let val = G;
          if (idx === 0) val = Math.round(G * 0.82 + 2);
          else if (idx === 1) val = Math.round(G * 0.90 - 1);
          else if (idx === 2) val = Math.round(G * 0.95 + 1);
          else val = G;
          sum += Math.max(0, Math.min(100, val));
        });
        return {
          name: m,
          Score: Math.round(sum / subjectList.length)
        };
      });
    } else {
      const G = student.grades[subject] || 0;
      return [
        { name: 'Week 3', Score: Math.max(0, Math.min(100, Math.round(G * 0.82 + 2))) },
        { name: 'Week 6', Score: Math.max(0, Math.min(100, Math.round(G * 0.90 - 1))) },
        { name: 'Week 9', Score: Math.max(0, Math.min(100, Math.round(G * 0.95 + 1))) },
        { name: 'Week 12', Score: G }
      ];
    }
  };

  const getFeeDataByGrade = () => {
    return AVAILABLE_GRADES_LIST.map(grade => {
      const studentsInGrade = students.filter(s => s.grade === grade);
      const totalPaid = studentsInGrade.reduce((sum, s) => sum + s.feesPaid, 0);
      const totalExpected = studentsInGrade.reduce((sum, s) => sum + s.feesTotal, 0);
      const totalOutstanding = Math.max(0, totalExpected - totalPaid);

      return {
        grade,
        paid: totalPaid,
        outstanding: totalOutstanding,
        expected: totalExpected,
        studentCount: studentsInGrade.length
      };
    }).filter(item => item.studentCount > 0);
  };

  const getAttendanceTrendData = (stud: Student | undefined) => {
    if (!stud) {
      return { 
        chartData: [], 
        presentCount: 0, 
        lateCount: 0, 
        absentCount: 0, 
        calculatedRate: 0, 
        patterns: [] as string[] 
      };
    }

    const endDateStr = '2026-05-28';
    const dates: string[] = [];
    let current = new Date(endDateStr);
    
    while (dates.length < 30) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const date = String(current.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${date}`);
      }
      current.setDate(current.getDate() - 1);
    }
    dates.reverse();

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    
    let monFriIssues = 0;
    let totalIssues = 0;
    let consecutiveAbsencesCount = 0;
    let firstHalfAbsences = 0;
    let secondHalfAbsences = 0;

    let runningPresent = 0;
    let runningLate = 0;

    const chartData = dates.map((dateStr, idx) => {
      let status: 'Present' | 'Late' | 'Absent';
      
      if (stud.attendanceHistory && stud.attendanceHistory[dateStr]) {
        status = stud.attendanceHistory[dateStr];
      } else {
        const seedStr = `${stud.id}-${dateStr}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
          hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const val = Math.abs(hash) % 100;
        if (val < stud.attendanceRate) {
          status = 'Present';
        } else {
          status = (val % 3 === 0) ? 'Late' : 'Absent';
        }
      }

      const dateObj = new Date(dateStr);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      if (status === 'Present') {
        presentCount++;
        runningPresent++;
      } else if (status === 'Late') {
        lateCount++;
        runningLate++;
        totalIssues++;
        if (dayOfWeek === 'Mon' || dayOfWeek === 'Fri') monFriIssues++;
      } else if (status === 'Absent') {
        absentCount++;
        totalIssues++;
        if (dayOfWeek === 'Mon' || dayOfWeek === 'Fri') monFriIssues++;
        if (idx < 15) firstHalfAbsences++;
        else secondHalfAbsences++;
      }

      const denominator = idx + 1;
      const rollingRate = Math.round(((runningPresent + runningLate * 0.5) / denominator) * 100);

      let numericVal = 100;
      if (status === 'Late') numericVal = 50;
      if (status === 'Absent') numericVal = 0;

      return {
        date: dateStr,
        label,
        dayOfWeek,
        status,
        value: numericVal,
        rollingRate
      };
    });

    const patterns: string[] = [];
    
    if (totalIssues > 2 && (monFriIssues / totalIssues) >= 0.55) {
      patterns.push("Frequent Monday/Friday irregularities detected");
    }

    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].status === 'Absent' && chartData[i - 1].status === 'Absent') {
        consecutiveAbsencesCount++;
      }
    }
    if (consecutiveAbsencesCount >= 1) {
      patterns.push("Encountered consecutive school absences");
    }

    if (secondHalfAbsences > firstHalfAbsences && secondHalfAbsences >= 2) {
      patterns.push("Recent downward attendance trajectory detected");
    }

    if (absentCount === 0 && lateCount === 0) {
      patterns.push("Outstanding 100% attendance over last 30 days!");
    }

    const calculatedRate = Math.round(((presentCount + lateCount * 0.5) / 30) * 100);

    return {
      chartData,
      presentCount,
      lateCount,
      absentCount,
      calculatedRate,
      patterns
    };
  };

  const totalStudentsCount = students.length;
  const totalTeachersCount = teachers.length;
  const totalFeesExpected = students.reduce((sum, s) => sum + s.feesTotal, 0);
  const totalFeesPaid = students.reduce((sum, s) => sum + s.feesPaid, 0);
  const totalFeesOutstanding = totalFeesExpected - totalFeesPaid;
  const averageAttendance = totalStudentsCount > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudentsCount)
    : 0;

  // --- Actions & Helpers ---
  const handleOpenStudentModal = (student: Student | null = null) => {
    stopCamera();
    if (student) {
      setEditingStudent(student);
      setStudentForm({
        name: student.name,
        grade: student.grade,
        gender: student.gender,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        feesTotal: student.feesTotal,
        feesPaid: student.feesPaid,
        behaviorRating: student.behaviorRating,
        photo: student.photo
      });
    } else {
      setEditingStudent(null);
      setStudentForm({
        name: '',
        grade: AVAILABLE_GRADES_LIST[0] || 'Primary 1',
        gender: 'Male',
        guardianName: '',
        guardianPhone: '',
        feesTotal: 1000,
        feesPaid: 0,
        behaviorRating: 'Excellent',
        photo: undefined
      });
    }
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return;

    if (editingStudent) {
      // Edit
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? {
        ...s,
        name: studentForm.name,
        grade: studentForm.grade,
        gender: studentForm.gender,
        guardianName: studentForm.guardianName,
        guardianPhone: studentForm.guardianPhone,
        feesTotal: studentForm.feesTotal,
        feesPaid: studentForm.feesPaid,
        behaviorRating: studentForm.behaviorRating,
        photo: studentForm.photo
      } : s));
      // Update the active detail view student
      if (selectedStudent && selectedStudent.id === editingStudent.id) {
        setSelectedStudent(prev => prev ? {
          ...prev,
          name: studentForm.name,
          grade: studentForm.grade,
          gender: studentForm.gender,
          guardianName: studentForm.guardianName,
          guardianPhone: studentForm.guardianPhone,
          feesTotal: studentForm.feesTotal,
          feesPaid: studentForm.feesPaid,
          behaviorRating: studentForm.behaviorRating,
          photo: studentForm.photo
        } : null);
      }
    } else {
      // Create new student with initial subjects structure
      const initialGrades: { [subject: string]: number } = {};
      GHANA_SUBJECTS.forEach(sub => {
        initialGrades[sub] = Math.floor(Math.random() * 25) + 70; // Pre-populate realistic initial grade 70-95
      });

      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name: studentForm.name,
        grade: studentForm.grade,
        gender: studentForm.gender,
        guardianName: studentForm.guardianName,
        guardianPhone: studentForm.guardianPhone,
        feesTotal: studentForm.feesTotal,
        feesPaid: studentForm.feesPaid,
        attendanceRate: 95,
        grades: initialGrades,
        attendanceHistory: {
          '2026-05-28': 'Present'
        },
        behaviorRating: studentForm.behaviorRating,
        achievements: ['Newly Registered Scholar'],
        photo: studentForm.photo
      };
      setStudents(prev => [...prev, newStudent]);
    }
    stopCamera();
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setStudentToDelete(student);
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
    if (selectedStudent?.id === studentToDelete.id) {
      setSelectedStudent(null);
    }
    setIsDeleteConfirmOpen(false);
    setStudentToDelete(null);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    setStudents(prev => prev.map(s => {
      if (s.id === paymentStudentId) {
        const remaining = s.feesTotal - s.feesPaid;
        const newPaid = Math.min(s.feesTotal, s.feesPaid + paymentAmount);
        return {
          ...s,
          feesPaid: newPaid,
          achievements: newPaid === s.feesTotal && !s.achievements.includes('Fully Paid Fees')
            ? [...s.achievements, 'Fully Paid Fees']
            : s.achievements
        };
      }
      return s;
    }));

    // Update active view
    if (selectedStudent && selectedStudent.id === paymentStudentId) {
      setSelectedStudent(prev => prev ? {
        ...prev,
        feesPaid: Math.min(prev.feesTotal, prev.feesPaid + paymentAmount)
      } : null);
    }

    setIsPaymentModalOpen(false);
    setPaymentAmount(0);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim()) return;

    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      name: teacherForm.name,
      email: teacherForm.email || `${teacherForm.name.toLowerCase().replace(/\s/g, '')}@holychild.edu.gh`,
      phone: teacherForm.phone || '+233545000000',
      gradeAssigned: teacherForm.gradeAssigned,
      subjects: teacherForm.subjectsInput.split(',').map(s => s.trim()),
      status: teacherForm.status
    };

    setTeachers(prev => [...prev, newTeacher]);
    setIsTeacherModalOpen(false);
    setTeacherForm({
      name: '',
      email: '',
      phone: '',
      gradeAssigned: AVAILABLE_GRADES_LIST[0] || 'Primary 1',
      subjectsInput: 'Mathematics',
      status: 'Active'
    });
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: announcementForm.title,
      content: announcementForm.content,
      date: new Date().toISOString().split('T')[0],
      category: announcementForm.category,
      author: announcementForm.author
    };

    setAnnouncements(prev => [newAnn, ...prev]);
    setIsAnnouncementModalOpen(false);
    setAnnouncementForm({
      title: '',
      content: '',
      category: 'General',
      author: 'Admin Office'
    });
  };

  const handleUpdateStudentGrade = (studentId: string, subject: string, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          grades: {
            ...s.grades,
            [subject]: validScore
          }
        };
      }
      return s;
    }));

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev => prev ? {
        ...prev,
        grades: {
          ...prev.grades,
          [subject]: validScore
        }
      } : null);
    }
  };

  const handleUpdateStudentAdminNotes = (studentId: string, notes: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          adminNotes: notes
        };
      }
      return s;
    }));

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev => prev ? {
        ...prev,
        adminNotes: notes
      } : null);
    }
  };

  const handleAddAchievement = (studentId: string, ach: string) => {
    if (!ach.trim()) return;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && !s.achievements.includes(ach)) {
        return {
          ...s,
          achievements: [...s.achievements, ach]
        };
      }
      return s;
    }));

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev => prev ? {
        ...prev,
        achievements: prev.achievements.includes(ach) ? prev.achievements : [...prev.achievements, ach]
      } : null);
    }
  };

  const handleToggleAttendance = (studentId: string, date: string, status: 'Present' | 'Absent' | 'Late') => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newHistory = { ...s.attendanceHistory, [date]: status };
        // compute new rough rate based on keys
        const totalDays = Object.keys(newHistory).length;
        const attendedDays = Object.values(newHistory).filter(v => v === 'Present' || v === 'Late').length;
        const newRate = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 100;

        return {
          ...s,
          attendanceHistory: newHistory,
          attendanceRate: newRate
        };
      }
      return s;
    }));

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev => {
        if (!prev) return null;
        const newHistory = { ...prev.attendanceHistory, [date]: status };
        const totalDays = Object.keys(newHistory).length;
        const attendedDays = Object.values(newHistory).filter(v => v === 'Present' || v === 'Late').length;
        const newRate = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 100;
        return {
          ...prev,
          attendanceHistory: newHistory,
          attendanceRate: newRate
        };
      });
    }
  };

  const handleBulkMarkAttendance = (status: 'Present' | 'Absent' | 'Late') => {
    if (bulkSelectedStudentIds.length === 0) {
      setBulkFeedbackMsg("No students selected. Please check at least one student file.");
      return;
    }

    setStudents(prev => prev.map(s => {
      if (bulkSelectedStudentIds.includes(s.id)) {
        const newHistory = { ...s.attendanceHistory, [bulkAttendanceDate]: status };
        const totalDays = Object.keys(newHistory).length;
        const attendedDays = Object.values(newHistory).filter(v => v === 'Present' || v === 'Late').length;
        const newRate = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 100;

        return {
          ...s,
          attendanceHistory: newHistory,
          attendanceRate: newRate
        };
      }
      return s;
    }));

    if (selectedStudent && bulkSelectedStudentIds.includes(selectedStudent.id)) {
      setSelectedStudent(prev => {
        if (!prev) return null;
        const newHistory = { ...prev.attendanceHistory, [bulkAttendanceDate]: status };
        const totalDays = Object.keys(newHistory).length;
        const attendedDays = Object.values(newHistory).filter(v => v === 'Present' || v === 'Late').length;
        const newRate = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 100;
        return {
          ...prev,
          attendanceHistory: newHistory,
          attendanceRate: newRate
        };
      });
    }

    setBulkFeedbackMsg(`Successfully marked ${bulkSelectedStudentIds.length} pupils as ${status} on ${bulkAttendanceDate}!`);
  };

  // --- AI Model Generation Triggers ---
  const handleGenerateAIComment = async () => {
    const student = students.find(s => s.id === selectedAIStudentId);
    if (!student) return;

    setIsGeneratingAIComment(true);
    setAIReportOutput('');
    setAISimulationTag(false);

    const subjectsPayload = Object.entries(student.grades).map(([name, score]) => ({
      name,
      score
    }));

    try {
      const response = await fetch('/api/ai/report-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          grade: student.grade,
          performanceLevel: student.behaviorRating === 'Excellent' ? 'Exceptional grade tracker' : 'Steadily improving',
          subjects: subjectsPayload,
          behaviorRating: student.behaviorRating,
          keyTraits: aiKeyTraits
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAIReportOutput(data.comment);
        if (data.isSimulated) {
          setAISimulationTag(true);
        }
      } else {
        setAIReportOutput(data.comment || "Could not generate report comments. Check backend connectivity.");
      }
    } catch (err) {
      console.error(err);
      setAIReportOutput("Educational connection timeout. Simulating headteacher terminal commentary locally instead.");
    } finally {
      setIsGeneratingAIComment(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    setIsGeneratingLessonPlan(true);
    setLessonPlanOutput('');

    try {
      const response = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedLessonSubject,
          grade: selectedLessonGrade,
          topic: lessonTopic,
          duration: lessonDuration,
          objectives: lessonObjectives,
          classDetails: `Standard co-educational Ghanaian class with mixed intellectual feedback.`
        })
      });

      const data = await response.json();
      if (response.ok) {
        setLessonPlanOutput(data.lessonPlan);
      } else {
        setLessonPlanOutput("Failed to fetch lesson framework. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setLessonPlanOutput("Error establishing request stream to the curriculum engine.");
    } finally {
      setIsGeneratingLessonPlan(false);
    }
  };

  const handleApplyAICommentToAchievements = () => {
    if (!aiReportOutput || !selectedAIStudentId) return;
    handleAddAchievement(selectedAIStudentId, "Received Blessed AI Report Commendation");
    
    setStudents(prev => prev.map(s => s.id === selectedAIStudentId ? { ...s, reportComment: aiReportOutput } : s));
    if (selectedStudent && selectedStudent.id === selectedAIStudentId) {
      setSelectedStudent(prev => prev ? { ...prev, reportComment: aiReportOutput } : null);
    }
    alert("Comment integrated with student profile records and saved to report cards successfully!");
  };

  // --- PDF Report Card Handlers ---
  const handleOpenReportModal = (student: Student) => {
    setReportStudent(student);
    setEditableReportComment(student.reportComment || '');
    setReportCommentFeedback('');
    setIsReportModalOpen(true);
    
    // Auto-generate comment if none exists
    if (!student.reportComment) {
      setIsCompilingReportComment(true);
      setTimeout(() => {
        const avg = getStudentGradeAverage(student);
        const rating = student.behaviorRating;
        const achievementsList = student.achievements.length > 0 ? student.achievements.join(', ') : 'highly respectful behaviors';
        
        let performanceText = '';
        if (avg >= 85) {
          performanceText = `${student.name} is a brilliant scholar who exhibits outstanding academic capabilities. Their average of ${avg}% in ${student.grade} reflects meticulous study habits and deep comprehension.`;
        } else if (avg >= 70) {
          performanceText = `${student.name} shows commendable academic prowess with a high grade average of ${avg}%. They participate productively in lessons and display sound analytical skills.`;
        } else if (avg >= 55) {
          performanceText = `${student.name} shows steady scholastic effort, achieving an average score of ${avg}%. They have great potential if focus is sustained.`;
        } else {
          performanceText = `${student.name} requires intensive scholastic support. With a grade average of ${avg}%, they must prioritize reading exercises and extra tuition.`;
        }

        let conductText = '';
        if (rating === 'Excellent') {
          conductText = `In alignment with our school motto, "Holiness is our key", ${student.name} possesses excellent character and acts as a model pupil to peers.`;
        } else if (rating === 'Very Good' || rating === 'Good') {
          conductText = `${student.name}'s demeanor aligns beautifully with our values. They are obedient, polite, and respect the school's codes.`;
        } else {
          conductText = `${student.name} needs focused behavior guidance and is urged to avoid minor distractions during sermon hours.`;
        }

        const achievementNotice = student.achievements.length > 0 
          ? `We celebrate their progress, particularly for "${achievementsList}".` 
          : `We urge them to actively participate in chapel devotions and scripture recitation.`;

        const closingText = `Recommended for promotion. May the Lord continue to bless their academic journey.`;

        const compiledComment = `${performanceText} ${conductText} ${achievementNotice} ${closingText}`;
        setEditableReportComment(compiledComment);
        setIsCompilingReportComment(false);
      }, 300);
    }
  };

  const handleCompileReportCommentForStudent = async (student: Student) => {
    setIsCompilingReportComment(true);
    setReportCommentFeedback('');
    try {
      const subjectsPayload = Object.entries(student.grades).map(([name, score]) => ({
        name,
        score
      }));
      const response = await fetch('/api/ai/report-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          grade: student.grade,
          performanceLevel: student.behaviorRating === 'Excellent' ? 'Exceptional grade tracker' : 'Steadily improving',
          subjects: subjectsPayload,
          behaviorRating: student.behaviorRating,
          keyTraits: student.achievements.slice(0, 3)
        })
      });
      const data = await response.json();
      if (response.ok && data.comment) {
        setEditableReportComment(data.comment);
        setReportCommentFeedback('AI Terminal Commentary compiled successfully!');
      } else {
        throw new Error("Local fallback required");
      }
    } catch (err) {
      console.log("Using High-Fidelity local compiler fallback for report commentary.");
      const avg = getStudentGradeAverage(student);
      const rating = student.behaviorRating;
      const achievementsList = student.achievements.length > 0 ? student.achievements.join(', ') : 'highly respectful behaviors';
      
      let performanceText = '';
      if (avg >= 85) {
        performanceText = `${student.name} is a brilliant scholar who exhibits outstanding academic capabilities. Their average of ${avg}% in ${student.grade} reflects meticulous study habits and deep comprehension.`;
      } else if (avg >= 70) {
        performanceText = `${student.name} shows commendable academic prowess with a high grade average of ${avg}%. They participate productively in lessons and display sound analytical skills.`;
      } else if (avg >= 55) {
        performanceText = `${student.name} shows steady scholastic effort, achieving an average score of ${avg}%. They have great potential if focus is sustained.`;
      } else {
        performanceText = `${student.name} requires intensive scholastic support. With a grade average of ${avg}%, they must prioritize reading exercises and extra tuition.`;
      }

      let conductText = '';
      if (rating === 'Excellent') {
        conductText = `In alignment with our school motto, "Holiness is our key", ${student.name} possesses excellent character and acts as a model pupil to peers.`;
      } else if (rating === 'Very Good' || rating === 'Good') {
        conductText = `${student.name}'s demeanor aligns beautifully with our values. They are obedient, polite, and respect the school's codes.`;
      } else {
        conductText = `${student.name} needs focused behavior guidance and is urged to avoid minor distractions during sermon hours.`;
      }

      const achievementNotice = student.achievements.length > 0 
        ? `We celebrate their progress, particularly for "${achievementsList}".` 
        : `We urge them to actively participate in chapel devotions and scripture recitation.`;

      const closingText = `Recommended for promotion. May the Lord continue to bless their academic journey.`;

      const compiledComment = `${performanceText} ${conductText} ${achievementNotice} ${closingText}`;
      setEditableReportComment(compiledComment);
      setReportCommentFeedback('Local Terminal Commentary compiled successfully!');
    } finally {
      setIsCompilingReportComment(false);
    }
  };

  const handleSaveReportComment = (studentId: string, comment: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, reportComment: comment } : s));
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent(prev => prev ? { ...prev, reportComment: comment } : null);
    }
    if (reportStudent && reportStudent.id === studentId) {
      setReportStudent(prev => prev ? { ...prev, reportComment: comment } : null);
    }
    setReportCommentFeedback("Report comment saved to pupil's official file!");
  };

  const handleDownloadCSV = () => {
    const headers = ["Name", "Grade", "Attendance Rate (%)"];
    const rows = filteredStudents.map(student => [
      student.name,
      student.grade,
      `${student.attendanceRate}%`
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pupils_directory_${selectedGradeFilter.toLowerCase().replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Helper calculations ---
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.guardianName.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesGrade = selectedGradeFilter === 'All' || s.grade === selectedGradeFilter;
    return matchesSearch && matchesGrade;
  });

  const getPerformanceBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" id="app-viewport">
      
      {/* --- TOP EMBASSY EMBLEM NAVIGATION HEADER --- */}
      <header className="bg-slate-900 text-white border-b-4 border-amber-500 shadow-lg relative overflow-hidden print:hidden" id="main-header">
        {/* Decorative Golden Pattern Bars */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-green-600"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* School Crest & Logo Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-white p-0.5 rounded-full border-2 border-amber-400 shadow-lg shrink-0 flex items-center justify-center">
                <SchoolCrest size={72} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight flex items-center gap-2">
                  <span>Saako Holy Child Academy</span>
                  <span className="text-xs font-mono bg-amber-500/25 px-2.5 py-1 rounded text-amber-400 font-semibold uppercase tracking-wider">
                    Portal
                  </span>
                </h1>
                <p className="text-slate-300 text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-400 font-medium">Motto:</span> 
                  <span className="italic">"Holiness is our key"</span>
                  <span className="text-slate-500 font-normal">|</span>
                  <span className="text-amber-400 font-medium ml-1">Con:</span> 
                  <span>{schoolInfo.phone}</span>
                </p>
              </div>
            </div>

            {/* Quick Admin Navigation Panel */}
            <nav className="flex flex-wrap items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60" id="main-tabs">
              <button 
                id="tab-btn-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeTab === 'dashboard' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-semibold' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                School Hub
              </button>
              <button 
                id="tab-btn-students"
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeTab === 'students' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-semibold' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                Pupils Directory
              </button>
              <button 
                id="tab-btn-teachers"
                onClick={() => setActiveTab('teachers')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeTab === 'teachers' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-semibold' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                Faculty Roster
              </button>
              <button 
                id="tab-btn-ai-tools"
                onClick={() => setActiveTab('ai-tools')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 flex items-center gap-1.5 ${
                  activeTab === 'ai-tools' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-semibold' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4 animate-pulse text-amber-400" />
                AI Assistants
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* --- QUICK ADMINISTRATIVE COUNTER METRICS BAR --- */}
      <section className="bg-white border-b border-slate-200 py-4 shadow-sm print:hidden" id="metrics-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="flex items-center space-x-3 p-2">
              <div className="bg-blue-50 text-blue-700 p-2.5 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Pupils</p>
                <p className="text-lg font-display font-bold text-slate-800">{totalStudentsCount}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="bg-amber-50 text-amber-700 p-2.5 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Teachers</p>
                <p className="text-lg font-display font-bold text-slate-800">{totalTeachersCount}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Attendance</p>
                <p className="text-lg font-display font-bold text-slate-800">{averageAttendance}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-2">
              <div className="bg-rose-50 text-rose-700 p-2.5 rounded-lg">
                <CheckCircle className="w-5 h-5 col-span-1" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Collected Fees</p>
                <p className="text-lg font-display font-bold text-slate-800">
                  GH₵ {totalFeesPaid} <span className="text-xs font-normal text-slate-500 font-mono">/ {totalFeesExpected}</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- MAIN PAGE GRAPHICS & DATA VIEWPORT --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in print:hidden" id="main-content-area">
        
        {/* CONTENT FOR TAB: DASHBOARD / COGNITIVE COMMUNITY HUB */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-hub">
            
            {/* LEFT COLUMN: School information, Mottos and core values (Ghanaian custom styling) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Devotional Holiness Lesson Banner */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border-b-4 border-amber-500 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-8 translate-y-8">
                  <School className="w-64 h-64" />
                </div>
                <span className="bg-amber-500 text-slate-950 text-xs uppercase font-mono px-2.5 py-1 rounded font-bold tracking-wider">
                  Weekly Faith & Holiness Target
                </span>
                <h2 className="text-2xl font-bold font-display mt-3 text-amber-400">
                  "Excellence Through Clean Conduct and Integrity"
                </h2>
                <p className="mt-2 text-slate-200 text-sm leading-relaxed max-w-xl">
                  As our model motto states, <strong className="text-white">"Holiness is our key"</strong>. We encourage all tutors to begin classes with a brief devotion focus, promoting high academic dedication alongside strict personal integrity and respect for elders and peers.
                </p>
                <div className="mt-5 flex gap-3 text-amber-300 text-xs font-semibold">
                  <span>✨ Honesty</span>
                  <span>•</span>
                  <span>🛡️ Self-discipline</span>
                  <span>•</span>
                  <span>✝️ Respect</span>
                </div>
              </div>

              {/* Fee Collection Monitor Grid */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-900" />
                      Fee Collection Monitor
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Overview of paid vs. outstanding school fees aggregated across grade levels
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#10b981] block" />
                      <span className="text-slate-600">Paid Fees</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#f59e0b] block" />
                      <span className="text-slate-600">Outstanding Fees</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const data = getFeeDataByGrade();
                    const totalPaidSum = data.reduce((sum, d) => sum + d.paid, 0);
                    const totalOutstandingSum = data.reduce((sum, d) => sum + d.outstanding, 0);
                    const collectionRate = totalPaidSum + totalOutstandingSum > 0 
                      ? Math.round((totalPaidSum / (totalPaidSum + totalOutstandingSum)) * 100) 
                      : 100;

                    return (
                      <>
                        <div className="p-4 rounded-xl border border-slate-100 bg-emerald-50/40">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">Total Paid Fees</span>
                          <span className="text-xl font-bold text-slate-900 block mt-1">GH₵ {totalPaidSum.toLocaleString()}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-100 bg-amber-50/40">
                          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide block">Total Outstanding</span>
                          <span className="text-xl font-bold text-slate-900 block mt-1">GH₵ {totalOutstandingSum.toLocaleString()}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-100 bg-blue-50/40">
                          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide block">Overall Collection Rate</span>
                          <span className="text-xl font-bold text-slate-900 block mt-1">{collectionRate}% Paid</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Chart Container */}
                <div className="h-64 w-full text-xs font-sans">
                  {(() => {
                    const data = getFeeDataByGrade();
                    if (data.length === 0) {
                      return (
                        <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                          No active collection data to display. Enroll pupils with fees to monitor records.
                        </div>
                      );
                    }

                    const CustomTooltip = ({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-lg space-y-1.5 text-xs">
                            <p className="font-bold border-b border-slate-800 pb-1 mb-1">{item.grade}</p>
                            <p className="flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Paid: <span className="font-mono font-bold">GH₵ {item.paid.toLocaleString()}</span>
                            </p>
                            <p className="flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              Outstanding: <span className="font-mono font-bold">GH₵ {item.outstanding.toLocaleString()}</span>
                            </p>
                            <p className="text-slate-400 text-[10px] pt-1">
                              Total expected: <span className="font-mono text-white">GH₵ {item.expected.toLocaleString()} ({item.studentCount} pupils)</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    };

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data}
                          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="grade" 
                            tickLine={false}
                            axisLine={false}
                            stroke="#64748b"
                            tick={{ fontSize: 10, fontWeight: 500 }}
                          />
                          <YAxis 
                            tickFormatter={(val) => `GH₵${val}`}
                            tickLine={false}
                            axisLine={false}
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="paid" 
                            fill="#10b981" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                          <Bar 
                            dataKey="outstanding" 
                            fill="#f59e0b" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>

                {/* Red Flag Priority Collection List */}
                <div className="border-t border-slate-100 pt-5 mt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block shrink-0" />
                        Red Flag Priority Collection List
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Scholars with high-priority outstanding fee balances requiring immediate administrative follow-up
                      </p>
                    </div>
                    
                    {/* Deficit Filter */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                      <span className="text-[9px] uppercase font-bold text-slate-500">Min Deficit:</span>
                      <select
                        value={redFlagThreshold}
                        onChange={(e) => setRedFlagThreshold(Number(e.target.value))}
                        className="text-[10px] bg-white border border-slate-200 rounded-md py-0.5 px-1.5 font-bold text-slate-800 outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                      >
                        <option value="150">GH₵ 150+</option>
                        <option value="250">GH₵ 250+</option>
                        <option value="400">GH₵ 400+</option>
                        <option value="600">GH₵ 600+</option>
                      </select>
                    </div>
                  </div>

                  {/* list item renderer */}
                  {(() => {
                    const overdueStudents = students
                      .map(s => ({
                        ...s,
                        outstanding: Math.max(0, s.feesTotal - s.feesPaid),
                        coveragePercent: s.feesTotal > 0 ? Math.round((s.feesPaid / s.feesTotal) * 100) : 100
                      }))
                      .filter(s => s.outstanding >= redFlagThreshold)
                      .sort((a, b) => b.outstanding - a.outstanding);

                    if (overdueStudents.length === 0) {
                      return (
                        <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100/50 text-slate-400 text-xs font-medium">
                          No scholars match the selected deficit threshold. All collections are in good standing!
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {overdueStudents.map(stud => (
                          <div 
                            key={stud.id}
                            className="p-3 bg-rose-50/15 hover:bg-rose-50/30 border border-rose-100/60 rounded-xl flex items-start justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-850 text-xs">{stud.name}</span>
                                <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                  {stud.grade}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Guardian: <strong className="text-slate-700">{stud.guardianName}</strong> 
                                <span className="mx-1">•</span> 
                                <span className="font-mono text-slate-650">{stud.guardianPhone}</span>
                              </p>
                              
                              {/* micro coverage bar */}
                              <div className="w-40 pt-1">
                                <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mb-0.5">
                                  <span>FEE REMITTING LEVEL</span>
                                  <span>{stud.coveragePercent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-rose-500 h-full rounded-full transition-all duration-300 animate-pulse"
                                    style={{ width: `${stud.coveragePercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-extrabold text-rose-600 block uppercase tracking-wider">OUTSTANDING</span>
                              <span className="text-xs font-bold text-rose-700 block font-mono">GH₵ {stud.outstanding.toLocaleString()}</span>
                              <span className="text-[9px] font-semibold text-slate-400 block">Total: GH₵ {stud.feesTotal.toLocaleString()}</span>
                              
                              {/* quick action draft dispatch reminders */}
                              <div className="mt-2 flex gap-1 justify-end">
                                <a 
                                  href={`tel:${stud.guardianPhone}`}
                                  className="text-[9px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold transition flex items-center gap-0.5"
                                  title="Voice Call Guardian"
                                >
                                  📞 Call
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Reminder alert dispatched successfully to ${stud.guardianName} (${stud.guardianPhone}) for outstanding GH₵ ${stud.outstanding.toLocaleString()} on school fees ledger for scholar ${stud.name}.`);
                                  }}
                                  className="text-[9px] bg-rose-600 hover:bg-rose-700 text-white px-1.5 py-0.5 rounded font-bold transition flex items-center gap-0.5 cursor-pointer"
                                  title="Send Digital Reminder Notification"
                                >
                                  📩 Notify
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Dynamic Announcements Grid */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                    <h3 className="font-display font-bold text-lg text-slate-800">
                      General Notices & Administrative Circulars
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="text-xs bg-slate-900 text-slate-100 hover:bg-slate-800 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all duration-150"
                  >
                    <Plus className="w-3.5 h-3.5" /> Publish New
                  </button>
                </div>

                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div 
                      key={ann.id} 
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all duration-150 relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ann.category === 'Urgent' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            ann.category === 'Holiday' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            ann.category === 'Event' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-200 text-slate-800 border border-slate-300'
                          }`}>
                            {ann.category}
                          </span>
                          <h4 className="font-bold text-slate-800 text-base mt-2">{ann.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-slate-400 font-medium">{ann.date}</span>
                      </div>
                      <p className="mt-2 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span>Signed: <strong className="text-slate-500">{ann.author}</strong></span>
                        <button 
                          onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
                          className="hover:text-rose-600 text-slate-300 p-1 rounded hover:bg-rose-50 transition-all"
                          title="Archive Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Calendar list & Info hub cards */}
            <div className="space-y-8">
              
              {/* School Office Information Map card */}
              <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-display font-bold text-base text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <School className="w-4.5 h-4.5 text-blue-900" />
                  Official Registry
                </h3>
                <ul className="space-y-3.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span>{schoolInfo.address}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span>{schoolInfo.phone}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span>{schoolInfo.email}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Info className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span>Established: Year {schoolInfo.established} (Sawla Savannah Region Board Approved)</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Term Planner/Events list */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                    Term Academic Calendar
                  </h3>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-wide">
                    2026 Term 3
                  </span>
                </div>

                <div className="space-y-3">
                  {calendarEvents.map((evt) => (
                    <div key={evt.id} className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-150">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                          evt.type === 'Exam' ? 'bg-red-50 text-red-600 border border-red-100' :
                          evt.type === 'Meeting' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          evt.type === 'Holiday' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {evt.type}
                        </span>
                        <span className="text-slate-400 text-xs font-mono font-medium">{evt.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs mt-2">{evt.title}</h4>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CONTENT FOR TAB: STUDENTS DIRECTORY / LEDGER */}
        {activeTab === 'students' && (
          <div className="space-y-6" id="students-comp">
            
            {/* SEARCH AND FILTERING HEADER BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Live search input */}
              <div className="relative flex-1 max-w-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search student by name or parent..." 
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all duration-150"
                />
              </div>

              {/* Role Simulation Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-150/80 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setAdminViewEnabled(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    adminViewEnabled 
                      ? 'bg-blue-950 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                  title="Switch to Admin Mode"
                >
                  🛡️ Admin Role
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewEnabled(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    !adminViewEnabled 
                      ? 'bg-blue-950 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                  title="Switch to Teacher/Staff Mode"
                >
                  🧑‍🏫 Teacher Role
                </button>
              </div>

              {/* Filter controls and add buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Custom Grade Level Filter Dropdown */}
                <div className="relative" id="grade-level-filter-container">
                  <button
                    type="button"
                    onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                    title="Toggle Grade Level Filter Dropdown"
                  >
                    <Filter className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                    <span>Grade Level:</span>
                    <span className="bg-blue-950 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold max-w-[80px] truncate">
                      {selectedGradeFilter === 'All' ? 'All Classes' : selectedGradeFilter}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isGradeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isGradeDropdownOpen && (
                    <>
                      {/* Dropdown Backdrop to close on click outside easily */}
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setIsGradeDropdownOpen(false)}
                      />
                      
                      {/* Floating Dropdown Card */}
                      <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2.5 z-50 animate-fade-in origin-top-left">
                        <div className="px-3.5 pb-2 border-b border-slate-100 mb-1.5 flex justify-between items-center">
                          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase font-display">Select Class Group</span>
                          {selectedGradeFilter !== 'All' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGradeFilter('All');
                                setIsGradeDropdownOpen(false);
                              }}
                              className="text-[9px] font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded tracking-wide uppercase transition-all"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Dropdown Options List */}
                        <div className="max-h-72 overflow-y-auto space-y-0.5 px-1.5">
                          {/* "All" Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGradeFilter('All');
                              setIsGradeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-100 flex items-center justify-between ${
                              selectedGradeFilter === 'All' 
                                ? 'bg-amber-100/70 text-amber-905 border border-amber-200/50' 
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span>🌟 Show All Grades</span>
                            {selectedGradeFilter === 'All' && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          </button>

                          <div className="h-px bg-slate-100 my-1 mx-2" />

                          {/* Group header: Early Years */}
                          <div className="text-[9px] text-slate-400 font-bold tracking-tight px-3 py-1 uppercase mt-1">Preschool & KG</div>
                          {AVAILABLE_GRADES_LIST.filter(g => ['Nur', 'KG1', 'KG2'].includes(g)).map(grade => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => {
                                setSelectedGradeFilter(grade);
                                setIsGradeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-100 flex items-center justify-between ${
                                selectedGradeFilter === grade 
                                  ? 'bg-amber-100/70 text-amber-905 border border-amber-200/50' 
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span>🧸 {grade}</span>
                              {selectedGradeFilter === grade && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            </button>
                          ))}

                          {/* Group header: Primary */}
                          <div className="text-[9px] text-slate-400 font-bold tracking-tight px-3 py-1 uppercase mt-2">Primary School</div>
                          {AVAILABLE_GRADES_LIST.filter(g => g.startsWith('Primary')).map(grade => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => {
                                setSelectedGradeFilter(grade);
                                setIsGradeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-100 flex items-center justify-between ${
                                selectedGradeFilter === grade 
                                  ? 'bg-amber-100/70 text-amber-905 border border-amber-200/50' 
                                  : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span>📖 {grade}</span>
                              {selectedGradeFilter === grade && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            </button>
                          ))}

                          {/* Group header: JHS */}
                          <div className="text-[9px] text-slate-400 font-bold tracking-tight px-3 py-1 uppercase mt-2">Junior High School</div>
                          {AVAILABLE_GRADES_LIST.filter(g => g.startsWith('JHS')).map(grade => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => {
                                setSelectedGradeFilter(grade);
                                setIsGradeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-100 flex items-center justify-between ${
                                selectedGradeFilter === grade 
                                  ? 'bg-amber-100/70 text-amber-905 border border-amber-200/50' 
                                  : 'text-slate-755 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <span>🎓 {grade}</span>
                              {selectedGradeFilter === grade && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                 <button 
                  onClick={() => {
                    resetBulkSelectionForGrade(selectedGradeFilter === 'All' ? AVAILABLE_GRADES_LIST[0] : selectedGradeFilter);
                    setIsBulkAttendanceOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Bulk Update Attendance"
                >
                  <Clipboard className="w-3.5 h-3.5 text-slate-950" /> Bulk Attendance
                </button>

                <button 
                  onClick={() => {
                    resetBulkGradesSelectionForGrade(selectedGradeFilter === 'All' ? AVAILABLE_GRADES_LIST[0] : selectedGradeFilter);
                    setIsBulkGradesOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-none"
                  title="Bulk Entry of Subject Grades"
                >
                  <Award className="w-3.5 h-3.5 text-indigo-200" /> Bulk Grade Entry
                </button>

                <button 
                  onClick={() => handleOpenStudentModal(null)}
                  className="bg-blue-950 text-white hover:bg-blue-900 text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-500" /> Enroll New Pupil
                </button>

                <button 
                  onClick={handleDownloadCSV}
                  className="bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Download CSV export"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-100" /> Download CSV
                </button>
              </div>

            </div>

            {/* TWO-COLUMN DIRECTORY SPLIT PANELS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT BOARD: Pupil Listings */}
              <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 text-white flex justify-between items-center">
                  <span className="text-xs font-semibold text-amber-500 tracking-wider uppercase font-display">
                    Record Directory ({filteredStudents.length} listed)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                    Active Ledger
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No pupil records found fitting search parameters.
                    </div>
                  ) : (
                    filteredStudents.map(student => {
                      const outstanding = student.feesTotal - student.feesPaid;
                      const studentAvg = getStudentGradeAverage(student);
                      let gradeLetter = 'Grade C';
                      let gradeBgAndText = 'bg-rose-50 text-rose-700 border-rose-200'; // Red for C and lower
                      if (studentAvg >= 80) {
                        gradeLetter = 'Grade A';
                        gradeBgAndText = 'bg-emerald-50 text-emerald-700 border border-emerald-200'; // Green
                      } else if (studentAvg >= 65) {
                        gradeLetter = 'Grade B';
                        gradeBgAndText = 'bg-amber-100/75 text-amber-805 border border-amber-200'; // Yellow/Amber
                      }

                      return (
                        <div 
                          key={student.id} 
                          onClick={() => setSelectedStudent(student)}
                          className={`p-4 cursor-pointer hover:bg-slate-50/80 transition-all duration-150 relative ${
                            selectedStudent?.id === student.id ? 'bg-amber-50/65 border-l-4 border-amber-505' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Student Thumbnail */}
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                              {student.photo ? (
                                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold font-display text-slate-500">
                                  {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate">{student.name}</h4>
                                  <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                    <span className="bg-slate-100 text-slate-700 font-bold px-1 rounded text-[9px] uppercase">
                                      {student.grade}
                                    </span>
                                    <span className="text-slate-350">•</span>
                                    <span>{student.gender}</span>
                                    <span className="text-slate-350">•</span>
                                    <span className={`px-1.5 py-0.5 font-bold rounded text-[9px] border uppercase ${gradeBgAndText}`}>
                                      {gradeLetter}
                                    </span>
                                  </p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                  outstanding === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                  outstanding > 500 ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                                  'bg-amber-50 text-amber-700 border border-amber-150'
                                }`}>
                                  {outstanding === 0 ? 'Paid' : `GH₵ ${outstanding}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
                            <span>Attendance: <strong className={student.attendanceRate < 80 ? "text-rose-600 font-extrabold animate-pulse bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1" : "font-semibold text-slate-705"}>
                              {student.attendanceRate < 80 && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                              {student.attendanceRate}%
                            </strong></span>
                            <span>Conduct: <strong className="text-teal-600">{student.behaviorRating}</strong></span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT BOARD: Selected Pupil Detailed Profile view */}
              <div className="lg:col-span-7 space-y-6">
                {selectedStudent ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Character Banner Header */}
                    <div className="bg-gradient-to-r from-blue-950 to-slate-900 p-6 text-white relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                          {/* Selected Student Profile Photo */}
                          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                            {selectedStudent.photo ? (
                              <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl font-black font-display text-amber-500">
                                {selectedStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="bg-amber-505 text-slate-950 font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                              Pupil Master File
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold font-display mt-1 text-white truncate">
                              {selectedStudent.name}
                            </h3>
                            <p className="text-slate-300 text-[11px] mt-0.5 truncate flex flex-wrap gap-x-2">
                              <span>Class: <strong className="text-amber-400">{selectedStudent.grade}</strong></span>
                              <span className="text-slate-500">•</span>
                              <span>Parent: {selectedStudent.guardianName} ({selectedStudent.guardianPhone})</span>
                            </p>
                          </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex flex-wrap gap-2 self-start sm:self-auto shrink-0">
                          <button 
                            onClick={() => handleOpenReportModal(selectedStudent)}
                            className="bg-amber-500 hover:bg-amber-600 p-2 rounded-lg text-slate-950 font-semibold hover:shadow transition-all text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                            title="Generate Printable PDF Report Card"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-955" /> Report Card
                          </button>
                          <button 
                            onClick={() => handleOpenStudentModal(selectedStudent)}
                            className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                            title="Edit Record File"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(selectedStudent.id)}
                            className="bg-slate-800 hover:bg-rose-900 p-2 rounded-lg text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                            title="Withdraw student file"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-400">Current Conduct Code:</span>
                          <span className="ml-1.5 font-bold text-amber-400">{selectedStudent.behaviorRating}</span>
                        </div>
                        <span className="text-slate-700">|</span>
                        <div>
                          <span className="text-slate-400">Attendance Index:</span>
                          <span className={`ml-1.5 font-bold px-1.5 py-0.5 rounded ${
                            selectedStudent.attendanceRate < 80 
                              ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30 animate-pulse' 
                              : 'text-emerald-400'
                          }`}>{selectedStudent.attendanceRate}%</span>
                        </div>
                        <span className="text-slate-700">|</span>
                        <div>
                          <span className="text-slate-400">Outstanding Fees:</span>
                          <span className="ml-1.5 font-bold text-rose-400">GH₵ {selectedStudent.feesTotal - selectedStudent.feesPaid}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ledger tabs segment */}
                    <div className="p-6 space-y-6">

                      {/* Class Comparison Performance Summary Card */}
                      {(() => {
                        const studentAvg = getStudentGradeAverage(selectedStudent);
                        const classAvg = (() => {
                          const classStudents = students.filter(s => s.grade === selectedStudent.grade);
                          if (classStudents.length === 0) return 0;
                          const total = classStudents.reduce((acc, s) => acc + getStudentGradeAverage(s), 0);
                          return Math.round(total / classStudents.length);
                        })();
                        const variance = studentAvg - classAvg;

                        return (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-4.5 h-4.5 text-blue-900" />
                                <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider">
                                  Class Comparison Card
                                </h4>
                              </div>
                              {variance >= 0 ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider">
                                  🏆 {variance === 0 ? 'On Par with Class' : `+${variance}% Above Class` }
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-rose-100 uppercase tracking-wider">
                                  ⚠️ {Math.abs(variance)}% Below Class
                                </span>
                              )}
                            </div>

                            <div className="space-y-3">
                              {/* Student progress bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-slate-650 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-900 inline-block"></span>
                                    {selectedStudent.name}'s Average Index
                                  </span>
                                  <span className="font-bold text-blue-955">{studentAvg}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-blue-950 h-2.5 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${studentAvg}%` }}
                                  />
                                </div>
                              </div>

                              {/* Class benchmark average progress bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                                    Standard Class Average ({selectedStudent.grade})
                                  </span>
                                  <span className="font-bold text-slate-600">{classAvg}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-slate-400 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${classAvg}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                              * Cohort benchmarks are automatically adjusted in real-time based on all active scholar ledger submissions in {selectedStudent.grade}.
                            </p>
                          </div>
                        );
                      })()}

                      {/* SECTION 1: Academic Grading Ledger */}
                      <div>
                        <h4 className="font-display font-semibold text-slate-800 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          Curriculum Subject Scores (Third Term)
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(selectedStudent.grades).map(([subj, score]) => {
                            const numericScore = score as number;
                            return (
                              <div key={subj} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-4">
                                <span className="text-xs font-medium text-slate-700 line-clamp-1">{subj}</span>
                                <div className="flex items-center space-x-2 shrink-0">
                                  <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    value={numericScore}
                                    onChange={(e) => handleUpdateStudentGrade(selectedStudent.id, subj, parseInt(e.target.value) || 0)}
                                    className="w-12 text-center text-xs font-bold bg-white border border-slate-200 rounded p-1 focus:ring-1 focus:ring-blue-800"
                                  />
                                  <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0 ${getPerformanceBadgeClass(numericScore)}`}>
                                    {numericScore >= 80 ? 'Grade A' : numericScore >= 60 ? 'Grade B' : 'Grade C'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SECTION 1.5: Academic Performance Progress Trend Chart */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/65 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                          <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            Academic Progress Trend (Terminal Milestone)
                          </h4>
                          
                          <select
                            value={trendSubject}
                            onChange={(e) => setTrendSubject(e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-705 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
                          >
                            <option value="All">All Subjects (Avg Trend)</option>
                            {Object.keys(selectedStudent.grades).map(subj => (
                              <option key={subj} value={subj}>{subj}</option>
                            ))}
                          </select>
                        </div>

                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={getTrendDataForSubject(selectedStudent, trendSubject)}
                              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#64748b', fontSize: 10 }} 
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={false}
                              />
                              <YAxis 
                                domain={[0, 100]} 
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={false}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#fff', 
                                  borderRadius: '0.75rem', 
                                  border: '1px solid #e2e8f0',
                                  fontSize: '11px',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Score" 
                                stroke="#4f46e5" 
                                strokeWidth={2.5}
                                activeDot={{ r: 6 }} 
                                dot={{ fill: '#4f46e5', strokeWidth: 1.5, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono text-center flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block animate-pulse"></span>
                          Shows scholastic performance growth from early diagnostic checkpoints to end-term cumulative marks.
                        </div>
                      </div>

                      {/* SECTION 2: Daily Attendance Register Marker */}
                      <div>
                        <h4 className="font-display font-semibold text-slate-800 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <CheckCircle className="w-4 h-4 text-slate-500" />
                          Attendance Check Ledger
                        </h4>
                        
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                          <div>
                            <span className="text-xs font-semibold text-slate-700 block">Today's Attendance Status (May 28, 2026)</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Update will modify average rate</span>
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleAttendance(selectedStudent.id, '2026-05-28', 'Present')}
                              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                                selectedStudent.attendanceHistory['2026-05-28'] === 'Present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleToggleAttendance(selectedStudent.id, '2026-05-28', 'Late')}
                              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                                selectedStudent.attendanceHistory['2026-05-28'] === 'Late'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => handleToggleAttendance(selectedStudent.id, '2026-05-28', 'Absent')}
                              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                                selectedStudent.attendanceHistory['2026-05-28'] === 'Absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>

                        {/* Recharts Attendance 30-day Trend Graph */}
                        <div className="mt-4 p-4 rounded-xl border border-slate-200/60 bg-white space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-900" />
                                Weekday Attendance Metrics (Last 30 Days)
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Analyzed timeline of individual attendance patterns
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              {(() => {
                                const stats = getAttendanceTrendData(selectedStudent);
                                return (
                                  <>
                                    <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      {stats.presentCount} Present
                                    </span>
                                    <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                      {stats.lateCount} Late
                                    </span>
                                    <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                                      {stats.absentCount} Absent
                                    </span>
                                    <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100" title="Calculated as weighted (Present + Late * 0.5) rate">
                                      {stats.calculatedRate}% Average
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Pattern Alerts */}
                          {(() => {
                            const stats = getAttendanceTrendData(selectedStudent);
                            if (stats.patterns.length === 0) return null;
                            return (
                              <div className="space-y-1">
                                {stats.patterns.map((pat, pi) => {
                                  const isPerfect = pat.includes('100%');
                                  return (
                                    <div key={pi} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1.5 ${
                                      isPerfect 
                                        ? 'bg-emerald-50/50 text-emerald-700 border border-emerald-100/50' 
                                        : 'bg-indigo-50/50 text-indigo-700 border border-indigo-100/50'
                                    }`}>
                                      <span className="text-xs">{isPerfect ? '⭐' : '🔎'}</span>
                                      <span><strong>Pattern Alert:</strong> {pat}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Chart Render Canvas */}
                          <div className="h-44 w-full text-[10px] font-mono select-none" style={{ position: 'relative' }}>
                            {(() => {
                              const stats = getAttendanceTrendData(selectedStudent);
                              
                              const CustomChartTooltip = ({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-md space-y-1 font-sans text-[11px]">
                                      <p className="font-bold border-b border-slate-800 pb-1 mb-1">{data.label} ({data.dayOfWeek})</p>
                                      <p className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          data.status === 'Present' ? 'bg-emerald-400' :
                                          data.status === 'Late' ? 'bg-amber-400' : 'bg-rose-400'
                                        }`} />
                                        Status: <span className="font-bold">{data.status}</span>
                                      </p>
                                      <p className="text-slate-400 text-[10px]">
                                        30d Cumulative Avg: <span className="font-mono text-white font-bold">{data.rollingRate}%</span>
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              };

                              return (
                                <ResponsiveContainer width="100%" height="100%">
                                  <ComposedChart
                                    data={stats.chartData}
                                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                      dataKey="label" 
                                      tickLine={false}
                                      axisLine={false}
                                      stroke="#94a3b8"
                                      tick={{ fontSize: 9 }}
                                      interval={3}
                                    />
                                    <YAxis 
                                      domain={[0, 100]}
                                      ticks={[0, 50, 100]}
                                      tickFormatter={(v) => v === 100 ? 'Present' : v === 50 ? 'Late' : 'Absent'}
                                      tickLine={false}
                                      axisLine={false}
                                      stroke="#94a3b8"
                                      tick={{ fontSize: 8 }}
                                    />
                                    <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                                    
                                    <Bar 
                                      dataKey="value" 
                                      radius={[4, 4, 0, 0]}
                                      maxBarSize={8}
                                      shape={(props: any) => {
                                        const { fill, x, y, width, height, payload } = props;
                                        let barColor = '#10b981';
                                        if (payload.status === 'Late') barColor = '#f59e0b';
                                        if (payload.status === 'Absent') barColor = '#ef4444';
                                        return (
                                          <rect 
                                            x={x} 
                                            y={y} 
                                            width={width} 
                                            height={height} 
                                            fill={barColor}
                                            rx={2}
                                            ry={2}
                                            opacity={0.8}
                                          />
                                        );
                                      }}
                                    />

                                    <Line 
                                      type="monotone"
                                      dataKey="rollingRate" 
                                      stroke="#1e3a8a" 
                                      strokeWidth={1.5}
                                      dot={false}
                                      name="30d Rolling Average %"
                                      activeDot={{ r: 4, strokeWidth: 0, fill: '#1e3a8a' }}
                                    />
                                  </ComposedChart>
                                </ResponsiveContainer>
                              );
                            })()}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1.5 border-t border-slate-100 font-sans">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Present (100)
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] ml-1.5" /> Late (50)
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] ml-1.5" /> Absent (0)
                            </span>
                            <span className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                              <span className="w-3 h-0.5 bg-[#1e3a8a] block" />
                              30-Day Rolling average
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: Fees & Accounts Panel */}
                      <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fees Accountability</h5>
                            <div className="mt-2 text-sm text-slate-700">
                              Paid: <strong className="text-emerald-700">GH₵ {selectedStudent.feesPaid}</strong> 
                              <span className="text-slate-400 mx-1.5">/</span> 
                              Required: <strong>GH₵ {selectedStudent.feesTotal}</strong>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setPaymentStudentId(selectedStudent.id);
                              setPaymentAmount(selectedStudent.feesTotal - selectedStudent.feesPaid);
                              setIsPaymentModalOpen(true);
                            }}
                            disabled={selectedStudent.feesTotal === selectedStudent.feesPaid}
                            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 ${
                              selectedStudent.feesTotal === selectedStudent.feesPaid
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
                            }`}
                          >
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            Record Fees Payment
                          </button>
                        </div>
                      </div>

                      {/* SECTION 4: Achievements & Moral Badges */}
                      <div>
                        <h4 className="font-display font-semibold text-slate-800 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Award className="w-4 h-4 text-pink-600" />
                          Character Merit Badges / Scholar Milestones
                        </h4>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedStudent.achievements.map((ach, idx) => (
                            <span 
                              key={idx} 
                              className="bg-purple-50 text-purple-700 border border-purple-100 rounded-lg px-2.5 py-1 text-xs font-semibold"
                            >
                              🎈 {ach}
                            </span>
                          ))}
                        </div>

                        {/* Fast insert achievement tag */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            id="quick-achievement-input"
                            placeholder="Add achievement or ethical citation..."
                            className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none flex-1 font-medium"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.currentTarget;
                                handleAddAchievement(selectedStudent.id, input.value);
                                input.value = '';
                                e.preventDefault();
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const el = document.getElementById('quick-achievement-input') as HTMLInputElement;
                              if (el && el.value.trim()) {
                                handleAddAchievement(selectedStudent.id, el.value.trim());
                                el.value = '';
                              }
                            }}
                            className="bg-slate-900 text-white rounded-lg px-3 py-1 text-xs font-semibold hover:bg-slate-800 shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* SECTION 4.5: Private Administrative Notes (Admins Only) */}
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/65 pb-2">
                          <h4 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            Private Administrative Notes
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            adminViewEnabled 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {adminViewEnabled ? '🛡️ Admin View Access Enabled' : '🔒 Locked for Non-Admins'}
                          </span>
                        </div>

                        {adminViewEnabled ? (
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-400 font-medium">
                              Enter private observations, dietary restrictions, emergency overrides, or behavioral flags. These notes persist in the student's record and are hidden from standard teachers/guests.
                            </p>
                            <textarea
                              rows={3}
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-705 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
                              placeholder="Type sensitive pupil records/comments here..."
                              value={selectedStudent.adminNotes || ''}
                              onChange={(e) => handleUpdateStudentAdminNotes(selectedStudent.id, e.target.value)}
                            />
                            {selectedStudent.adminNotes ? (
                              <div className="text-[10px] text-emerald-600 font-mono text-right flex items-center justify-end gap-1 font-semibold">
                                <span>✓ Auto-saved & persisted in local master record</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 font-mono text-right font-semibold">
                                <span>No administrative notes logged</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="py-4 text-center space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
                              🔒 Access Denied / Encrypted Log
                            </p>
                            <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-normal">
                              To preserve scholar confidentiality, private administrative logs can only be viewed or modified by authorised school headmasters and administrators. Please activate individual <strong>Admin Role</strong> in the directory header options view to proceed.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* QUICK REDIRECT TO AI REPORT WRIPER */}
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedAIStudentId(selectedStudent.id);
                            setActiveTab('ai-tools');
                          }}
                          className="text-xs text-blue-900 font-semibold hover:text-amber-600 flex items-center gap-1 transition-colors"
                        >
                          Send to AI Comment Writer <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-3" />
                    <p className="font-display font-medium text-slate-500">No pupil card active</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Select a pupil from the directory list on the left to view comprehensive grades ledger, write AI terminal reports, or record school fees payments.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* CONTENT FOR TAB: FACULTY ROSTER */}
        {activeTab === 'teachers' && (
          <div className="space-y-6 animate-fade-in" id="teachers-comp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-800">
                  Faculty Tutors & Class Mentors
                </h3>
                <p className="text-slate-500 text-xs">
                  Educators demonstrating instructional wisdom aligned with our faith motto, holiness key standards.
                </p>
              </div>

              <button 
                onClick={() => setIsTeacherModalOpen(true)}
                className="bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" /> Contract New Tutor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.map(teacher => (
                <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-150 p-5 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100">
                      <School className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      teacher.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {teacher.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-base mt-4">{teacher.name}</h4>
                  <p className="text-xs text-slate-500 font-medium font-mono mt-1">Class Assigned: {teacher.gradeAssigned}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">Selected Subjects</span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects.map((sub, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-705 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setTeachers(prev => prev.filter(t => t.id !== teacher.id))}
                      className="text-slate-300 hover:text-rose-600 transition"
                      title="Archive Tutor Records"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* CONTENT FOR TAB: AI ASSISTANTS MODULE */}
        {activeTab === 'ai-tools' && (
          <div className="space-y-8 animate-fade-in" id="ai-assistants-comp">
            
            {/* AI COMMENT GENERATOR UTILITY CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between pb-4 border-b border-indigo-100 mb-6">
                <div>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide">
                    Terminal Report Cards
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-slate-800 mt-1.5 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-500 animate-spin" />
                    AI Terminal commentary compiler
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Generate highly customized Headteacher comments integrated with the student's real subject grades, conduct behavior, and Saako Holy Child faith values.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Setup Panel */}
                <div className="lg:col-span-4 space-y-4">
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">1. Target Pupil Selection</label>
                    <select
                      value={selectedAIStudentId}
                      onChange={(e) => setSelectedAIStudentId(e.target.value)}
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-mediumOutline focus:bg-white transition-all flex items-center"
                    >
                      <option value="">-- Choose Pupil --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>

                  {selectedAIStudentId && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Live Selected Stats:</span>
                      <div>Grade Average: <strong className="text-slate-800">
                        {getStudentGradeAverage(students.find(s => s.id === selectedAIStudentId))}%
                      </strong></div>
                      <div>Conduct: <strong className="text-emerald-700">{students.find(s => s.id === selectedAIStudentId)?.behaviorRating}</strong></div>
                      <div>Attendance: <strong>{students.find(s => s.id === selectedAIStudentId)?.attendanceRate}%</strong></div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">2. Character Core Tagwords</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        placeholder="Tag (e.g. Determined)" 
                        value={rawTraitInput}
                        onChange={(e) => setRawTraitInput(e.target.value)}
                        className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs flex-1 outline-none focus:bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (rawTraitInput.trim() && !aiKeyTraits.includes(rawTraitInput.trim())) {
                              setAIKeyTraits(prev => [...prev, rawTraitInput.trim()]);
                              setRawTraitInput('');
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (rawTraitInput.trim() && !aiKeyTraits.includes(rawTraitInput.trim())) {
                            setAIKeyTraits(prev => [...prev, rawTraitInput.trim()]);
                            setRawTraitInput('');
                          }
                        }}
                        className="bg-slate-900 text-slate-100 text-xs font-bold px-3 rounded-lg"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {aiKeyTraits.map(tag => (
                        <span key={tag} className="bg-slate-200/80 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          {tag}
                          <button 
                            type="button" 
                            className="text-slate-400 hover:text-slate-900"
                            onClick={() => setAIKeyTraits(prev => prev.filter(t => t !== tag))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAIComment}
                    disabled={isGeneratingAIComment || !selectedAIStudentId}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                      !selectedAIStudentId 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-950 hover:bg-blue-900 text-white shadow-xs hover:shadow'
                    }`}
                  >
                    {isGeneratingAIComment ? "compiling academic files..." : "Compile Terminal Comment"}
                  </button>

                </div>

                {/* Response Print Output View */}
                <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative min-h-[290px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                        Terminal Output Panel
                      </span>
                      {aiSimulationTag && (
                        <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                          🔌 Client Simulation Mode Enabled
                        </span>
                      )}
                    </div>

                    {isGeneratingAIComment ? (
                      <div className="p-8 text-center space-y-3">
                        <div className="w-6 h-6 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-medium">Invoking secondary model frameworks, synthesizing school motto indicators...</p>
                      </div>
                    ) : aiReportOutput ? (
                      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-white p-5 rounded-xl border border-slate-200/50">
                        {aiReportOutput}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-400 text-xs">
                        Select a target student and launch compiler. The system will consult grades logs and generate terminal report card paragraphs.
                      </div>
                    )}
                  </div>

                  {aiReportOutput && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2.5 justify-end">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiReportOutput);
                          alert("Terminal report comment copied to clipboard!");
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1 transition"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-slate-600" />
                        Copy text
                      </button>
                      <button
                        onClick={handleApplyAICommentToAchievements}
                        className="bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        Add comment to pupil report achievement profile
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* AI GES LESSON PLAN WRITER UTILITY CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between pb-4 border-b border-rose-100 mb-6 font-display">
                <div>
                  <span className="bg-rose-100 text-rose-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide">
                    GES Curriculum Alignment
                  </span>
                  <h3 className="font-extrabold text-xl text-slate-800 mt-1.5">
                    Saako Lesson Curriculum Planner
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Streamline lesson plan development aligning standard subjects directly to moral lessons integrated with our faith environment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Setup Panel */}
                <div className="lg:col-span-5 space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                      <select
                        value={selectedLessonSubject}
                        onChange={(e) => setSelectedLessonSubject(e.target.value)}
                        className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700 focus:bg-white"
                      >
                        {GHANA_SUBJECTS.map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Grade Level</label>
                      <select
                        value={selectedLessonGrade}
                        onChange={(e) => setSelectedLessonGrade(e.target.value)}
                        className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700 focus:bg-white"
                      >
                        {AVAILABLE_GRADES_LIST.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Topic / Lesson Unit</label>
                    <input 
                      type="text" 
                      value={lessonTopic}
                      onChange={(e) => setLessonTopic(e.target.value)}
                      placeholder="e.g. Attributes of God"
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Target Duration</label>
                    <input 
                      type="text" 
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(e.target.value)}
                      placeholder="e.g. 60 minutes"
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lesson Specific Objectives</label>
                    <textarea 
                      rows={2}
                      value={lessonObjectives}
                      onChange={(e) => setLessonObjectives(e.target.value)}
                      placeholder="e.g. Pupils will list 3 attributes of Creation"
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateLessonPlan}
                    disabled={isGeneratingLessonPlan || !lessonTopic}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingLessonPlan ? "Drafting Lesson flow..." : "Generate GES Lesson Map"}
                  </button>

                </div>

                {/* Print Ready View Area */}
                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative min-h-[380px] flex flex-col justify-between overflow-x-auto">
                  
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 font-mono text-[10px] text-slate-400">
                      <span>Curriculum Plan Sheet</span>
                      <span>Output Preview</span>
                    </div>

                    {isGeneratingLessonPlan ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-6 h-6 border-2 border-red-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-medium">Drafting outline... Integrating lesson steps and starter activities...</p>
                      </div>
                    ) : lessonPlanOutput ? (
                      <div className="bg-white border rounded-xl p-5 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-700 max-h-[460px] overflow-y-auto shadow-xs">
                        {lessonPlanOutput}
                      </div>
                    ) : (
                      <div className="p-16 text-center text-slate-400 text-xs">
                        Specify the lesson category topics and click draft lesson map. The system compiles GES teaching structures automatically.
                      </div>
                    )}
                  </div>

                  {lessonPlanOutput && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lessonPlanOutput);
                          alert("Detailed GES lesson plan copied to clipboard!");
                        }}
                        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 transition"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-slate-600" />
                        Copy lesson plan text
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* --- REUSABLE MODALS AND DIALOG OVERLAY ELEMENTS --- */}

      {/* Modal 1: Create / Edit Student dialog */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <span className="font-display font-bold text-sm text-amber-500">
                {editingStudent ? "Modify Scholar Details" : "Enroll New Pupil File"}
              </span>
              <button onClick={() => { stopCamera(); setIsStudentModalOpen(false); }} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Full Name of Pupil</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                />
              </div>

              {/* Student Photo Records (Live Camera Integration + File picker fallbacks) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <span className="block font-semibold text-slate-700 text-xs">Student Photo Record Identity</span>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Indicator Box */}
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative group shadow-sm">
                    {studentForm.photo ? (
                      <>
                        <img 
                          src={studentForm.photo} 
                          alt="Student identity" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white font-mono uppercase text-[8px] py-1 font-bold text-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          Reset Photo
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400 p-2">
                        <Camera className="w-6 h-6 mx-auto stroke-1.5 mb-1 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wider block">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls & Integrations */}
                  <div className="flex-1 w-full space-y-2">
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Provide an official photo identity for enrollment archives using either the live built-in camera or manually selecting a document file.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {!cameraActive ? (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-all text-[11px] cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Start Live Camera
                        </button>
                      ) : (
                        <span className="inline-block text-[10px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider animate-pulse">
                          🔴 Camera Active
                        </span>
                      )}

                      <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-705 border border-slate-200 rounded-lg font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer text-[11px]">
                        <Upload className="w-3.5 h-3.5 text-slate-500" /> Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {studentForm.photo && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold transition-all text-[11px]"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Camera Stream Viewer Deck */}
                {cameraActive && (
                  <div className="bg-slate-900 rounded-xl overflow-hidden p-3 border border-slate-805 space-y-2.5 flex flex-col items-center">
                    <div className="relative w-44 h-44 bg-black rounded-lg overflow-hidden border border-slate-800">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover select-none pointer-events-none scale-x-[-1]"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all text-[11px]"
                      >
                        Capture Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition-all text-[11px]"
                      >
                        Cancel Camera
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <p className="text-[10px] bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200 block font-semibold leading-relaxed">
                    ⚠️ {cameraError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Class / Grade Room</label>
                  <select
                    value={studentForm.grade}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    {AVAILABLE_GRADES_LIST.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Guardian / Parent Name</label>
                  <input 
                    type="text" 
                    placeholder="Parent/Guardian Full Name"
                    value={studentForm.guardianName}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, guardianName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Guardian Contact phone</label>
                  <input 
                    type="text" 
                    placeholder="Phone number e.g. +233..."
                    value={studentForm.guardianPhone}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Term Tuition Fee Amount (GH₵)</label>
                  <input 
                    type="number" 
                    value={studentForm.feesTotal}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, feesTotal: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Paid to Date (GH₵)</label>
                  <input 
                    type="number" 
                    value={studentForm.feesPaid}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, feesPaid: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none font-semibold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Conduct Character Evaluation</label>
                <select
                  value={studentForm.behaviorRating}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, behaviorRating: e.target.value as Student['behaviorRating'] }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2.5 shrink-0 border-t border-slate-150">
                <button 
                  type="button" 
                  onClick={() => { stopCamera(); setIsStudentModalOpen(false); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-950 hover:bg-blue-900 font-bold text-white px-5 py-2 rounded-xl transition-all shadow-xs"
                >
                  Save file record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Fees Payment dialog */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-display font-bold text-sm text-emerald-500">Record Fee Installment</span>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                <span className="text-slate-400 block mb-1">Outstanding Balance</span>
                <span className="text-lg font-display font-black text-rose-600">
                  GH₵ {students.find(s => s.id === paymentStudentId) ? (
                    (students.find(s => s.id === paymentStudentId)!.feesTotal) - (students.find(s => s.id === paymentStudentId)!.feesPaid)
                  ) : 0}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Payment Installment Amount (GH₵)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={students.find(s => s.id === paymentStudentId) ? (
                    (students.find(s => s.id === paymentStudentId)!.feesTotal) - (students.find(s => s.id === paymentStudentId)!.feesPaid)
                  ) : 99999}
                  placeholder="Insert payment sum..."
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white outline-none font-bold text-center text-sm text-emerald-700"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="bg-slate-100 px-4 py-2 rounded-xl text-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-xs"
                >
                  Verify Payment Receipt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Faculty Tutor dialog */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-display font-bold text-sm text-amber-500">Add Faculty Mentor File</span>
              <button onClick={() => setIsTeacherModalOpen(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tutor Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mrs. Faustina Gyamfi"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  placeholder="e.g. +233244112233"
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Instruction Classroom Assignment</label>
                <select
                  value={teacherForm.gradeAssigned}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, gradeAssigned: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {AVAILABLE_GRADES_LIST.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Instruction Methods / Specializations (Comma split)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mathematics, R.M.E., Integrated Science"
                  value={teacherForm.subjectsInput}
                  onChange={(e) => setTeacherForm(prev => ({ ...prev, subjectsInput: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="bg-slate-100 px-4 py-2 rounded-xl text-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-950 hover:bg-blue-900 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-xs"
                >
                  Contract Tutor record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add General Announcement notice dialog */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-display font-bold text-sm text-amber-500">Draft General Notice</span>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Notice Headline</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Terminal Exam timetable details"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Category tag</label>
                  <select
                    value={announcementForm.category}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, category: e.target.value as Announcement['category'] }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="General">General</option>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Signatory / Source Author</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Principal Hakeem"
                    value={announcementForm.author}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Notice Details</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Draft announcement details here. Provide complete dates, pricing or required items..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:bg-white outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="bg-slate-100 px-4 py-2 rounded-xl text-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-950 hover:bg-blue-900 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-xs"
                >
                  Publish Notice
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Bulk Attendance Update dialog */}
      {isBulkAttendanceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Clipboard className="w-5 h-5 text-amber-500" />
                <span className="font-display font-bold text-sm text-amber-400 font-display">Bulk Attendance Registrar</span>
              </div>
              <button onClick={() => setIsBulkAttendanceOpen(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Target Pupil Grade Level</label>
                  <select
                    value={bulkAttendanceGrade}
                    onChange={(e) => resetBulkSelectionForGrade(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-blue-800 outline-none"
                  >
                    {AVAILABLE_GRADES_LIST.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Attendance Record Date</label>
                  <input
                    type="date"
                    required
                    value={bulkAttendanceDate}
                    onChange={(e) => setBulkAttendanceDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-blue-800 outline-none"
                  />
                </div>
              </div>

              {/* Feedback messages */}
              {bulkFeedbackMsg && (
                <div className={`p-3 rounded-lg border text-center font-semibold ${
                  bulkFeedbackMsg.includes('Successfully') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {bulkFeedbackMsg}
                </div>
              )}

              {/* Student Selection List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-700">
                    Scholars Directory ({students.filter(s => s.grade === bulkAttendanceGrade).length} in this class)
                  </span>
                  
                  {students.filter(s => s.grade === bulkAttendanceGrade).length > 0 && (
                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-500 font-semibold select-none">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                        checked={
                          students.filter(s => s.grade === bulkAttendanceGrade).length > 0 &&
                          students.filter(s => s.grade === bulkAttendanceGrade).every(s => bulkSelectedStudentIds.includes(s.id))
                        }
                        onChange={(e) => {
                          const classInGrade = students.filter(s => s.grade === bulkAttendanceGrade);
                          if (e.target.checked) {
                            setBulkSelectedStudentIds(classInGrade.map(s => s.id));
                          } else {
                            setBulkSelectedStudentIds([]);
                          }
                        }}
                      />
                      <span>Select All Pupils</span>
                    </label>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50/20">
                  {students.filter(s => s.grade === bulkAttendanceGrade).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium">
                      There are currently no scholars enrolled in {bulkAttendanceGrade}.
                    </div>
                  ) : (
                    students.filter(s => s.grade === bulkAttendanceGrade).map(stud => {
                      const isChecked = bulkSelectedStudentIds.includes(stud.id);
                      return (
                        <div 
                          key={stud.id} 
                          className={`p-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isChecked ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <label className="flex items-center space-x-3 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setBulkSelectedStudentIds(prev => prev.filter(id => id !== stud.id));
                                } else {
                                  setBulkSelectedStudentIds(prev => [...prev, stud.id]);
                                }
                              }}
                              className="rounded border-slate-300 text-blue-900 focus:ring-blue-800 animate-none"
                            />
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">{stud.name}</span>
                              <span className="text-[10px] text-slate-400">Gender: {stud.gender}</span>
                            </div>
                          </label>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-semibold text-slate-400 block">Attendance Rate:</span>
                            <span className={`text-[10px] font-bold ${
                              stud.attendanceRate >= 85 ? 'text-emerald-600' : 'text-amber-600'
                            }`}>{stud.attendanceRate}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bulk Controls */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-slate-500 font-semibold italic text-[10px]">
                  {bulkSelectedStudentIds.length} pupils selected for attendance updates
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkMarkAttendance('Present')}
                    disabled={bulkSelectedStudentIds.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkMarkAttendance('Late')}
                    disabled={bulkSelectedStudentIds.length === 0}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark Late
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkMarkAttendance('Absent')}
                    disabled={bulkSelectedStudentIds.length === 0}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Mark Absent
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                type="button" 
                onClick={() => setIsBulkAttendanceOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 px-5 py-2 rounded-xl text-slate-700 font-semibold transition"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5b: Bulk Grade Entry dialog */}
      {isBulkGradesOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-display font-bold text-sm text-amber-400 font-display">Bulk Subject Score Ledger Registrar</span>
              </div>
              <button 
                onClick={() => setIsBulkGradesOpen(false)} 
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBulkUpdateGrades} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 flex flex-col min-h-0">
              
              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50 shrink-0">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Target Class Grade</label>
                  <select
                    value={bulkGradesGrade}
                    onChange={(e) => resetBulkGradesSelectionForGrade(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-indigo-600 outline-none"
                  >
                    {AVAILABLE_GRADES_LIST.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Academic Subject Unit</label>
                  <select
                    value={bulkGradesSubject}
                    onChange={(e) => setBulkGradesSubject(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-indigo-600 outline-none"
                  >
                    {GHANA_SUBJECTS.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-605 mb-1">Global Mark / Score (0-105)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    placeholder="e.g. 85"
                    value={bulkGradesScore}
                    onChange={(e) => setBulkGradesScore(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-indigo-705 placeholder-slate-350 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Feedback messages */}
              {bulkGradesFeedbackMsg && (
                <div className={`p-3 rounded-lg border text-center font-semibold shrink-0 ${
                  bulkGradesFeedbackMsg.includes('Successfully') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-250 font-bold'
                }`}>
                  {bulkGradesFeedbackMsg}
                </div>
              )}

              {/* Student Selection List */}
              <div className="space-y-2 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                  <span className="font-semibold text-slate-705">
                    Target Scholars ({students.filter(s => s.grade === bulkGradesGrade).length} in this class)
                  </span>
                  
                  {students.filter(s => s.grade === bulkGradesGrade).length > 0 && (
                    <label className="flex items-center space-x-1.5 cursor-pointer text-slate-500 font-semibold select-none">
                      <input 
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-505 shrink-0"
                        checked={
                          students.filter(s => s.grade === bulkGradesGrade).length > 0 &&
                          students.filter(s => s.grade === bulkGradesGrade).every(s => bulkGradesSelectedStudentIds.includes(s.id))
                        }
                        onChange={(e) => {
                          const classInGrade = students.filter(s => s.grade === bulkGradesGrade);
                          if (e.target.checked) {
                            setBulkGradesSelectedStudentIds(classInGrade.map(s => s.id));
                          } else {
                            setBulkGradesSelectedStudentIds([]);
                          }
                        }}
                      />
                      <span>Select All Pupils</span>
                    </label>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-y-auto bg-slate-50/20 flex-1 min-h-0">
                  {students.filter(s => s.grade === bulkGradesGrade).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium">
                      There are currently no scholars enrolled in {bulkGradesGrade}.
                    </div>
                  ) : (
                    students.filter(s => s.grade === bulkGradesGrade).map(stud => {
                      const isChecked = bulkGradesSelectedStudentIds.includes(stud.id);
                      return (
                        <div 
                          key={stud.id} 
                          className={`p-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isChecked ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <label className="flex items-center space-x-3 cursor-pointer flex-1 select-none min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setBulkGradesSelectedStudentIds(prev => prev.filter(id => id !== stud.id));
                                } else {
                                  setBulkGradesSelectedStudentIds(prev => [...prev, stud.id]);
                                }
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-505 shrink-0 animate-none"
                            />
                            
                            {/* Student Miniature Profile Photo */}
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                              {stud.photo ? (
                                <img src={stud.photo} alt={stud.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500 uppercase font-display">
                                  {stud.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 text-xs block truncate">{stud.name}</span>
                              <span className="text-[10px] text-slate-400">Gender: {stud.gender}</span>
                            </div>
                          </label>

                          <div className="text-right shrink-0 ml-2">
                            <span className="text-[10px] font-semibold text-slate-400 block">Current {bulkGradesSubject}:</span>
                            <span className="text-[11px] font-bold text-indigo-605 block bg-slate-100 font-mono px-2 py-0.5 rounded border border-slate-200/60 mt-0.5">
                              {stud.grades[bulkGradesSubject] !== undefined ? `${stud.grades[bulkGradesSubject]}%` : 'No grade'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bulk Controls */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <span className="text-slate-500 font-semibold italic text-[10px]">
                  {bulkGradesSelectedStudentIds.length} pupils selected for grade entry
                </span>

                <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsBulkGradesOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold transition text-[11px] cursor-pointer"
                  >
                    Done / Close
                  </button>
                  <button
                    type="submit"
                    disabled={bulkGradesSelectedStudentIds.length === 0 || !bulkGradesScore}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                  >
                    <Award className="w-3.5 h-3.5" /> Apply Grade Marks
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 5c: Custom Delete Student Confirmation Dialog */}
      {isDeleteConfirmOpen && studentToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-fade-in flex flex-col">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="font-display font-bold text-sm tracking-wide">Withdraw Pupil Master Record</span>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl leading-relaxed text-center font-medium">
                <strong>Attention Required:</strong> You are about to permanently delete this pupil and all cumulative grade ledger statistics from the school database.
              </div>

              {/* Scholar Preview Details Card */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                  {studentToDelete.photo ? (
                    <img src={studentToDelete.photo} alt={studentToDelete.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-slate-500 uppercase font-display">
                      {studentToDelete.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 truncate">{studentToDelete.name}</h4>
                  <p className="text-slate-400 font-medium mt-0.5">Grade Level: <span className="font-semibold text-slate-650">{studentToDelete.grade}</span></p>
                  <p className="text-slate-400 font-medium">Guardian: <span className="text-slate-600">{studentToDelete.guardianName}</span></p>
                </div>
              </div>

              <div className="space-y-1.5 text-center px-2">
                <p className="font-semibold text-slate-600">Are you absolutely sure you want to proceed?</p>
                <p className="text-[10px] text-slate-400 italic">This master data modification cannot be undone. All recorded terminal scores and attendance archives will be wiped.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setStudentToDelete(null);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-705 px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
              >
                No, Keep Record
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Yes, Withdraw Pupil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Printable Terminal Report Card PDF View */}
      {isReportModalOpen && reportStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-0 md:p-6 overflow-y-auto">
          
          {/* Main Layout Card */}
          <div className="bg-slate-900 rounded-none md:rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-800 flex flex-col md:flex-row h-screen md:h-[90vh] overflow-hidden print:bg-white print:border-none print:shadow-none print:h-auto print:static print:w-full print:block">
            
            {/* LEFT BOARD: Administrative Report Card Compiler & Action Panel */}
            <div className="w-full md:w-[35%] bg-slate-950 text-slate-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 shrink-0 overflow-y-auto print:hidden">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
                  <span className="bg-amber-500/20 text-amber-500 p-1.5 rounded-lg border border-amber-500/30">
                    <Award className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-display font-bold text-sm text-amber-500">Document Compiler</h4>
                    <p className="text-[10px] text-slate-400">Saako Progress Report Registry</p>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px] leading-relaxed">
                  <p className="text-slate-300">
                    You are generating a certified <strong>Progress Report Card</strong> for student <strong className="text-slate-100">{reportStudent.name}</strong>.
                  </p>
                  <p className="text-slate-400">
                    You can edit the official Headteacher commentary block directly on the right, or click the AI trigger below to compile an academically integrated behavior analysis text automatically.
                  </p>
                </div>

                {/* AI Compile Button */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Commentary Utility</label>
                  <button
                    type="button"
                    onClick={() => handleCompileReportCommentForStudent(reportStudent)}
                    disabled={isCompilingReportComment}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    {isCompilingReportComment ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin" />
                        <span>Compiling Grades...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span>Regenerate with AI</span>
                      </>
                    )}
                  </button>

                  {/* Feedback messaging */}
                  {reportCommentFeedback && (
                    <div className="p-2.5 rounded-lg text-[10px] text-center font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-fade-in">
                      {reportCommentFeedback}
                    </div>
                  )}

                  {/* Immediate Comment Text Editor */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Manual Editor Pane</span>
                    <textarea
                      value={editableReportComment}
                      onChange={(e) => handleSaveReportComment(reportStudent.id, e.target.value)}
                      placeholder="Type custom terminal commentary..."
                      className="w-full h-32 text-xs bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800 space-y-3 mt-6">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-955 text-xs font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-955" />
                  <span>Print / Save as PDF</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                >
                  Close Progress Files
                </button>
              </div>
            </div>

            {/* RIGHT BOARD: High-Fidelity Certified progress sheet preview */}
            <div className="flex-1 bg-slate-950 md:bg-slate-900/40 p-4 sm:p-8 overflow-y-auto print:bg-white print:p-0 print:m-0 print:w-full print:static print:overflow-visible">
              
              {/* Report Card Page Sheet */}
              <div className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-8 sm:p-12 relative border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:bg-white print:p-0 print:static print:overflow-visible my-0 md:my-4 rounded-xl print:rounded-none">
                
                {/* School Letters / Emblem Letterhead */}
                <div className="text-center space-y-2 border-b-4 border-slate-900 pb-5">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="bg-white p-0.5 rounded-full border border-slate-300 shadow-sm print:border-none print:shadow-none shrink-0 flex items-center justify-center">
                      <SchoolCrest size={68} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-serif font-extrabold uppercase tracking-wide text-slate-950">
                        Saako Holy Child Academy
                      </h2>
                      <p className="text-[10px] sm:text-xs font-serif italic text-slate-600 tracking-wider">
                        "Holiness is our key to disciplined victory & success"
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 space-y-0.5">
                    <p>Sawla District, P.O. Box SW 12, Sawla, Savannah Region, Ghana</p>
                    <p>Primary & Junior High School Board Certified Ledger | Tel: +233 54 502 9200</p>
                  </div>
                </div>

                {/* File Title */}
                <div className="my-5 flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-200/50 print:bg-slate-50 print:border-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SCHOLASTIC PROGRESS REGISTRY</span>
                  <span className="text-[10px] font-bold text-indigo-900 font-mono">Academic Year: 2025/2026 Term: III</span>
                </div>

                {/* Progress metadata grid with Portrait */}
                <div className="flex flex-row gap-6 items-start justify-between border-b border-slate-200 pb-5 mb-5 font-serif">
                  <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-2 text-xs text-left whitespace-nowrap">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Pupil Full Name</span>
                      <p className="font-bold text-slate-950 mt-0.5 text-sm uppercase">{reportStudent.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Level/Grade Assigned</span>
                      <p className="font-bold text-slate-950 mt-0.5 text-sm">{reportStudent.grade}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Attendance index</span>
                      <p className="font-bold text-emerald-600 mt-0.5 text-sm">{reportStudent.attendanceRate}% Present</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">Behavioral conduct</span>
                      <p className="font-bold text-amber-600 mt-0.5 text-sm uppercase">{reportStudent.behaviorRating}</p>
                    </div>
                  </div>

                  {/* Certified Pupil Record Passport Portrait */}
                  <div className="w-20 h-20 rounded-md bg-slate-50 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 relative shadow-xs print:border print:shadow-none">
                    {reportStudent.photo ? (
                      <img src={reportStudent.photo} alt={reportStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-1">
                        <span className="text-[9px] font-sans font-extrabold uppercase text-slate-400 tracking-widest block mb-0.5">Passport</span>
                        <span className="text-[14px] font-bold font-serif text-slate-400 tracking-wide uppercase block">
                          {reportStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance score list card */}
                <div className="space-y-4">
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Academic grading evaluation ledger</span>
                  
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-705">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 border-b border-slate-300 uppercase font-sans">
                        <tr>
                          <th className="p-3">Standard Subjects Code</th>
                          <th className="p-3 text-center">Score mark (%)</th>
                          <th className="p-3 text-center">Verbal Grade</th>
                          <th className="p-3 text-right">Remarks interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-serif text-[11px]">
                        {Object.entries(reportStudent.grades).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400 italic">No grading profiles available for this pupil.</td>
                          </tr>
                        ) : (
                          Object.entries(reportStudent.grades).map(([subject, score]) => {
                            const sVal = score as number;
                            let grade = 'F';
                            let remark = 'Improvement required';
                            if (sVal >= 80) {
                              grade = 'A (Excellent)';
                              remark = 'Exceptional, displays high potential';
                            } else if (sVal >= 70) {
                              grade = 'B (Very Good)';
                              remark = 'Consistent, highly productive work';
                            } else if (sVal >= 60) {
                              grade = 'C (Good)';
                              remark = 'Satisfactory performance logs';
                            } else if (sVal >= 50) {
                              grade = 'D (Credit)';
                              remark = 'Passable, can reinforce study habits';
                            } else {
                              grade = 'F (Needs Focus)';
                              remark = 'Requires intensive tuition focus';
                            }

                            return (
                              <tr key={subject} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-bold text-slate-905 font-sans">{subject}</td>
                                <td className="p-3 text-center font-mono font-bold">{sVal}%</td>
                                <td className="p-3 text-center font-bold text-slate-905">{grade}</td>
                                <td className="p-3 text-right text-slate-600">{remark}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Average summary panel */}
                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs font-serif print:bg-slate-50 print:border-none">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <div className="bg-indigo-950 text-white p-2 rounded-lg font-sans font-extrabold text-[10px]">
                        AVG INDEX: {getStudentGradeAverage(reportStudent)}%
                      </div>
                      <span className="text-slate-500 font-sans text-[10px]">Evaluated across {Object.keys(reportStudent.grades).length} active subjects</span>
                    </div>
                    <div className="font-semibold text-slate-700 font-sans text-[10px] tracking-wide uppercase">
                      Grading Track: <span className="text-indigo-950 font-extrabold">{getStudentGradeAverage(reportStudent) >= 70 ? 'Gold Honors Class' : 'Standard Class'}</span>
                    </div>
                  </div>
                </div>

                {/* Custom feedback column */}
                <div className="mt-6 border-b border-slate-200 pb-5 mb-5 space-y-2">
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Headteacher Terminal Summary Remarks & AI Counselor Evaluation</span>
                  
                  <div className="border border-slate-200 rounded-lg p-5 bg-indigo-50/20 text-xs text-slate-800 leading-relaxed font-serif min-h-24 whitespace-pre-line relative print:border-none print:p-0 print:bg-white text-justify">
                    {editableReportComment ? (
                      editableReportComment
                    ) : (
                      <em className="text-slate-400 text-[10px] uppercase font-sans">
                        No official appraisal is compiled for this student. Use the utility panel to compile a report.
                      </em>
                    )}
                  </div>
                </div>

                {/* Achievements block */}
                {reportStudent.achievements && reportStudent.achievements.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Institutional Medals & Special Commendations</span>
                    <div className="flex flex-wrap gap-2">
                      {reportStudent.achievements.map((ach, ai) => (
                        <span key={ai} className="inline-flex items-center bg-amber-50 text-amber-805 text-[10px] font-bold font-sans border border-amber-200 px-3 py-1 rounded-full space-x-1.5 print:bg-white print:border-slate-300">
                          <span>⭐</span>
                          <span>{ach}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seals and signature blocks */}
                <div className="mt-8 pt-4 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] font-serif border-t border-slate-200">
                  <div className="space-y-6 w-full sm:w-1/3 text-left">
                    <p className="italic text-slate-505 text-[10px]">I have reviewed this performance ledger:</p>
                    <div className="border-t border-slate-400 pt-1 text-center font-bold text-slate-805 font-sans">
                      Class Teacher Signat.
                    </div>
                  </div>

                  {/* Official Approval Crest Seal */}
                  <div className="flex flex-col items-center justify-center space-y-1.5 shrink-0 px-4 print:my-0">
                    <div className="w-16 h-16 border-2 border-dashed border-amber-600 rounded-full flex flex-col items-center justify-center text-[7px] font-extrabold text-amber-750 font-sans uppercase relative select-none rotate-6 opacity-80 border-spacing-2">
                      <span className="tracking-tight">SAAKO</span>
                      <span className="text-[10px]">APPROVED</span>
                      <span className="tracking-tighter">SAWLA GH</span>
                    </div>
                    <span className="text-[8px] text-slate-405 font-sans">Official Institution Seal</span>
                  </div>

                  <div className="space-y-6 w-full sm:w-1/3 text-right font-sans">
                    <p className="italic text-slate-505 text-[10px] text-left font-serif">Confirmed Board Authorized:</p>
                    <div className="border-t border-slate-400 pt-1 text-center font-bold text-slate-805">
                      Headteacher Signature
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- PAGE FOOTER SIGNATURE --- */}
      <footer className="bg-slate-950 text-slate-500 py-6 text-center text-xs border-t border-slate-900 mt-12 print:hidden" id="main-footer">
        <p>© 2026 Saako Holy Child Academy. Sawla Savannah Region Board Approved Portal.</p>
        <p className="mt-2 text-slate-600">"Holiness is our key to disciplined victory & success." Support Direct: +233545029200</p>
      </footer>

    </div>
  );
}
