import { z } from "zod";
import { validateResponse } from "./validationResponse";
import { API_URL, token } from "@/constants/constants";

const TaskTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const TaskTypesSchema = z.object({
  data: z.array(TaskTypeSchema),
});

export type TaskTypes = z.infer<typeof TaskTypesSchema>;

const ComponentSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

const ComponentsSchema = z.object({
  data: z.array(ComponentSchema),
});

export type Components = z.infer<typeof ComponentsSchema>;

const PrioritySchema = z.object({
  id: z.number(),
  name: z.string(),
});

const PrioritiesSchema = z.object({
  data: z.array(PrioritySchema),
});
export type Priorities = z.infer<typeof PrioritiesSchema>;

export const getTaskTypes = async () => {
  return fetch(`${API_URL}/task_type`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .then((res) => res.json())
    .then((data) => TaskTypesSchema.parse(data))
    .catch((err) => {
      console.log("getTaskTypes error", err);
      throw err;
    });
};

export const getComponents = async () => {
  return fetch(`${API_URL}/component`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .then((res) => res.json())
    .then((data) => ComponentsSchema.parse(data))
    .catch((err) => {
      console.log("getComponents err", err);
      throw err;
    });
};

export const getPriorities = async () => {
  return fetch(`${API_URL}/priority`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(validateResponse)
    .then((res) => res.json())
    .then((data) => PrioritiesSchema.parse(data))
    .catch((err) => {
      console.log("getPriorities err", err);
      throw err;
    });
};
