import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";

interface Component {
  id: number;
  name: string;
  color: string;
}

interface ComponentResponse {
  data: Component[];
}

export const fetchComponents = async (): Promise<ComponentResponse> => {
  const token = getCookie("token");

  const response = await fetch("https://trainee-academy.devds.ru/api/component", {
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
