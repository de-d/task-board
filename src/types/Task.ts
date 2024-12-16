export interface Task {
  id: number;
  name: string;
  component: number;
  priority: number;
  stage: number;
  task_type: number;
  users: number[];
  epic_name: string;
  possibleTaskNextStages: number[];
  deadline: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  begin: string;
  end: string;
  rank: string;
}

export interface TaskDetailResponse {
  data: TaskDetail;
}

export interface TaskResponse {
  data: Task[];
}

interface Gender {
  id: number;
  name: string;
}

interface User {
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
  avatar: Avatar | null;
  telegram: string;
  created_at: string;
  updated_at: string;
  grade: string | null;
  can_grade: boolean;
  nota_email: string | null;
}

interface Project {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_archived: number;
  begin: string | null;
  end: string | null;
}

interface TaskStage {
  id: number;
  name: string;
}

interface TaskType {
  id: number;
  name: string;
}

interface Priority {
  id: number;
  name: string;
}

interface Component {
  id: number;
  name: string;
  color: string;
}

interface Comment {
  id: number;
  content: string;
  files: any[];
  user: User;
  created_at: string;
  updated_at: string;
  editor_version: number;
}

interface HistoryChange {
  new: any;
  old: any;
  type: string;
}

interface History {
  changes: HistoryChange[];
  updated_at: string;
  updated_by_id: number;
}

interface PossibleTaskNextStage {
  id: number;
  name: string;
}

interface Avatar {
  id: number;
  original_name: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface TaskDetail {
  id: number;
  name: string;
  description: string;
  created_by: User;
  project: Project;
  stage: TaskStage;
  task_type: TaskType;
  priority: Priority;
  component: Component;
  release_by: any[];
  epic_by: any[];
  files: any[];
  comments: Comment[];
  possibleTaskNextStages: PossibleTaskNextStage[];
  estimate_cost: number;
  estimate_worker: number;
  total_logged_time: number;
  users: User[];
  layout_link: string;
  markup_link: string;
  dev_link: string;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  date_start: string;
  date_end: string;
  can_comment: boolean;
  can_attach_file: boolean;
  capabilities: string[];
  begin: string;
  end: string;
  rank: string;
  editor_version: number;
  history: History[];
  work_detail: any[];
  bugs_tracked_time: number;
}
