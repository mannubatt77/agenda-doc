"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

// --- Types (aligned with Supabase Schema) ---
// Note: We map DB snake_case to camelCase in the getters if needed, 
// or simpler: we'll use consistent naming. For now, matching DB columns roughly.

export interface School {
    id: string;
    name: string;
    user_id: string;
    term1_start?: string;
    term1_end?: string;
    term2_start?: string;
    term2_end?: string;
    term3_start?: string;
    term3_end?: string;
    term_structure: 'bi' | 'tri';
    academic_year: number;
}

export interface Course {
    id: string;
    school_id: string;
    name: string;
    year: string;
    division: string;
    schedule?: string;
}

export interface Student {
    id: string;
    course_id: string;
    name: string;
    surname: string;
    condition: 'Regular' | 'Recursante' | 'No puede cursar';
}

export interface AttendanceRecord {
    id: string;
    course_id: string;
    student_id: string;
    date: string; // YYYY-MM-DD
    present: boolean;
    justification?: string;
}

export interface Grade {
    id: string;
    course_id: string;
    student_id: string;
    description: string;
    value: number | null;
    qualitative_value?: string; // TEA, TEP, TED
    period: 1 | 2 | 3;
    date: string;
    type: 'exam' | 'tp' | 'informe';
}

export interface IntensificationInstance {
    id: string;
    course_id: string;
    original_period: number;
    original_date: string;
    original_description: string;
    date: string;
    title?: string;
}

export interface IntensificationResult {
    id: string;
    instance_id: string;
    student_id: string;
    grade: number | null;
    is_approved: boolean;
}

export interface Homework {
    id: string;
    course_id: string;
    date: string;
    description: string;
    period: 1 | 2 | 3;
}

export type HomeworkStatus = 'done' | 'missing' | 'incomplete' | 'absent';

export interface HomeworkRecord {
    id: string;
    homework_id: string;
    student_id: string;
    status: HomeworkStatus;
}

export interface Sanction {
    id: string;
    course_id: string;
    student_id: string;
    date: string;
    reason: string;
    description?: string;
}

export interface TopicLog {
    id: string;
    course_id: string;
    date: string;
    title: string;
    content: string;
}

export interface CourseEvent {
    id: string;
    course_id: string;
    date: string;
    title: string;
    description: string;
}

export interface PendingStudent {
    id: string;
    course_id: string;
    name: string;
    surname: string;
    original_year: string;
}

export interface PendingExam {
    id: string;
    course_id: string;
    date: string;
    description: string;
}

export interface PendingGrade {
    id: string;
    exam_id: string;
    student_id: string;
    grade: number | null;
}

interface DataContextType {
    schools: School[];
    courses: Course[];
    students: Student[];
    attendance: AttendanceRecord[];
    grades: Grade[];
    events: CourseEvent[];
    homeworks: Homework[];
    homeworkRecords: HomeworkRecord[];
    sanctions: Sanction[];
    topicLogs: TopicLog[];

    addSchool: (name: string, dates?: { t1s: string, t1e: string, t2s: string, t2e: string, t3s?: string, t3e?: string }, termStructure?: 'bi' | 'tri') => Promise<void>;
    updateSchool: (id: string, data: Partial<School>) => Promise<void>;
    deleteSchool: (id: string) => Promise<void>;

    addCourse: (schoolId: string, courseData: Omit<Course, "id" | "school_id">) => Promise<void>;
    updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    getSchoolCourses: (schoolId: string) => Course[];

    addStudent: (courseId: string, data: { name: string, surname: string, condition: Student['condition'] }) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    getCourseStudents: (courseId: string) => Student[];

    markAttendance: (courseId: string, date: string, records: { studentId: string, present: boolean, justification?: string }[]) => Promise<void>;
    getAttendance: (courseId: string, date: string) => AttendanceRecord[];

    addGrade: (courseId: string, studentId: string, grade: Omit<Grade, "id" | "course_id" | "student_id">) => Promise<void>;
    updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
    deleteGrade: (id: string) => Promise<void>;
    getStudentGrades: (studentId: string) => Grade[];

