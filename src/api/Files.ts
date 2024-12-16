import { API_URL, token } from "@/constants/constants";
import { FileWithPath } from "@mantine/dropzone";
import { validateResponse } from "./validationResponse";

export const DownloadFiles = async (files: FileWithPath[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("file[]", file);
  });

  return fetch(`${API_URL}/file`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .catch((err) => {
      console.log("DownloadFiles function error", err);
      throw err;
    });
};

interface AttachFileToTask {
  taskId: number;
  fileId: number;
}

export const AttachFileToTask = async ({
  taskId,
  fileId,
}: AttachFileToTask) => {
  return fetch(`${API_URL}/task/${taskId}/file/${fileId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .catch((err) => {
      console.log("AttachFileToTask function error", err);
      throw err;
    });
};
