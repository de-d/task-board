import { validateResponse } from "./validationResponse";
import { getCookie } from "./User";

interface FavoritePayload {
  id: number;
  type: string;
}

export const toggleFavorite = async (payload: FavoritePayload, isFavorite: boolean): Promise<void> => {
  const token = getCookie("token");

  const method = isFavorite ? "DELETE" : "POST";

  const response = await fetch(`https://trainee-academy.devds.ru/api/favorite`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  await validateResponse(response);

  return response.json();
};
