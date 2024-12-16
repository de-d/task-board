import { getCookie } from "@/api/User";
import { TaskDetailResponse } from "@/types/Task";
const token = getCookie("token");

// ПОЛУЧЕНИЕ ЗАДАЧИ
export default async function fetchTaskDetail(
  taskId: number | undefined
): Promise<TaskDetailResponse> {
  const response = await fetch(
    `https://trainee-academy.devds.ru/api/task/${taskId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// УДАЛЕНИЕ ЗАДАЧИ
export const taskDelete = async (taskId: number | undefined) => {
  return fetch(`https://trainee-academy.devds.ru/api/task/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Добавление файлов к задаче
export const addTaskFile = async ({
  taskId,
  fileId,
}: {
  taskId: number | undefined;
  fileId: number | undefined;
}) => {
  return fetch(
    `https://trainee-academy.devds.ru/api/task/${taskId}/file/${fileId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Удаление файлов из задачи
export const deleteTaskFile = async ({
  taskId,
  fileId,
}: {
  taskId: number | undefined;
  fileId: number | undefined;
}) => {
  return fetch(
    `https://trainee-academy.devds.ru/api/task/${taskId}/file/${fileId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
