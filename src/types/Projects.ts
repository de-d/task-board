export interface Logo {
  id: number;
  original_name: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface ProjectType {
  id: number;
  name: string;
}

export interface ProjectsInfo {
  id: number;
  name: string;
  slug: string;
  logo: Logo;
  role: Role;
  created_at: string;
  updated_at: string;
  user_count: number;
  project_type: ProjectType;
  begin: string;
  end: string;
  is_archived: number;
  is_favorite: boolean;
}

export type ProjectsResponse = {
  data: ProjectsInfo[];
};
