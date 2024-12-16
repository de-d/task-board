import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";
import { ProjectsResponse } from "../types/Projects";

export const fetchProjects = async (): Promise<ProjectsResponse> => {
  const token = getCookie("token");

  const response = await fetch("https://trainee-academy.devds.ru/api/project", {
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