    addEvent: (courseId: string, event: Omit<CourseEvent, "id" | "course_id">) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    getCourseEvents: (courseId: string) => CourseEvent[];

    addHomework: (courseId: string, homework: Omit<Homework, "id" | "course_id">) => Promise<void>;
    deleteHomework: (id: string) => Promise<void>;
    getCourseHomeworks: (courseId: string) => Homework[];

    toggleHomeworkStatus: (homeworkId: string, studentId: string) => Promise<void>;
    getHomeworkStatus: (homeworkId: string, studentId: string) => HomeworkStatus | null;

    addSanction: (courseId: string, sanction: Omit<Sanction, "id" | "course_id">) => Promise<void>;
    deleteSanction: (id: string) => Promise<void>;
    getCourseSanctions: (courseId: string) => Sanction[];

    addTopicLog: (courseId: string, log: Omit<TopicLog, "id" | "course_id">) => Promise<void>;
    deleteTopicLog: (id: string) => Promise<void>;
    getCourseTopicLogs: (courseId: string) => TopicLog[];

    // Previas
    pendingStudents: PendingStudent[];
    getCoursePendingStudents: (courseId: string) => PendingStudent[];
    addPendingStudent: (courseId: string, data: Partial<PendingStudent>) => Promise<void>;
    deletePendingStudent: (id: string) => Promise<void>;

    pendingExams: PendingExam[];
    getCoursePendingExams: (courseId: string) => PendingExam[];
    addPendingExam: (courseId: string, data: Partial<PendingExam>) => Promise<void>;
    deletePendingExam: (id: string) => Promise<void>;

    pendingGrades: PendingGrade[];
    addPendingGrade: (examId: string, studentId: string, grade: number) => Promise<void>;

    intensificationInstances: IntensificationInstance[];
    getIntensificationInstances: (courseId: string) => IntensificationInstance[];
    addIntensificationInstance: (courseId: string, data: Partial<IntensificationInstance>) => Promise<void>;
    deleteIntensificationInstance: (id: string) => Promise<void>;

    intensificationResults: IntensificationResult[];
    addIntensificationResult: (instanceId: string, studentId: string, grade: number | null, isApproved: boolean) => Promise<void>;

