export interface User {
    id: string;
    name: string;
    surname?: string;
    email: string;
    photoUrl?: string;
    studies?: string[];
}

export interface School {
    id: string;
    name: string;
    user_id: string;
}

export interface Course {
    id: string;
    name: string;
    school_id: string;
}

export interface LessonPlan {
    id: string;
    user_id: string;
    course_id: string;
    title: string;
    academic_year: number;
    content_blocks: any;
    created_at: string;
    updated_at: string;
    courses?: Course; // Optional relation join
}
