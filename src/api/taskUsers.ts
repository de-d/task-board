import { validateResponse } from "./validationResponse";
import { UserResponse } from "../types/Users";
import { API_URL, token } from "@/constants/constants";

export const fetchTaskUsers = async ({
  slug,
}: {
  slug: string | string[] | undefined;
}): Promise<UserResponse> => {
  const response = await fetch(`${API_URL}/project/${slug}/user`, {
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
