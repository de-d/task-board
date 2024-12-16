import { validateResponse } from "./validationResponse";

interface Login {
  email: string;
  password: string;
}

export function getCookie(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export const Login = async ({ email, password }: Login): Promise<Response> => {
  return fetch(
    `https://trainee-academy.devds.ru/api/auth/token?email=${email}&password=${password}`,
    {
      method: "POST",
      credentials: "include",
    }
  ).then(validateResponse);
};

export const AuthUser = async (token: string) => {
  return fetch(`https://trainee-academy.devds.ru/api/auth/user`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .then((res) => res.json());
};
