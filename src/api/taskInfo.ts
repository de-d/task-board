import { validateResponse } from "./validationResponse";
import { createTaskData } from "@/components/CreateTaskForm/CreateTaskForm";
import { API_URL, token } from "@/constants/constants";

export default async function fetchTaskInfo({
  task_id,
}: {
  task_id: string | undefined;
}) {
  const response = await fetch(`${API_URL}/task/${task_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  await validateResponse(response);

  const data = await response.json();
  return data;
}

export const CreateTask = async (data: {
  taskData: createTaskData;
  slug: string;
}) => {
  const { taskData, slug } = data;

  const formData = new FormData();
  Object.entries(taskData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item.toString()));
    } else {
      if (value) {
        formData.append(key, value.toString());
      }
    }
  });

  return fetch(`${API_URL}/project/${slug}/task`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .catch((err) => {
      console.log("CreateTask function error", err);
      throw err;
    });
};

interface EditTask {
  data: createTaskData;
  id: number;
}

export const EditTask = async ({ data, id }: EditTask) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item.toString()));
    } else {
      if (value) {
        formData.append(key, value.toString());
      }
    }
  });

  return fetch(`${API_URL}/task/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .catch((err) => {
      console.log("EditTask function error", err);
      throw err;
    });
};
