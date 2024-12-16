import {getCookie} from "@/api/User";

const token = getCookie("token");


// ДОБАВИТЬ КОММЕНАРИЙ
export const addComments = async ({ formData, taskId }: { formData: FormData; taskId: number | undefined }) => {

    return fetch(`https://trainee-academy.devds.ru/api/task/${taskId}/comment`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    })
}

// ЗАГРУЗИТЬ ФАЙЛ В КОММЕНТАРИЙ
export const addFileComments = async (formData:FormData) => {
    return fetch('https://trainee-academy.devds.ru/api/file', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    })
}

// УДАЛИТЬ ФАЙЛ ИЗ КОММЕНТАРИЯ
export const deleteFileComments = async ({commentId, fileId}: {commentId:number | undefined, fileId:number | undefined}) => {
    return fetch(`https://trainee-academy.devds.ru/api/comment/${commentId}/file/${fileId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
}

//ОБНОВИТЬ КОММЕНТАРИЙ
export const commentUpdate = async ({commentId, formData}: {commentId:number, formData:FormData}) => {
    return fetch(`https://trainee-academy.devds.ru/api/comment/${commentId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData
    })
}


// УДАЛИТЬ КОММЕНТАРИЙ
export const deleteComments = async (commentId: number) => {
    return fetch(`https://trainee-academy.devds.ru/api/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
}