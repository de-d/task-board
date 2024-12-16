export interface UserGender {
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
  gender: UserGender;
  telegram: string;
  created_at: string;
  updated_at: string;
  grade: string | null;
  can_grade: boolean;
  nota_email: string | null;
}

export interface UserResponse {
  data: User[];
}
