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
