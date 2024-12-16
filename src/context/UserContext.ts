import { createContext } from "react";

type Role = {
  id: number;
  name: string;
};

type Project = {
  id: number;
  capabilities: string[];
  role: Role;
};

type Gender = {
  id: number;
  name: string;
};

export type User = {
  data: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    position: string;
    is_active: boolean;
    is_admin: boolean;
    is_manager: boolean;
    email: string;
    projects: Project[];
    gender: Gender;
    avatar: string | null;
    telegram: string;
    created_at: string;
    updated_at: string;
    can_grade: boolean;
    nota_email: string | null;
  };
};

export interface userContext {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<userContext>({
  user: null,
  setUser: () => {},
});
