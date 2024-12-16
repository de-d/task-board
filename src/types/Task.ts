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

export interface TaskResponse {
  data: Task[];
}
