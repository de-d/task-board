import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";
import { ProjectInfo } from "../types/ProjectInfo";

export const fetchProjectInfo = async ({ slug }: { slug: string | string[] | undefined }): Promise<ProjectInfo> => {
  const token = getCookie("token");

  const response = await fetch(`https://trainee-academy.devds.ru/api/project/${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await validateResponse(response);

  const data = await response.json();
  return data.data;
};