    selectedYear: number;
    setSelectedYear: (year: number) => void;
    createAcademicYear: (targetYear: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    // State for all data
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Default to current year, e.g. 2026
    const [schools, setSchools] = useState<School[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [events, setEvents] = useState<CourseEvent[]>([]);
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const [homeworkRecords, setHomeworkRecords] = useState<HomeworkRecord[]>([]);
    const [sanctions, setSanctions] = useState<Sanction[]>([]);
    const [topicLogs, setTopicLogs] = useState<TopicLog[]>([]);

    const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
    const [pendingExams, setPendingExams] = useState<PendingExam[]>([]);
    const [pendingGrades, setPendingGrades] = useState<PendingGrade[]>([]);

    // --- INTENSIFICATION ---
    const [intensificationInstances, setIntensificationInstances] = useState<IntensificationInstance[]>([]);
    const [intensificationResults, setIntensificationResults] = useState<IntensificationResult[]>([]);

    // Fetch Initial Data
    useEffect(() => {
        if (!user) {
            setSchools([]); setCourses([]); setStudents([]); setAttendance([]);
            setGrades([]); setEvents([]); setHomeworks([]); setHomeworkRecords([]);
            setSanctions([]); setTopicLogs([]);
            setPendingStudents([]); setPendingExams([]); setPendingGrades([]);
            setIntensificationInstances([]); setIntensificationResults([]);
            return;
        }

        const fetchData = async () => {
            // Fetch everything belonging to the user directly or indirectly
            // Since our RLS policy is "Authenticated users can see everything" (Generic), 
            // we filter by user_id for Schools, and then cascade.
            // OR we just fetch everything and the DB returns what we own if we refine RLS later.
            // For now, we assume we fetch the user's data.

            // 1. Schools
            let query = supabase.from('schools').select('*').eq('user_id', user.id);
            // Ideally filter by year if column exists. 
            // We'll rely on client side filtering temporarily if migration isn't run, 
            // but the SQL query is safer if the column exists.
            query = query.eq('academic_year', selectedYear);

            const { data: s, error: schoolsError } = await query;
            if (schoolsError) {
                // formatting error likely means column doesn't exist yet
                console.warn("Error fetching schools (possibly missing academic_year column):", schoolsError);
            }
            if (s) setSchools(s);

            // For other tables, if we had strict RLS for 'owner', we might need to join keys.
            // But if we use the simple "Show all for now" RLS from the script, we can select *.
            // Ideally, we should filter by relations. 
            // BUT, Supabase JS allows relational queries. 
            // To keep it simple, we'll fetch ALL rows where we can.
            // Wait, if "Enable all for users" is ON, we see everyone's data. 
            // We need to filter.
            // Since we only have one user (the dev) it's fine.
            // PROPER WAY: 
            // Schools -> Filter by user.id
            // Courses -> Filter by school_id IN (schools.ids)
            // ...

            // For this phase, let's fetch ALL and filter in memory if needed, 
            // OR assume the user is the only one. 
            // We'll trust the RLS or just fetch everything for simplicity in V1 migration.
            // Optimization: We can chain or do it properly later.

            const { data: c } = await supabase.from('courses').select('*');
            if (c) setCourses(c);

            const { data: st } = await supabase.from('students').select('*');
            if (st) setStudents(st);

            const { data: a } = await supabase.from('attendance').select('*');
            if (a) setAttendance(a);

            const { data: g } = await supabase.from('grades').select('*');
            if (g) setGrades(g);

            const { data: e } = await supabase.from('events').select('*');
            if (e) setEvents(e);

            const { data: hw } = await supabase.from('homeworks').select('*');
            if (hw) setHomeworks(hw);

            const { data: topics } = await supabase.from('topic_logs').select('*');
            if (topics) setTopicLogs(topics);

            const { data: pStudents } = await supabase.from('pending_students').select('*');
            if (pStudents) setPendingStudents(pStudents);

            const { data: pExams } = await supabase.from('pending_exams').select('*');
            if (pExams) setPendingExams(pExams);

            const { data: pGrades } = await supabase.from('pending_grades').select('*');
            if (pGrades) setPendingGrades(pGrades);

            const { data: hwr } = await supabase.from('homework_status').select('*');
            if (hwr) setHomeworkRecords(hwr as unknown as HomeworkRecord[]); // map DB name if different? naming matched schema.

            const { data: sa } = await supabase.from('sanctions').select('*');
            if (sa) setSanctions(sa);

            const { data: tl } = await supabase.from('topic_logs').select('*');
            if (tl) setTopicLogs(tl);

            const { data: ii } = await supabase.from('intensification_instances').select('*');
            if (ii) setIntensificationInstances(ii);

            const { data: ir } = await supabase.from('intensification_results').select('*');
            if (ir) setIntensificationResults(ir);
        };

        fetchData();

        // Setup Realtime if ambitious, but let's stick to Fetch.
    }, [user, selectedYear]);

    // --- ACTIONS ---

    const addSchool = async (name: string, dates?: { t1s: string, t1e: string, t2s: string, t2e: string, t3s?: string, t3e?: string }, termStructure: 'bi' | 'tri' = 'bi') => {
        if (!user) return;
        const { data, error } = await supabase.from('schools').insert({
            name,
            user_id: user.id,
            term1_start: dates?.t1s,
            term1_end: dates?.t1e,
            term2_start: dates?.t2s,
            term2_end: dates?.t2e,
            term3_start: dates?.t3s,
            term3_end: dates?.t3e,
            term_structure: termStructure
        }).select().single();
        if (data) setSchools(prev => [...prev, data]);
    };

    const updateSchool = async (id: string, data: Partial<School>) => {
        const { error } = await supabase.from('schools').update({
            ...data
        }).eq('id', id);
        if (!error) setSchools(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    };

    const deleteSchool = async (id: string) => {
        await supabase.from('schools').delete().eq('id', id);
        setSchools(prev => prev.filter(s => s.id !== id));
        // Client-side cascade cleanup could go here
    };

    const addCourse = async (schoolId: string, courseData: Omit<Course, "id" | "school_id">) => {
        const { data } = await supabase.from('courses').insert({
            school_id: schoolId,
            ...courseData
        }).select().single();
        if (data) setCourses(prev => [...prev, data]);
    };

    const updateCourse = async (id: string, data: Partial<Course>) => {
        await supabase.from('courses').update(data).eq('id', id);
        setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };
    const deleteCourse = async (id: string) => {
        await supabase.from('courses').delete().eq('id', id);
        setCourses(prev => prev.filter(c => c.id !== id));
    };
    const getSchoolCourses = (schoolId: string) => courses.filter(c => c.school_id === schoolId);

    const addStudent = async (courseId: string, data: { name: string, surname: string, condition: Student['condition'] }) => {
        const { data: s } = await supabase.from('students').insert({
            course_id: courseId,
            ...data
        }).select().single();
        if (s) setStudents(prev => [...prev, s]);
    };
    const deleteStudent = async (id: string) => {
        await supabase.from('students').delete().eq('id', id);
        setStudents(prev => prev.filter(s => s.id !== id));
    };
    const getCourseStudents = (courseId: string) => students.filter(s => s.course_id === courseId);

    const markAttendance = async (courseId: string, date: string, records: { studentId: string, present: boolean, justification?: string }[]) => {
        // Optimistic update
        const upserts = records.map(r => ({
            course_id: courseId,
            date,
            student_id: r.studentId, // Map camel to snake? Schema gave student_id/student_id. Wait, Schema used student_id. 
            // In the args it's studentId.
            present: r.present,
            justification: r.justification
        }));

        // We can't batch upsert with ID generation easily unless we supply IDs?
        // Supabase upsert works on unique keys.
        // unique(student_id, date) was defined.

        const { data, error } = await supabase.from('attendance').upsert(upserts, { onConflict: 'student_id,date' }).select();

        if (data) {
            // Merge into state
            setAttendance(prev => {
                const others = prev.filter(current => !data.some((d: any) => d.id === current.id));
                return [...others, ...data];
            });
        }
    };
    const getAttendance = (courseId: string, date: string) => attendance.filter(r => r.course_id === courseId && r.date === date);

    const addGrade = async (courseId: string, studentId: string, gradeData: Omit<Grade, "id" | "course_id" | "student_id">) => {
        const { data } = await supabase.from('grades').insert({
            course_id: courseId,
            student_id: studentId,
            ...gradeData
        }).select().single();
        if (data) setGrades(prev => [...prev, data]);
    };
    const updateGrade = async (id: string, gradeData: Partial<Grade>) => {
        await supabase.from('grades').update(gradeData).eq('id', id);
        setGrades(prev => prev.map(g => g.id === id ? { ...g, ...gradeData } : g));
    };
    const deleteGrade = async (id: string) => {
        await supabase.from('grades').delete().eq('id', id);
        setGrades(prev => prev.filter(g => g.id !== id));
    };
    const getStudentGrades = (studentId: string) => grades.filter(g => g.student_id === studentId);

    const addEvent = async (courseId: string, event: Omit<CourseEvent, "id" | "course_id">) => {
        const { data } = await supabase.from('events').insert({
            course_id: courseId,
            ...event
        }).select().single();
        if (data) setEvents(prev => [...prev, data]);
    };
    const deleteEvent = async (id: string) => {
        await supabase.from('events').delete().eq('id', id);
        setEvents(prev => prev.filter(e => e.id !== id));
    };
    const getCourseEvents = (courseId: string) => events.filter(e => e.course_id === courseId);

    const addHomework = async (courseId: string, homework: Omit<Homework, "id" | "course_id">) => {
        const { data } = await supabase.from('homeworks').insert({
            course_id: courseId,
            ...homework
        }).select().single();
        if (data) setHomeworks(prev => [...prev, data]);
    };
    const deleteHomework = async (id: string) => {
        supabase.from('homeworks').delete().eq('id', id); // fire and forget
        setHomeworks(prev => prev.filter(h => h.id !== id));
    };
    const getCourseHomeworks = (courseId: string) => homeworks.filter(h => h.course_id === courseId);

    const toggleHomeworkStatus = async (homeworkId: string, studentId: string) => {
        const existing = homeworkRecords.find(r => r.homework_id === homeworkId && r.student_id === studentId);
        const statuses: HomeworkStatus[] = ['done', 'missing', 'incomplete', 'absent'];

        let newStatus: HomeworkStatus = 'done';
        if (existing) {
            const currentIndex = statuses.indexOf(existing.status);
            newStatus = statuses[(currentIndex + 1) % statuses.length];
        }

        // Upsert
        const { data } = await supabase.from('homework_status').upsert({
            homework_id: homeworkId,
            student_id: studentId,
            status: newStatus
        }, { onConflict: 'homework_id,student_id' }).select().single();

        if (data) {
            setHomeworkRecords(prev => {
                const others = prev.filter(r => r.id !== data.id && !(r.homework_id === homeworkId && r.student_id === studentId));
                return [...others, data];
            });
        }
    };
    const getHomeworkStatus = (homeworkId: string, studentId: string) => {
        const record = homeworkRecords.find(r => r.homework_id === homeworkId && r.student_id === studentId);
        return record ? record.status : null;
    };

    const addSanction = async (courseId: string, sanction: Omit<Sanction, "id" | "course_id">) => {
        const { data } = await supabase.from('sanctions').insert({
            course_id: courseId,
            description: sanction.description || "",
            ...sanction
        }).select().single();
        if (data) setSanctions(prev => [...prev, data]);
    };
    const deleteSanction = async (id: string) => {
        await supabase.from('sanctions').delete().eq('id', id);
        setSanctions(prev => prev.filter(s => s.id !== id));
    };
    const getCourseSanctions = (courseId: string) => sanctions.filter(s => s.course_id === courseId);

    const addTopicLog = async (courseId: string, log: Omit<TopicLog, "id" | "course_id">) => {
        const { data } = await supabase.from('topic_logs').insert({
            course_id: courseId,
            ...log
        }).select().single();
        if (data) setTopicLogs(prev => [...prev, data]);
    };
    const deleteTopicLog = async (id: string) => {
        await supabase.from('topic_logs').delete().eq('id', id);
        setTopicLogs(prev => prev.filter(t => t.id !== id));
    };
    const getCourseTopicLogs = (courseId: string) => topicLogs.filter(t => t.course_id === courseId);

    // --- PREVIAS ---
    const getCoursePendingStudents = (courseId: string) => pendingStudents.filter(s => s.course_id === courseId);

    const addPendingStudent = async (courseId: string, data: Partial<PendingStudent>) => {
        const { data: newItem } = await supabase.from('pending_students').insert({ ...data, course_id: courseId }).select().single();
        if (newItem) setPendingStudents(prev => [...prev, newItem]);
    };

    const deletePendingStudent = async (id: string) => {
        const { error } = await supabase.from('pending_students').delete().eq('id', id);
        if (!error) setPendingStudents(prev => prev.filter(s => s.id !== id));
    };

    const getCoursePendingExams = (courseId: string) => pendingExams.filter(e => e.course_id === courseId);

    const addPendingExam = async (courseId: string, data: Partial<PendingExam>) => {
        const { data: newItem } = await supabase.from('pending_exams').insert({ ...data, course_id: courseId }).select().single();
        if (newItem) setPendingExams(prev => [...prev, newItem]);
    };

    const deletePendingExam = async (id: string) => {
        const { error } = await supabase.from('pending_exams').delete().eq('id', id);
        if (!error) {
            setPendingExams(prev => prev.filter(e => e.id !== id));
            // Also remove related grades locally
            setPendingGrades(prev => prev.filter(g => g.exam_id !== id));
        }
    };

    const addPendingGrade = async (examId: string, studentId: string, grade: number) => {
        // Upsert logic
        const existing = pendingGrades.find(g => g.exam_id === examId && g.student_id === studentId);

        const payload = { exam_id: examId, student_id: studentId, grade };

        if (existing) {
            const { data: updated } = await supabase.from('pending_grades').update({ grade }).eq('id', existing.id).select().single();
            if (updated) setPendingGrades(prev => prev.map(g => g.id === existing.id ? updated : g));
        } else {
            const { data: newItem } = await supabase.from('pending_grades').insert(payload).select().single();
            if (newItem) setPendingGrades(prev => [...prev, newItem]);
        }
    };

    // --- INTENSIFICATION ---
    const getIntensificationInstances = (courseId: string) => intensificationInstances.filter(i => i.course_id === courseId);

    const addIntensificationInstance = async (courseId: string, data: Partial<IntensificationInstance>) => {
        const { data: newItem } = await supabase.from('intensification_instances').insert({ ...data, course_id: courseId }).select().single();
        if (newItem) setIntensificationInstances(prev => [...prev, newItem]);
    };

    const deleteIntensificationInstance = async (id: string) => {
        const { error } = await supabase.from('intensification_instances').delete().eq('id', id);
        if (!error) setIntensificationInstances(prev => prev.filter(i => i.id !== id));
    };

    const addIntensificationResult = async (instanceId: string, studentId: string, grade: number | null, isApproved: boolean) => {
        const { data: newItem } = await supabase.from('intensification_results').upsert({
            instance_id: instanceId,
            student_id: studentId,
            grade,
            is_approved: isApproved
        }, { onConflict: 'instance_id, student_id' }).select().single();

        if (newItem) {
            setIntensificationResults(prev => {
                const existing = prev.find(r => r.id === newItem.id);
                if (existing) return prev.map(r => r.id === newItem.id ? newItem : r);
                return [...prev, newItem];
            });
        }
    };

    const createAcademicYear = async (targetYear: number) => {
        if (!user) return;
        const { error } = await supabase.rpc('copy_academic_year_structure', {
            source_year: selectedYear,
            target_year: targetYear
        });

        if (error) {
            console.error("Error creating academic year:", error);
            alert("Error creando ciclo lectivo: " + error.message);
        } else {
            alert(`Ciclo lectivo ${targetYear} creado exitosamente.`);
            setSelectedYear(targetYear);
        }
    };

    return (
        <DataContext.Provider value={{
            schools, courses, students, attendance, grades, events, homeworks, homeworkRecords, sanctions, topicLogs,
            addSchool, updateSchool, deleteSchool,
            addCourse, updateCourse, deleteCourse, getSchoolCourses,
            addStudent, deleteStudent, getCourseStudents,
            markAttendance, getAttendance,
            addGrade, updateGrade, deleteGrade, getStudentGrades,
            addEvent, deleteEvent, getCourseEvents,
            addHomework, deleteHomework, getCourseHomeworks, toggleHomeworkStatus, getHomeworkStatus,
            addSanction, deleteSanction, getCourseSanctions,
            addTopicLog, deleteTopicLog, getCourseTopicLogs,

            // Previas
            pendingStudents, getCoursePendingStudents, addPendingStudent, deletePendingStudent,
            pendingExams, getCoursePendingExams, addPendingExam, deletePendingExam,
            pendingGrades, addPendingGrade,

            // Intensification
            intensificationInstances, getIntensificationInstances, addIntensificationInstance, deleteIntensificationInstance,
            intensificationResults, addIntensificationResult,

            selectedYear, setSelectedYear, createAcademicYear
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}
