import {getCookie} from "@/api/User";
const token = getCookie("token");


// ПОЛУЧЕНИЕ ЗАДАЧИ
export default async function fetchTaskDetail(taskId: number) {
    const response = await fetch(`https://trainee-academy.devds.ru/api/task/${taskId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return await response.json()
}

// УДАЛЕНИЕ ЗАДАЧИ
export const taskDelete = async (taskId: number) => {
    return fetch(`https://trainee-academy.devds.ru/api/task/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
}

// Добавление файлов к задаче
export const addTaskFile = async ({taskId, fileId}: {taskId: number, fileId:number}) => {
    return fetch(`https://trainee-academy.devds.ru/api/task/${taskId}/file/${fileId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
}

// Удаление файлов из задачи
export const deleteTaskFile = async ({taskId, fileId}: {taskId:number, fileId:number}) => {
    return fetch(`https://trainee-academy.devds.ru/api/task/${taskId}/file/${fileId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
}