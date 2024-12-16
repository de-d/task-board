export interface FileItem {
    id: number;
    original_name: string;
    link: string;
    created_at: string;
    updated_at: string;
}

interface Gender {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    position: string;
    is_active: boolean;
    is_admin: boolean;
    is_manager: boolean;
    email: string;
    gender: Gender;
    avatar: { link: string } | null;
    telegram: string;
    created_at: string;
    updated_at: string;
    grade: string | null;
    can_grade: boolean;
    nota_email: string | null;
}

interface File {
    id: number;
    original_name: string;
    link: string;
    created_at: string;
    updated_at: string;
}

export interface Comment {
    id: number;
    content: string;
    files: File[];
    user: User;
    created_at: string;
    updated_at: string;
    editor_version: number;
}
