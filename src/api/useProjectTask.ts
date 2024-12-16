import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";
import { TaskResponse } from "../types/Task";

export const fetchProjectTask = async ({
  slug,
  filters,
}: {
  slug: string | string[] | undefined;
  filters?: Record<string, any>; //any конечно лучше не использовать, но тут думаю можно сделать исключение :)
}): Promise<TaskResponse> => {
  const token = getCookie("token");
  const params = new URLSearchParams();

  if (filters) {
    if (filters.name) params.append("filter[name]", filters.name);
    if (filters.user_id) filters.user_id.forEach((id: number) => params.append("filter[user_id][]", id.toString()));
    if (filters.type_id) filters.type_id.forEach((id: number) => params.append("filter[type_id][]", id.toString()));
    if (filters.component) filters.component.forEach((id: number) => params.append("filter[component_id][]", id.toString()));
    if (filters.date_start_from) params.append("filter[date_start_from]", filters.date_start_from);
    if (filters.date_start_to) params.append("filter[date_start_to]", filters.date_start_to);
    if (filters.date_end_from) params.append("filter[date_end_from]", filters.date_end_from);
    if (filters.date_end_to) params.append("filter[date_end_to]", filters.date_end_to);
  }

  const url = `https://trainee-academy.devds.ru/api/project/${slug}/task?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await validateResponse(response);

  const data = await response.json();

  return data;
};
