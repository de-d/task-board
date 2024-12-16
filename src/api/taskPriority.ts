import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";

interface Priority {
  id: number;
  name: string;
}

interface PriorityResponse {
  data: Priority[];
}

export const fetchTaskPriority = async (): Promise<PriorityResponse> => {
  const token = getCookie("token");

  const response = await fetch("https://trainee-academy.devds.ru/api/priority", {
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
