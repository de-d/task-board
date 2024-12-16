import { getCookie } from "@/api/User";

export const token = getCookie("token");
export const API_URL = "https://trainee-academy.devds.ru/api";
export const tokeLifeTime = 1000 * 60 * 60 * 5; // 5 часов
