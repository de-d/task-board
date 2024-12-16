interface TaskTypeField {
  task_type_id: number;
  fields: string[];
}

interface ProjectComponent {
  id: number;
  name: string;
  color: string;
}

interface ProjectStage {
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
  role: {
    id: number;
    name: string;
  };
  gender: {
    id: number;
    name: string;
  };
  avatar: string | null;
  telegram: string;
  created_at: string;
  updated_at: string;
  grade: string | null;
  can_grade: boolean;
  nota_email: string | null;
}

export interface ProjectInfo {
  id: number;
  name: string;
  slug: string;
  flow: {
    slug: string;
    name: string;
    possibleProjectComponents: ProjectComponent[];
    possibleProjectStages: ProjectStage[];
    projectStagesFilterValues: ProjectStage[];
    task_type_fields_map: TaskTypeField[];
  };
  users: User[];
  logo: string | null;
  created_at: string;
  updated_at: string;
  capabilities: string[];
  perm_user_self_assign: boolean;
  perm_user_create_task: boolean;
  perm_manager_is_admin: boolean;
  is_favorite: boolean;
  is_archived: number;
  project_type: {
    id: number;
    name: string;
  };
  begin: string | null;
  end: string | null;
  estimated_end: string | null;
  project_planning: {
    estimated: number;
    planned: number;
    planned_percent: number;
  };
  project_completion: {
    completed: number;
    estimated: number;
    completed_percent: number;
  };
  project_costs: {
    summary: {
      estimated_h: number;
      fact_h: number;
      estimated_total: number;
      fact_total: number;
      profit: number;
      profitability: number;
    };
    items: {
      role: string | null;
      estimated_h: number;
      fact_h: number;
      rate: number;
      estimated_total: number;
      fact_total: number;
      deviation: number;
      is_overtime: number;
      is_warranty: number;
    }[];
  };
  perm_user_to_rft: boolean;
  wiki_link: string | null;
}

export interface ProjectsResponse {
  data: ProjectInfo[];
}
