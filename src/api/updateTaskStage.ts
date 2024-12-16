import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";

export interface updateProps {
  id: number;
  name: string;
  task_type_id: number;
  component_id: number;
  executors: number[];
  priority_id: number;
  stage_id: number;
}

export const updateTaskStage = async ({
  id,
  name,
  task_type_id,
  component_id,
  executors,
  priority_id,
  stage_id,
}: updateProps): Promise<updateProps> => {
  const token = getCookie("token");

  const response = await fetch(`https://trainee-academy.devds.ru/api/task/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, task_type_id, component_id, executors, priority_id, stage_id }),
  });

  await validateResponse(response);

  const data = await response.json();
  return data;
};
