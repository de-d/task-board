import styles from "./TaskDetail.module.scss";
import { FileItem } from "@/types/TaskDetail";
import { useQuery } from "@tanstack/react-query";
import fetchTaskDetail, { addTaskFile, deleteTaskFile, taskDelete } from "@/api/TaskDetail";
import { DropzoneButton } from "@/components/DropZone/DropZone";
import TextEditor from "@/components/TextEditor/TextEditor";
import Select from "@/components/Select/Select";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { addComments, addFileComments, commentUpdate, deleteComments, deleteFileComments } from "@/api/Comments";
import classes from "@/components/DropZone/DropzoneButton.module.css";
import { useContext } from "react";
import { UserContext, userContext } from "@/context/UserContext";
import { useRouter } from "next/router";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { CreateTaskForm } from "../CreateTaskForm/CreateTaskForm";

type TaskDetailProps = {
  taskId: number | undefined;
  setOpenModal?: React.Dispatch<React.SetStateAction<boolean>>;
  modal: boolean;
};

export default function TaskDetail({ taskId, setOpenModal, modal }: TaskDetailProps) {
  const router = useRouter();

  const closeModal = () => {
    if (setOpenModal) {
      setOpenModal(false);
    }
  };

  const { user } = useContext<userContext>(UserContext);
  const isAdmin = user?.data.is_admin;

  const allowedExtensions = [".jpeg", ".png", ".jpg", ".webp"];
  const queryClient = useQueryClient();

  // Модальное окно для удаления задачи
  const [isModalOpen, setModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null | undefined>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [confirmationOpened, setConfirmationOpened] = useState(false);

  // ВСЕ ДАННЫЕ ЗАДАЧИ
  const { data: taskDetail, isLoading } = useQuery({
    queryKey: ["taskDetail", taskId],
    queryFn: () => fetchTaskDetail(taskId),
    // select: (data) => data.data
  });

  // УДАЛЕНИЕ ЗАДАЧИ
  const { mutate: deleteTask } = useMutation({
    mutationFn: taskDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
      queryClient.invalidateQueries({ queryKey: ["projectTask"] });
      closeModal();
      if (modal) {
        router.back();
      } else {
        router.push("/projects");
      }
    },
  });

  const handleDeleteClick = (taskId: number | undefined) => {
    setTaskToDelete(taskId);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setTaskToDelete(null);
  };

  // ДОБАВЛЕНИЕ ФАЙЛА К ЗАДАЧЕ
  const [filesZone1, setFilesZone1] = useState<File[]>([]);

  useEffect(() => {
    // Если в filesZone1 добавлены файлы, вызываем addTaskFile
    if (filesZone1.length > 0) {
      submitTaskFile();
    }
  }, [filesZone1]);

  const { mutateAsync: addFileTask } = useMutation({
    mutationFn: addTaskFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
      setFilesZone1([]);
    },
  });

  //Удаление файла из задачи
  const { mutateAsync: deleteFileTask } = useMutation({
    mutationFn: deleteTaskFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
    },
  });

  // ДОБАВЛЕНИЕ КОММЕНТАРИЯ
  const { mutateAsync: commentSubmit } = useMutation({
    mutationFn: ({ formData, taskId }: { formData: FormData; taskId: number | undefined }) => addComments({ formData, taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
      setFilesComments([]);
      setContent("");
    },
  });

  // ЗАГРУЗКА ФАЙЛОВ НА СЕРВЕР
  const { mutateAsync: fileComments } = useMutation({
    mutationFn: addFileComments,
  });

  // Обновление комментария
  const { mutateAsync: updateComments } = useMutation({
    mutationFn: commentUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
      setOpenEditComment(false);
      setEditingCommentId(null);
      setEditCommentFiles([]);
    },
  });

  // УДАЛЕНИЕ КОММЕНТАРИЯ
  const { mutate: deleteComment } = useMutation({
    mutationFn: deleteComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
    },
  });

  // УДАЛЕНИЕ ФАЙЛА ИЗ КОММЕНТАРИЯ
  const { mutate: fileDelete } = useMutation({
    mutationFn: deleteFileComments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskDetail"] });
    },
  });

  // Файл в комментарии
  const [filesComment, setFilesComments] = useState<File[]>([]);
  const [editCommentFiles, setEditCommentFiles] = useState<File[]>([]);

  // Редактирование комментария
  const [openEditComment, setOpenEditComment] = useState<boolean>(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  const [content, setContent] = useState<string>("");
  const [selectValue, setSelectValue] = useState(taskDetail?.data.stage.name);

  // ДОБАВЛЕНИЕ ФАЙЛА К ЗАДАЧЕ
  async function submitTaskFile() {
    try {
      const fileFormData = new FormData();

      // ПРОВЕРКА ЕСТЬ ЛИ ФАЙЛЫ
      if (filesZone1.length > 0) {
        filesZone1.forEach((file, index) => {
          fileFormData.append(`file[${index}]`, file);
        });

        // ОТПРАВКА ФАЙЛА И ПОЛУЧЕНИЕ ОТВЕТА
        const fileResponse = await fileComments(fileFormData);
        const uploadedFiles = await fileResponse.json();
        uploadedFiles.data.forEach((file: { id: number | undefined }) => {
          addFileTask({ taskId: taskDetail?.data.id, fileId: file.id });
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ОТПРАВЛЕНИЕ ФОРМЫ С КОММЕНАТРИЕМ
  async function createComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const fileFormData = new FormData();
      const formData = new FormData();
      formData.append("content", content);

      // ПРОВЕРКА ЕСТЬ ЛИ ФАЙЛЫ
      if (filesComment.length > 0) {
        filesComment.forEach((file, index) => {
          fileFormData.append(`file[${index}]`, file);
        });

        // ОТПРАВКА ФАЙЛА И ПОЛУЧЕНИЕ ОТВЕТА
        const fileResponse = await fileComments(fileFormData);
        const uploadedFiles = await fileResponse.json();
        const filesArray = uploadedFiles.data;
        const filesIds = filesArray.map((file: { id: number }) => file.id);

        // Добавляем ID файлов в formData
        filesIds.forEach((fileId: number, index: number) => {
          formData.append(`files[${index}]`, String(fileId));
        });
      }

      // ОТПРАВКА КОММЕНТАРИЯ
      await commentSubmit({ formData, taskId: taskDetail?.data.id });
    } catch (error) {
      console.log(error);
    }
  }

  // Обновление комментария
  async function updateComment(e: React.FormEvent<HTMLFormElement>, commentId: number) {
    e.preventDefault();

    try {
      const fileFormData = new FormData();
      const formData = new FormData();
      formData.append("content", content);

      // ПРОВЕРКА ЕСТЬ ЛИ ФАЙЛЫ
      if (editCommentFiles.length > 0) {
        editCommentFiles.forEach((file, index) => {
          fileFormData.append(`file[${index}]`, file);
        });

        // ОТПРАВКА ФАЙЛА И ПОЛУЧЕНИЕ ОТВЕТА
        const fileResponse = await fileComments(fileFormData);
        const uploadedFiles = await fileResponse.json();
        const filesArray = uploadedFiles.data;
        const filesIds = filesArray.map((file: { id: number }) => file.id);

        // Добавляем ID файлов в formData
        filesIds.forEach((fileId: number, index: number) => {
          formData.append(`files[${index}]`, String(fileId));
        });
      }

      // ОТПРАВКА КОММЕНТАРИЯ
      await updateComments({ formData, commentId });
    } catch (error) {
      console.log(error);
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Загрузка</div>;
  }

  return (
    <>
      <div className={`${modal ? styles.taskDetailModal : styles.taskDetailPages}`} onClick={closeModal}>
        <Modal
          title="Редактировать задачу"
          size={936}
          yOffset="0"
          opened={opened}
          onClose={close}
          onClick={() => {
            open();
            setConfirmationOpened(true);
          }}
          centered
          styles={{
            title: { fontSize: "22px", fontWeight: "600" },
            content: {
              padding: "16px 24px",
              height: "100%",
              borderRadius: "16px",
            },
            header: { padding: 0 },
            body: { padding: 0 },
          }}
        >
          <CreateTaskForm setConfirmationOpened={setConfirmationOpened} taskDetail={taskDetail} />
        </Modal>

        <Modal
          opened={confirmationOpened}
          onClose={() => setConfirmationOpened(false)}
          title="Закрыть окно?"
          centered
          classNames={{
            content: styles.root,
            title: styles.title,
            header: styles.header,
          }}
        >
          <div>
            <button
              className={styles.add}
              onClick={() => {
                setConfirmationOpened(false);
                close();
              }}
            >
              Да
            </button>
            <button className={styles.cancel} onClick={() => setConfirmationOpened(false)}>
              Нет
            </button>
          </div>
        </Modal>

        <div className={`${modal ? styles.taskContentModal : styles.taskContentPages}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.left_panel}>
            <div className={styles.content}>
              <div className={styles.task_name}>
                {taskDetail?.data.name && <div>{taskDetail?.data.name}</div>}
                <div>
                  <svg className={styles.task_icon} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="4" fill="#F4F6F8" />
                    <path
                      d="M15.3637 18.7274L16.4578 17.619C15.614 17.5475 15.0062 17.2686 14.57 16.8324C13.3615 15.6239 13.3615 13.9148 14.5628 12.7205L16.937 10.3393C18.1455 9.1379 19.8474 9.13075 21.0559 10.3393C22.2716 11.5549 22.2573 13.2569 21.0631 14.4582L19.8474 15.6668C20.0762 16.1959 20.1549 16.8395 20.0262 17.3973L22.0714 15.3593C23.8305 13.6073 23.8377 11.1044 22.0642 9.33098C20.2836 7.55038 17.7951 7.56468 16.0359 9.32383L13.5474 11.8124C11.7882 13.5715 11.7811 16.0672 13.5545 17.8407C13.9693 18.2626 14.5414 18.5772 15.3637 18.7274ZM16.0288 12.6848L14.9347 13.7932C15.7785 13.8719 16.3863 14.1436 16.8225 14.5798C18.0382 15.7883 18.0311 17.4974 16.8297 18.6988L14.4556 21.0729C13.247 22.2814 11.5451 22.2814 10.3437 21.0729C9.12807 19.8572 9.13522 18.1625 10.3366 16.9611L11.5451 15.7454C11.3163 15.2234 11.2448 14.5798 11.3663 14.0149L9.32115 16.0601C7.562 17.8121 7.55485 20.3078 9.3283 22.0812C11.1089 23.8618 13.5974 23.8475 15.3566 22.0955L17.8451 19.5998C19.6043 17.8407 19.6114 15.345 17.838 13.5715C17.4232 13.1568 16.8583 12.8421 16.0288 12.6848Z"
                      fill="#ABBED1"
                    />
                  </svg>
                </div>
              </div>

              {taskDetail?.data.description && (
                <div className={styles.task_descriptions}>
                  <span>{taskDetail?.data.description}</span>
                </div>
              )}
              <div className={styles.task_descriptions}>
                <span>{taskDetail?.data.description}</span>
              </div>

              <DropzoneButton preview={false} files={filesZone1} setFiles={setFilesZone1} />

              <div className={styles.previewContainer}>
                {taskDetail!.data.files.length > 0 &&
                  taskDetail?.data.files.map((file: FileItem) => (
                    <div key={file.id} className={styles.previewItem}>
                      <div
                        className={styles.deletion}
                        onClick={() =>
                          deleteFileTask({
                            taskId: taskDetail?.data.id,
                            fileId: file.id,
                          })
                        }
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.4175 5.4136H4.58254L5.15513 15.593C5.18592 16.1405 5.20647 16.4925 5.24301 16.76C5.2779 17.0154 5.31805 17.1104 5.3448 17.1582C5.44425 17.3357 5.5955 17.4787 5.77835 17.568C5.82754 17.5921 5.92467 17.6268 6.18166 17.6473C6.45076 17.6688 6.80339 17.6695 7.35166 17.6695H12.6484C13.1966 17.6695 13.5493 17.6688 13.8184 17.6473C14.0753 17.6268 14.1725 17.5921 14.2217 17.568C14.4045 17.4787 14.5558 17.3357 14.6552 17.1582C14.682 17.1104 14.7221 17.0154 14.757 16.76C14.7936 16.4925 14.8141 16.1405 14.8449 15.593L15.4175 5.4136ZM16.4839 4.2609L16.4839 4.26084H15.4823H13.3123C13.2231 3.58836 13.1468 3.20131 12.956 2.89585C12.7503 2.5664 12.453 2.304 12.1006 2.14068C11.7006 1.95532 11.2005 1.95532 10.2004 1.95532L9.79853 1.95532C8.79839 1.95532 8.29832 1.95532 7.8983 2.14068C7.54587 2.304 7.24863 2.5664 7.04286 2.89585C6.85208 3.20131 6.77576 3.58836 6.68658 4.26084H4.51769H3.51611L3.51612 4.2609H2.50799C2.18968 4.2609 1.93164 4.51894 1.93164 4.83725C1.93164 5.15556 2.18968 5.4136 2.50799 5.4136H3.58096L4.15671 15.6492C4.21649 16.712 4.24639 17.2435 4.47233 17.6468C4.67123 18.0019 4.97373 18.2879 5.33945 18.4666C5.7549 18.6695 6.28715 18.6695 7.35166 18.6695H12.6484C13.7129 18.6695 14.2451 18.6695 14.6606 18.4666C15.0263 18.2879 15.3288 18.0019 15.5277 17.6468C15.7536 17.2435 15.7835 16.712 15.8433 15.6492L16.4191 5.4136H17.493C17.8113 5.4136 18.0693 5.15556 18.0693 4.83725C18.0693 4.51894 17.8113 4.2609 17.493 4.2609H16.4839ZM12.2271 3.79527C12.2534 3.92421 12.2773 4.0745 12.3032 4.26084H7.69573C7.72156 4.0745 7.74544 3.92421 7.77177 3.79527C7.81997 3.55921 7.86264 3.47104 7.89102 3.42559C7.99391 3.26086 8.14253 3.12966 8.31875 3.048C8.36737 3.02547 8.46015 2.99407 8.70036 2.97552C8.953 2.95601 9.28305 2.95532 9.79853 2.95532L10.2004 2.95532C10.7158 2.95532 11.0459 2.95601 11.2985 2.97552C11.5387 2.99407 11.6315 3.02547 11.6801 3.048C11.8564 3.12966 12.005 3.26086 12.1079 3.42559C12.1362 3.47104 12.1789 3.55921 12.2271 3.79527ZM7.61719 7.14253C7.61719 6.86638 7.39333 6.64253 7.11719 6.64253C6.84104 6.64253 6.61719 6.86638 6.61719 7.14253V15.7877C6.61719 16.0639 6.84104 16.2877 7.11719 16.2877C7.39333 16.2877 7.61719 16.0639 7.61719 15.7877L7.61719 7.14253ZM10.5005 7.14253C10.5005 6.86638 10.2766 6.64253 10.0005 6.64253C9.72435 6.64253 9.50049 6.86638 9.50049 7.14253L9.50049 15.7877C9.50049 16.0639 9.72435 16.2877 10.0005 16.2877C10.2766 16.2877 10.5005 16.0639 10.5005 15.7877V7.14253ZM12.8813 6.64253C13.1575 6.64253 13.3813 6.86638 13.3813 7.14253V15.7877C13.3813 16.0639 13.1575 16.2877 12.8813 16.2877C12.6052 16.2877 12.3813 16.0639 12.3813 15.7877V7.14253C12.3813 6.86638 12.6052 6.64253 12.8813 6.64253Z"
                            fill="#ABBED1"
                          />
                        </svg>
                      </div>
                      {allowedExtensions.some((ext) => file.link.endsWith(ext)) ? (
                        <div className={styles.previewImage}>
                          <Image src={`https://trainee-academy.devds.ru/${file.link}`} alt={`preview-${file.id}`} />
                        </div>
                      ) : (
                        <div className={classes.filesImage}>
                          <svg
                            className={styles.task_icon}
                            width="180"
                            height="75"
                            viewBox="0 0 53 67"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.057 67H42.943C49.5757 67 53 63.5062 53 56.8279V29.156H29.8626C26.0064 29.156 24.1554 27.3009 24.1554 23.4361V0H10.057C3.45518 0 0 3.49377 0 10.203V56.8279C0 63.5062 3.45518 67 10.057 67ZM30.4488 24.6419H52.6915C52.5064 23.2197 51.4884 21.8902 49.8842 20.2515L33.0093 3.12275C31.4668 1.54592 30.0786 0.494693 28.6595 0.309183V22.8486C28.6903 24.0545 29.2765 24.6419 30.4488 24.6419ZM14.5303 42.8528C13.2037 42.8528 12.2474 41.8943 12.2474 40.6576C12.2474 39.4209 13.2037 38.4624 14.5303 38.4624H38.5623C39.8271 38.4624 40.8143 39.4209 40.8143 40.6576C40.8143 41.8943 39.8271 42.8528 38.5623 42.8528H14.5303ZM14.5303 54.4472C13.2037 54.4472 12.2474 53.4887 12.2474 52.252C12.2474 51.0152 13.2037 50.0568 14.5303 50.0568H38.5623C39.8271 50.0568 40.8143 51.0152 40.8143 52.252C40.8143 53.4887 39.8271 54.4472 38.5623 54.4472H14.5303Z"
                              fill="#F4F6F8"
                            />
                          </svg>
                        </div>
                      )}
                      <div className={styles.ImageInfo}>
                        <a href={`https://trainee-academy.devds.ru/${file.link}`}>{file.original_name}</a>
                      </div>
                    </div>
                  ))}
              </div>

              <div className={styles.comments_title}>
                <span>Комментарий</span>
              </div>

              <form onSubmit={createComment} className={styles.comments}>
                <TextEditor content={content} setContent={setContent} />
                <DropzoneButton files={filesComment} setFiles={setFilesComments} />
                <button type="submit" className={styles.comments_button}>
                  Отправить
                </button>
              </form>

              <div className={styles.comments_area}>
                {taskDetail?.data.comments &&
                  taskDetail?.data.comments.length > 0 &&
                  taskDetail?.data.comments.map((comments) => (
                    <div key={comments.id} className={styles.comments_content}>
                      <div className={styles.user}>
                        <div className={styles.userinfo}>
                          {comments.user.avatar ? (
                            <Image
                              width={100}
                              height={100}
                              className={styles.avatar}
                              src={`https://trainee-academy.devds.ru/${comments.user.avatar.link}`}
                              alt="avatar"
                            />
                          ) : (
                            <Image width={100} height={100} className={styles.avatar} src={"/img/task/default_user.png"} alt="avatar" />
                          )}
                          <div>
                            <div className={styles.username}>
                              <span>
                                {comments.user.name} {comments.user.surname}
                              </span>
                            </div>
                            <div className={styles.commentsdate}>
                              <span>{format(new Date(comments.created_at), "dd.MM.yyyy")}</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.user_button}>
                          {editingCommentId !== comments.id && (
                            <>
                              {(isAdmin || user?.data?.id === comments?.user?.id) && (
                                <svg
                                  onClick={() => {
                                    setOpenEditComment(true);
                                    setEditingCommentId(comments.id);
                                  }}
                                  className={styles.task_icon}
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M17.8131 3.70723L18.4879 3.0357C18.8222 2.69993 18.8345 2.33308 18.5312 2.02219L18.2898 1.77347C17.9865 1.4688 17.6088 1.49989 17.2807 1.82943L16.606 2.49474L17.8131 3.70723ZM10.2299 11.3117L17.2188 4.29171L16.0179 3.09166L9.02891 10.0992L8.42225 11.5666C8.35415 11.7532 8.54605 11.9583 8.73177 11.8899L10.2299 11.3117Z"
                                    fill="#ABBED1"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M14.0646 3.03979H4.5C3.39543 3.03979 2.5 3.93522 2.5 5.03979V15.8125C2.5 16.9171 3.39543 17.8125 4.5 17.8125H15.2727C16.3773 17.8125 17.2727 16.9171 17.2727 15.8125V6.09921L16.2727 7.09921V15.8125C16.2727 16.3648 15.825 16.8125 15.2727 16.8125H4.5C3.94772 16.8125 3.5 16.3648 3.5 15.8125V5.03979C3.5 4.48751 3.94771 4.03979 4.5 4.03979H13.0646L14.0646 3.03979Z"
                                    fill="#ABBED1"
                                  />
                                </svg>
                              )}

                              <svg
                                className={styles.task_icon}
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16.6864 18.7345H7.40605C6.27712 18.7345 5.35892 17.8163 5.35892 16.6874V7.40703C5.35892 6.2781 6.27712 5.35989 7.40605 5.35989H16.6864C17.8153 5.35989 18.7335 6.2781 18.7335 7.40703V16.6874C18.7335 17.8163 17.8153 18.7345 16.6864 18.7345ZM7.40605 6.72465C7.02979 6.72465 6.72367 7.03076 6.72367 7.40703V16.6874C6.72367 17.0636 7.02979 17.3697 7.40605 17.3697H16.6864C17.0627 17.3697 17.3688 17.0636 17.3688 16.6874V7.40703C17.3688 7.03076 17.0627 6.72465 16.6864 6.72465H7.40605ZM3.99416 13.2755H3.31178C2.93552 13.2755 2.6294 12.9694 2.6294 12.5931V3.31276C2.6294 2.9365 2.93552 2.63038 3.31178 2.63038H12.5921C12.9684 2.63038 13.2745 2.9365 13.2745 3.31276V3.96102H14.6393V3.31276C14.6393 2.18383 13.721 1.26562 12.5921 1.26562H3.31178C2.18286 1.26562 1.26465 2.18383 1.26465 3.31276V12.5931C1.26465 13.722 2.18286 14.6402 3.31178 14.6402H3.99416V13.2755Z"
                                  fill="#ABBED1"
                                />
                              </svg>
                              <svg
                                onClick={() => deleteComment(comments.id)}
                                className={styles.task_icon}
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.4175 5.4136H4.58254L5.15513 15.593C5.18592 16.1405 5.20647 16.4925 5.24301 16.76C5.2779 17.0154 5.31805 17.1104 5.3448 17.1582C5.44425 17.3357 5.5955 17.4787 5.77835 17.568C5.82754 17.5921 5.92467 17.6268 6.18166 17.6473C6.45076 17.6688 6.80339 17.6695 7.35166 17.6695H12.6484C13.1966 17.6695 13.5493 17.6688 13.8184 17.6473C14.0753 17.6268 14.1725 17.5921 14.2217 17.568C14.4045 17.4787 14.5558 17.3357 14.6552 17.1582C14.682 17.1104 14.7221 17.0154 14.757 16.76C14.7936 16.4925 14.8141 16.1405 14.8449 15.593L15.4175 5.4136ZM16.4839 4.2609L16.4839 4.26084H15.4823H13.3123C13.2231 3.58836 13.1468 3.20131 12.956 2.89585C12.7503 2.5664 12.453 2.304 12.1006 2.14068C11.7006 1.95532 11.2005 1.95532 10.2004 1.95532L9.79853 1.95532C8.79839 1.95532 8.29832 1.95532 7.8983 2.14068C7.54587 2.304 7.24863 2.5664 7.04286 2.89585C6.85208 3.20131 6.77576 3.58836 6.68658 4.26084H4.51769H3.51611L3.51612 4.2609H2.50799C2.18968 4.2609 1.93164 4.51894 1.93164 4.83725C1.93164 5.15556 2.18968 5.4136 2.50799 5.4136H3.58096L4.15671 15.6492C4.21649 16.712 4.24639 17.2435 4.47233 17.6468C4.67123 18.0019 4.97373 18.2879 5.33945 18.4666C5.7549 18.6695 6.28715 18.6695 7.35166 18.6695H12.6484C13.7129 18.6695 14.2451 18.6695 14.6606 18.4666C15.0263 18.2879 15.3288 18.0019 15.5277 17.6468C15.7536 17.2435 15.7835 16.712 15.8433 15.6492L16.4191 5.4136H17.493C17.8113 5.4136 18.0693 5.15556 18.0693 4.83725C18.0693 4.51894 17.8113 4.2609 17.493 4.2609H16.4839ZM12.2271 3.79527C12.2534 3.92421 12.2773 4.0745 12.3032 4.26084H7.69573C7.72156 4.0745 7.74544 3.92421 7.77177 3.79527C7.81997 3.55921 7.86264 3.47104 7.89102 3.42559C7.99391 3.26086 8.14253 3.12966 8.31875 3.048C8.36737 3.02547 8.46015 2.99407 8.70036 2.97552C8.953 2.95601 9.28305 2.95532 9.79853 2.95532L10.2004 2.95532C10.7158 2.95532 11.0459 2.95601 11.2985 2.97552C11.5387 2.99407 11.6315 3.02547 11.6801 3.048C11.8564 3.12966 12.005 3.26086 12.1079 3.42559C12.1362 3.47104 12.1789 3.55921 12.2271 3.79527ZM7.61719 7.14253C7.61719 6.86638 7.39333 6.64253 7.11719 6.64253C6.84104 6.64253 6.61719 6.86638 6.61719 7.14253V15.7877C6.61719 16.0639 6.84104 16.2877 7.11719 16.2877C7.39333 16.2877 7.61719 16.0639 7.61719 15.7877L7.61719 7.14253ZM10.5005 7.14253C10.5005 6.86638 10.2766 6.64253 10.0005 6.64253C9.72435 6.64253 9.50049 6.86638 9.50049 7.14253L9.50049 15.7877C9.50049 16.0639 9.72435 16.2877 10.0005 16.2877C10.2766 16.2877 10.5005 16.0639 10.5005 15.7877V7.14253ZM12.8813 6.64253C13.1575 6.64253 13.3813 6.86638 13.3813 7.14253V15.7877C13.3813 16.0639 13.1575 16.2877 12.8813 16.2877C12.6052 16.2877 12.3813 16.0639 12.3813 15.7877V7.14253C12.3813 6.86638 12.6052 6.64253 12.8813 6.64253Z"
                                  fill="#ABBED1"
                                />
                              </svg>
                            </>
                          )}
                          {openEditComment && editingCommentId === comments.id && (
                            <div className={styles.editCross}>
                              <svg
                                onClick={() => {
                                  setOpenEditComment(false);
                                  setEditingCommentId(null);
                                }}
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M18 6L6 18" stroke="#ABBED1" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M6 6L18 18" stroke="#ABBED1" stroke-linecap="round" stroke-linejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      {openEditComment && editingCommentId === comments.id ? (
                        <form onSubmit={(e) => updateComment(e, comments.id)} className={styles.comments}>
                          <TextEditor content={comments.content} setContent={setContent} />
                          <DropzoneButton files={editCommentFiles} setFiles={setEditCommentFiles} />
                          <button type="submit" className={styles.comments_button}>
                            Сохранить
                          </button>
                        </form>
                      ) : (
                        <div className={styles.comments_text}>{comments.content}</div>
                      )}

                      <div className={styles.previewContainer}>
                        {comments.files.length > 0 &&
                          comments.files.map((file: FileItem) => (
                            <div key={file.id} className={styles.previewItem}>
                              <div
                                className={styles.deletion}
                                onClick={() =>
                                  fileDelete({
                                    commentId: comments.id,
                                    fileId: file.id,
                                  })
                                }
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.4175 5.4136H4.58254L5.15513 15.593C5.18592 16.1405 5.20647 16.4925 5.24301 16.76C5.2779 17.0154 5.31805 17.1104 5.3448 17.1582C5.44425 17.3357 5.5955 17.4787 5.77835 17.568C5.82754 17.5921 5.92467 17.6268 6.18166 17.6473C6.45076 17.6688 6.80339 17.6695 7.35166 17.6695H12.6484C13.1966 17.6695 13.5493 17.6688 13.8184 17.6473C14.0753 17.6268 14.1725 17.5921 14.2217 17.568C14.4045 17.4787 14.5558 17.3357 14.6552 17.1582C14.682 17.1104 14.7221 17.0154 14.757 16.76C14.7936 16.4925 14.8141 16.1405 14.8449 15.593L15.4175 5.4136ZM16.4839 4.2609L16.4839 4.26084H15.4823H13.3123C13.2231 3.58836 13.1468 3.20131 12.956 2.89585C12.7503 2.5664 12.453 2.304 12.1006 2.14068C11.7006 1.95532 11.2005 1.95532 10.2004 1.95532L9.79853 1.95532C8.79839 1.95532 8.29832 1.95532 7.8983 2.14068C7.54587 2.304 7.24863 2.5664 7.04286 2.89585C6.85208 3.20131 6.77576 3.58836 6.68658 4.26084H4.51769H3.51611L3.51612 4.2609H2.50799C2.18968 4.2609 1.93164 4.51894 1.93164 4.83725C1.93164 5.15556 2.18968 5.4136 2.50799 5.4136H3.58096L4.15671 15.6492C4.21649 16.712 4.24639 17.2435 4.47233 17.6468C4.67123 18.0019 4.97373 18.2879 5.33945 18.4666C5.7549 18.6695 6.28715 18.6695 7.35166 18.6695H12.6484C13.7129 18.6695 14.2451 18.6695 14.6606 18.4666C15.0263 18.2879 15.3288 18.0019 15.5277 17.6468C15.7536 17.2435 15.7835 16.712 15.8433 15.6492L16.4191 5.4136H17.493C17.8113 5.4136 18.0693 5.15556 18.0693 4.83725C18.0693 4.51894 17.8113 4.2609 17.493 4.2609H16.4839ZM12.2271 3.79527C12.2534 3.92421 12.2773 4.0745 12.3032 4.26084H7.69573C7.72156 4.0745 7.74544 3.92421 7.77177 3.79527C7.81997 3.55921 7.86264 3.47104 7.89102 3.42559C7.99391 3.26086 8.14253 3.12966 8.31875 3.048C8.36737 3.02547 8.46015 2.99407 8.70036 2.97552C8.953 2.95601 9.28305 2.95532 9.79853 2.95532L10.2004 2.95532C10.7158 2.95532 11.0459 2.95601 11.2985 2.97552C11.5387 2.99407 11.6315 3.02547 11.6801 3.048C11.8564 3.12966 12.005 3.26086 12.1079 3.42559C12.1362 3.47104 12.1789 3.55921 12.2271 3.79527ZM7.61719 7.14253C7.61719 6.86638 7.39333 6.64253 7.11719 6.64253C6.84104 6.64253 6.61719 6.86638 6.61719 7.14253V15.7877C6.61719 16.0639 6.84104 16.2877 7.11719 16.2877C7.39333 16.2877 7.61719 16.0639 7.61719 15.7877L7.61719 7.14253ZM10.5005 7.14253C10.5005 6.86638 10.2766 6.64253 10.0005 6.64253C9.72435 6.64253 9.50049 6.86638 9.50049 7.14253L9.50049 15.7877C9.50049 16.0639 9.72435 16.2877 10.0005 16.2877C10.2766 16.2877 10.5005 16.0639 10.5005 15.7877V7.14253ZM12.8813 6.64253C13.1575 6.64253 13.3813 6.86638 13.3813 7.14253V15.7877C13.3813 16.0639 13.1575 16.2877 12.8813 16.2877C12.6052 16.2877 12.3813 16.0639 12.3813 15.7877V7.14253C12.3813 6.86638 12.6052 6.64253 12.8813 6.64253Z"
                                    fill="#ABBED1"
                                  />
                                </svg>
                              </div>
                              {allowedExtensions.some((ext) => file.link.endsWith(ext)) ? (
                                <div className={styles.previewImage}>
                                  <Image src={`https://trainee-academy.devds.ru/${file.link}`} alt={`preview-${file.id}`} />
                                </div>
                              ) : (
                                <div className={classes.filesImage}>
                                  <svg
                                    className={styles.task_icon}
                                    width="180"
                                    height="75"
                                    viewBox="0 0 53 67"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M10.057 67H42.943C49.5757 67 53 63.5062 53 56.8279V29.156H29.8626C26.0064 29.156 24.1554 27.3009 24.1554 23.4361V0H10.057C3.45518 0 0 3.49377 0 10.203V56.8279C0 63.5062 3.45518 67 10.057 67ZM30.4488 24.6419H52.6915C52.5064 23.2197 51.4884 21.8902 49.8842 20.2515L33.0093 3.12275C31.4668 1.54592 30.0786 0.494693 28.6595 0.309183V22.8486C28.6903 24.0545 29.2765 24.6419 30.4488 24.6419ZM14.5303 42.8528C13.2037 42.8528 12.2474 41.8943 12.2474 40.6576C12.2474 39.4209 13.2037 38.4624 14.5303 38.4624H38.5623C39.8271 38.4624 40.8143 39.4209 40.8143 40.6576C40.8143 41.8943 39.8271 42.8528 38.5623 42.8528H14.5303ZM14.5303 54.4472C13.2037 54.4472 12.2474 53.4887 12.2474 52.252C12.2474 51.0152 13.2037 50.0568 14.5303 50.0568H38.5623C39.8271 50.0568 40.8143 51.0152 40.8143 52.252C40.8143 53.4887 39.8271 54.4472 38.5623 54.4472H14.5303Z"
                                      fill="#F4F6F8"
                                    />
                                  </svg>
                                </div>
                              )}
                              <div className={styles.ImageInfo}>
                                <a href={`https://trainee-academy.devds.ru/${file.link}`}>{file.original_name}</a>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {isModalOpen && (
            <div className={styles.modaloverlay}>
              <div className={styles.confirmModal}>
                <div>Удалить задачу?</div>
                <div className={styles.buttonModal}>
                  <button onClick={handleConfirmDelete}>Да</button>
                  <button onClick={handleCancelDelete}>Нет</button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.right_panel}>
            <div className={styles.right_panel__header}>
              <span>id: {taskDetail?.data.id}</span>
              <div>
                <svg onClick={open} className={styles.task_icon} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="4" fill="#F4F6F8" />
                  <path
                    d="M23.8131 9.70723L24.4879 9.0357C24.8222 8.69993 24.8345 8.33308 24.5312 8.02219L24.2898 7.77347C23.9865 7.4688 23.6088 7.49989 23.2807 7.82943L22.606 8.49474L23.8131 9.70723ZM16.2299 17.3117L23.2188 10.2917L22.0179 9.09166L15.0289 16.0992L14.4222 17.5666C14.3542 17.7532 14.5461 17.9583 14.7318 17.8899L16.2299 17.3117Z"
                    fill="#ABBED1"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.0646 9.03979H10.5C9.39543 9.03979 8.5 9.93522 8.5 11.0398V21.8125C8.5 22.9171 9.39543 23.8125 10.5 23.8125H21.2727C22.3773 23.8125 23.2727 22.9171 23.2727 21.8125V12.0992L22.2727 13.0992V21.8125C22.2727 22.3648 21.825 22.8125 21.2727 22.8125H10.5C9.94772 22.8125 9.5 22.3648 9.5 21.8125V11.0398C9.5 10.4875 9.94771 10.0398 10.5 10.0398H19.0646L20.0646 9.03979Z"
                    fill="#ABBED1"
                  />
                </svg>
                {isAdmin && (
                  <svg
                    onClick={() => handleDeleteClick(taskDetail?.data.id)}
                    className={styles.task_icon}
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="32" height="32" rx="4" fill="#F4F6F8" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M21.4175 11.4137H10.5825L11.1551 21.5932C11.1859 22.1406 11.2065 22.4926 11.243 22.7601C11.2779 23.0155 11.318 23.1105 11.3448 23.1583C11.4442 23.3358 11.5955 23.4788 11.7784 23.5681C11.8275 23.5922 11.9247 23.6269 12.1817 23.6474C12.4508 23.6689 12.8034 23.6696 13.3517 23.6696H18.6484C19.1966 23.6696 19.5493 23.6689 19.8184 23.6474C20.0753 23.6269 20.1725 23.5922 20.2217 23.5681C20.4045 23.4788 20.5558 23.3358 20.6552 23.1583C20.682 23.1105 20.7221 23.0155 20.757 22.7601C20.7936 22.4926 20.8141 22.1406 20.8449 21.5932L21.4175 11.4137ZM22.4839 10.261L22.4839 10.261H21.4823H19.3123C19.2231 9.58848 19.1468 9.20143 18.956 8.89598C18.7503 8.56652 18.453 8.30412 18.1006 8.14081C17.7006 7.95544 17.2005 7.95544 16.2004 7.95544H15.7985C14.7984 7.95544 14.2983 7.95544 13.8983 8.14081C13.5459 8.30412 13.2486 8.56652 13.0429 8.89598C12.8521 9.20143 12.7758 9.58848 12.6866 10.261H10.5177H9.51611L9.51612 10.261H8.50799C8.18968 10.261 7.93164 10.5191 7.93164 10.8374C7.93164 11.1557 8.18968 11.4137 8.50799 11.4137H9.58096L10.1567 21.6493C10.2165 22.7122 10.2464 23.2436 10.4723 23.647C10.6712 24.0021 10.9737 24.288 11.3394 24.4667C11.7549 24.6696 12.2872 24.6696 13.3517 24.6696H18.6484C19.7129 24.6696 20.2451 24.6696 20.6606 24.4667C21.0263 24.288 21.3288 24.0021 21.5277 23.647C21.7536 23.2436 21.7835 22.7122 21.8433 21.6493L22.4191 11.4137H23.493C23.8113 11.4137 24.0693 11.1557 24.0693 10.8374C24.0693 10.5191 23.8113 10.261 23.493 10.261H22.4839ZM18.2271 9.79539C18.2534 9.92433 18.2773 10.0746 18.3032 10.261H13.6957C13.7216 10.0746 13.7454 9.92433 13.7718 9.79539C13.82 9.55934 13.8626 9.47116 13.891 9.42571C13.9939 9.26098 14.1425 9.12978 14.3187 9.04812C14.3674 9.02559 14.4602 8.9942 14.7004 8.97565C14.953 8.95614 15.283 8.95544 15.7985 8.95544H16.2004C16.7158 8.95544 17.0459 8.95614 17.2985 8.97565C17.5387 8.9942 17.6315 9.0256 17.6801 9.04812C17.8564 9.12978 18.005 9.26098 18.1079 9.42571C18.1362 9.47116 18.1789 9.55934 18.2271 9.79539ZM13.6172 13.1426C13.6172 12.8665 13.3933 12.6426 13.1172 12.6426C12.841 12.6426 12.6172 12.8665 12.6172 13.1426V21.7878C12.6172 22.064 12.841 22.2878 13.1172 22.2878C13.3933 22.2878 13.6172 22.064 13.6172 21.7878L13.6172 13.1426ZM16.5005 13.1426C16.5005 12.8665 16.2766 12.6426 16.0005 12.6426C15.7243 12.6426 15.5005 12.8665 15.5005 13.1426L15.5005 21.7878C15.5005 22.064 15.7243 22.2878 16.0005 22.2878C16.2766 22.2878 16.5005 22.064 16.5005 21.7878V13.1426ZM18.8813 12.6426C19.1575 12.6426 19.3813 12.8665 19.3813 13.1426V21.7878C19.3813 22.064 19.1575 22.2878 18.8813 22.2878C18.6052 22.2878 18.3813 22.064 18.3813 21.7878V13.1426C18.3813 12.8665 18.6052 12.6426 18.8813 12.6426Z"
                      fill="#ABBED1"
                    />
                  </svg>
                )}
                <svg className={styles.task_icon} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="4" fill="#F4F6F8" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.4166 24.7036H22.6642C23.7891 24.7036 24.7041 23.7886 24.7041 22.6637V13.4161C24.7041 12.2912 23.7891 11.3762 22.6642 11.3762H13.4166C12.2917 11.3762 11.3767 12.2912 11.3767 13.4161V22.6637C11.3767 23.7886 12.2917 24.7036 13.4166 24.7036ZM12.7366 13.4161C12.7366 13.0412 13.0417 12.7361 13.4166 12.7361H22.6642C23.0391 12.7361 23.3442 13.0412 23.3442 13.4161V22.6637C23.3442 23.0386 23.0391 23.3437 22.6642 23.3437H13.4166C13.0417 23.3437 12.7366 23.0386 12.7366 22.6637V13.4161ZM9.33678 19.2639H10.0168V20.6238H9.33678C8.21184 20.6238 7.29688 19.7088 7.29688 18.5839V9.3363C7.29688 8.21135 8.21184 7.29639 9.33678 7.29639H18.5844C19.7093 7.29639 20.6243 8.21135 20.6243 9.3363V9.98227H19.2643V9.3363C19.2643 8.96136 18.9593 8.65633 18.5844 8.65633H9.33678C8.96185 8.65633 8.65681 8.96136 8.65681 9.3363V18.5839C8.65681 18.9588 8.96185 19.2639 9.33678 19.2639ZM18.5116 14.5564C18.5116 14.2802 18.2878 14.0564 18.0116 14.0564C17.7355 14.0564 17.5116 14.2802 17.5116 14.5564V17.5378H14.5302C14.254 17.5378 14.0302 17.7617 14.0302 18.0378C14.0302 18.314 14.254 18.5378 14.5302 18.5378H17.5116V21.5193C17.5116 21.7954 17.7355 22.0193 18.0116 22.0193C18.2878 22.0193 18.5116 21.7954 18.5116 21.5193V18.5378H21.4931C21.7692 18.5378 21.9931 18.314 21.9931 18.0378C21.9931 17.7617 21.7692 17.5378 21.4931 17.5378H18.5116V14.5564Z"
                    fill="#ABBED1"
                  />
                </svg>
              </div>
            </div>
            <div className={styles.task_select}>
              <Select selectValue={selectValue} setSelectValue={setSelectValue} taskDetail={taskDetail} />
            </div>

            <div className={styles.taskInfo}>
              {taskDetail?.data.priority?.id && (
                <div className={styles.taskInfo_priority}>
                  <div className={styles.taskInfo_title}>Приоритет</div>
                  <div
                    className={styles.priority_body}
                    style={{
                      background:
                        taskDetail?.data.priority.id === 1
                          ? "#FFF1F0"
                          : taskDetail?.data.priority.id === 2
                          ? "#FFF8EC"
                          : taskDetail?.data.priority.id === 3
                          ? "#F1FBF8"
                          : "",
                      color:
                        taskDetail?.data.priority.id === 1
                          ? "#FF5A4F"
                          : taskDetail?.data.priority.id === 2
                          ? "#FFA826"
                          : taskDetail?.data.priority.id === 3
                          ? "#32C997"
                          : "",
                    }}
                  >
                    •{taskDetail?.data.priority.name}
                  </div>
                </div>
              )}

              {taskDetail?.data.component?.name && (
                <div className={styles.taskInfo_stage}>
                  <div className={styles.taskInfo_title}>Компонент</div>
                  <div className={styles.stage_body} style={{ background: taskDetail?.data.component.id }}>
                    {taskDetail?.data.component.name}
                  </div>
                </div>
              )}

              {taskDetail?.data.task_type && (
                <div className={styles.taskInfo_type}>
                  <div className={styles.taskInfo_title}>Тип</div>
                  <div
                    className={styles.type_body}
                    style={{
                      background:
                        taskDetail?.data.task_type.id === 1
                          ? "#FFF1F0"
                          : taskDetail?.data.task_type.id === 2
                          ? "#EEF5FC"
                          : taskDetail?.data.task_type.id === 3
                          ? "#F1FBF8"
                          : taskDetail?.data.task_type.id === 4
                          ? "#FFF8EC"
                          : taskDetail?.data.task_type.id === 5
                          ? "#F0EEFF"
                          : taskDetail?.data.task_type.id === 6
                          ? "#FFF1EC"
                          : taskDetail?.data.task_type.id === 7
                          ? "#F4F6F8"
                          : taskDetail?.data.task_type.id === 8
                          ? "#F4F6F8"
                          : "",

                      color:
                        taskDetail?.data.task_type.id === 1
                          ? "#FF5A4F"
                          : taskDetail?.data.task_type.id === 2
                          ? "#3787EB"
                          : taskDetail?.data.task_type.id === 3
                          ? "#32C997"
                          : taskDetail?.data.task_type.id === 4
                          ? "#FFA826"
                          : taskDetail?.data.task_type.id === 5
                          ? "#6457FA"
                          : taskDetail?.data.task_type.id === 6
                          ? "#FF6E41"
                          : taskDetail?.data.task_type.id === 7
                          ? "#ABBED1"
                          : taskDetail?.data.task_type.id === 8
                          ? "#ABBED1"
                          : "",
                    }}
                  >
                    {taskDetail?.data.task_type.name}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.estimation}>
              <span>Оценка</span>
              <div className={styles.estimation_time}>
                <span>18ч</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    className={styles.task_icon}
                    d="M8.99662 16C12.8333 16 16 12.8317 16 9C16 5.16828 12.8265 2 8.98985 2C5.15998 2 2 5.16828 2 9C2 12.8317 5.16675 16 8.99662 16ZM8.99662 14.8573C5.89077 14.8573 3.19343 12.1073 3.19343 9C3.19343 5.89265 5.89077 3.22822 8.98985 3.22822C12.0957 3.22822 14.8435 5.89265 14.8502 9C14.857 12.1073 12.1025 14.8573 8.99662 14.8573Z"
                    fill="#787878"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 9.5C10 9.77614 9.77614 10 9.5 10H5.5C5.22386 10 5 9.77614 5 9.5C5 9.22386 5.22386 9 5.5 9H9.5C9.77614 9 10 9.22386 10 9.5Z"
                    fill="#787878"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.5 10C9.22386 10 9 9.77614 9 9.5L9 5.5C9 5.22386 9.22386 5 9.5 5C9.77614 5 10 5.22386 10 5.5L10 9.5C10 9.77614 9.77614 10 9.5 10Z"
                    fill="#787878"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.task_date}>
              <div className={styles.task_date_info}>
                <span>Дата создания</span>
                <div className={styles.task_date_begin_date}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.24967 1.33325C4.36018 1.33325 4.46616 1.37715 4.5443 1.45529C4.62244 1.53343 4.66634 1.63941 4.66634 1.74992V2.16659H11.333V1.74992C11.333 1.63941 11.3769 1.53343 11.455 1.45529C11.5332 1.37715 11.6392 1.33325 11.7497 1.33325C11.8602 1.33325 11.9662 1.37715 12.0443 1.45529C12.1224 1.53343 12.1663 1.63941 12.1663 1.74992V2.16659H12.9997C13.4417 2.16659 13.8656 2.34218 14.1782 2.65474C14.4907 2.9673 14.6663 3.39122 14.6663 3.83325V12.9999C14.6663 13.4419 14.4907 13.8659 14.1782 14.1784C13.8656 14.491 13.4417 14.6666 12.9997 14.6666H2.99967C2.55765 14.6666 2.13372 14.491 1.82116 14.1784C1.5086 13.8659 1.33301 13.4419 1.33301 12.9999V3.83325C1.33301 3.39122 1.5086 2.9673 1.82116 2.65474C2.13372 2.34218 2.55765 2.16659 2.99967 2.16659H3.83301V1.74992C3.83301 1.63941 3.87691 1.53343 3.95505 1.45529C4.03319 1.37715 4.13917 1.33325 4.24967 1.33325V1.33325ZM2.99967 2.99992C2.77866 2.99992 2.5667 3.08772 2.41042 3.244C2.25414 3.40028 2.16634 3.61224 2.16634 3.83325V12.9999C2.16634 13.2209 2.25414 13.4329 2.41042 13.5892C2.5667 13.7455 2.77866 13.8333 2.99967 13.8333H12.9997C13.2207 13.8333 13.4327 13.7455 13.5889 13.5892C13.7452 13.4329 13.833 13.2209 13.833 12.9999V3.83325C13.833 3.61224 13.7452 3.40028 13.5889 3.244C13.4327 3.08772 13.2207 2.99992 12.9997 2.99992H2.99967Z"
                      fill="#3787EB"
                    />
                    <path
                      d="M3.41602 4.66667C3.41602 4.55616 3.45991 4.45018 3.53805 4.37204C3.61619 4.2939 3.72218 4.25 3.83268 4.25H12.166C12.2765 4.25 12.3825 4.2939 12.4606 4.37204C12.5388 4.45018 12.5827 4.55616 12.5827 4.66667V5.5C12.5827 5.61051 12.5388 5.71649 12.4606 5.79463C12.3825 5.87277 12.2765 5.91667 12.166 5.91667H3.83268C3.72218 5.91667 3.61619 5.87277 3.53805 5.79463C3.45991 5.71649 3.41602 5.61051 3.41602 5.5V4.66667Z"
                      fill="#3787EB"
                    />
                  </svg>
                  <span>{format(new Date(taskDetail!.data.created_at), "dd.MM.yyyy")}</span>
                </div>
              </div>
              <div className={styles.task_date_info}>
                <span>Дата начала</span>
                <div className={styles.task_date_begin_date}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.24967 1.33325C4.36018 1.33325 4.46616 1.37715 4.5443 1.45529C4.62244 1.53343 4.66634 1.63941 4.66634 1.74992V2.16659H11.333V1.74992C11.333 1.63941 11.3769 1.53343 11.455 1.45529C11.5332 1.37715 11.6392 1.33325 11.7497 1.33325C11.8602 1.33325 11.9662 1.37715 12.0443 1.45529C12.1224 1.53343 12.1663 1.63941 12.1663 1.74992V2.16659H12.9997C13.4417 2.16659 13.8656 2.34218 14.1782 2.65474C14.4907 2.9673 14.6663 3.39122 14.6663 3.83325V12.9999C14.6663 13.4419 14.4907 13.8659 14.1782 14.1784C13.8656 14.491 13.4417 14.6666 12.9997 14.6666H2.99967C2.55765 14.6666 2.13372 14.491 1.82116 14.1784C1.5086 13.8659 1.33301 13.4419 1.33301 12.9999V3.83325C1.33301 3.39122 1.5086 2.9673 1.82116 2.65474C2.13372 2.34218 2.55765 2.16659 2.99967 2.16659H3.83301V1.74992C3.83301 1.63941 3.87691 1.53343 3.95505 1.45529C4.03319 1.37715 4.13917 1.33325 4.24967 1.33325V1.33325ZM2.99967 2.99992C2.77866 2.99992 2.5667 3.08772 2.41042 3.244C2.25414 3.40028 2.16634 3.61224 2.16634 3.83325V12.9999C2.16634 13.2209 2.25414 13.4329 2.41042 13.5892C2.5667 13.7455 2.77866 13.8333 2.99967 13.8333H12.9997C13.2207 13.8333 13.4327 13.7455 13.5889 13.5892C13.7452 13.4329 13.833 13.2209 13.833 12.9999V3.83325C13.833 3.61224 13.7452 3.40028 13.5889 3.244C13.4327 3.08772 13.2207 2.99992 12.9997 2.99992H2.99967Z"
                      fill="#3787EB"
                    />
                    <path
                      d="M3.41602 4.66667C3.41602 4.55616 3.45991 4.45018 3.53805 4.37204C3.61619 4.2939 3.72218 4.25 3.83268 4.25H12.166C12.2765 4.25 12.3825 4.2939 12.4606 4.37204C12.5388 4.45018 12.5827 4.55616 12.5827 4.66667V5.5C12.5827 5.61051 12.5388 5.71649 12.4606 5.79463C12.3825 5.87277 12.2765 5.91667 12.166 5.91667H3.83268C3.72218 5.91667 3.61619 5.87277 3.53805 5.79463C3.45991 5.71649 3.41602 5.61051 3.41602 5.5V4.66667Z"
                      fill="#3787EB"
                    />
                  </svg>
                  <span>{format(new Date(taskDetail!.data.updated_at), "dd.MM.yyyy")}</span>
                </div>
              </div>
            </div>

            <div className={styles.project_info}>
              <span className={styles.project_stage}>Эпик</span>
              <Link href="#">{taskDetail?.data.project.name}</Link>
            </div>

            {taskDetail?.data.users && taskDetail?.data.users.length > 0 && (
              <div className={styles.executor}>
                <span className={styles.executor_title}>Исполнитель</span>
                {taskDetail?.data.users.map((user, index) => (
                  <div className={styles.executor_detail} key={index}>
                    {user.avatar?.link ? (
                      <Image
                        width={100}
                        height={100}
                        className={styles.avatar}
                        src={`https://trainee-academy.devds.ru/${user.avatar.link}`}
                        alt="avatar"
                      />
                    ) : (
                      <Image width={100} height={100} className={styles.avatar} src={"/img/task/default_user.png"} alt="avatar" />
                    )}
                    <div key={index}>
                      <span>
                        {user.name} {user.surname}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.executor}>
              <span className={styles.executor_title}>Постановщик</span>
              <div className={styles.executor_detail}>
                {taskDetail?.data.created_by.avatar?.link ? (
                  <Image
                    width={100}
                    height={100}
                    className={styles.avatar}
                    src={`https://trainee-academy.devds.ru/${taskDetail?.data.created_by?.avatar?.link}`}
                    alt="avatar"
                  />
                ) : (
                  <Image width={100} height={100} className={styles.avatar} src={"/img/task/default_user.png"} alt="avatar" />
                )}
                <div>
                  <span>
                    {taskDetail?.data.created_by?.name} {taskDetail?.data.created_by?.surname}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.link}>
              {taskDetail?.data.layout_link && (
                <div className={styles.task_link}>
                  <div className={styles.link_name}>Layout Link</div>
                  <div className={styles.link_body}>
                    <a href={taskDetail?.data.layout_link}>
                      {taskDetail?.data.layout_link.length > 55
                        ? `${taskDetail?.data.layout_link.substring(0, 55)}...`
                        : taskDetail?.data.layout_link}
                    </a>
                    <svg className={styles.task_icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="20" height="20" rx="6" fill="#F4F6F8" />
                      <path
                        d="M10.3892 13.75C10.6367 13.75 10.8301 13.657 11.0686 13.4354L14.632 10.1434C14.8075 9.97946 14.875 9.78894 14.875 9.625C14.875 9.45663 14.8075 9.27054 14.632 9.10661L11.0686 5.83673C10.8076 5.59748 10.6367 5.5 10.3982 5.5C10.0382 5.5 9.78178 5.7747 9.78178 6.1203V7.69764H9.6693C6.56478 7.69764 5.125 9.66045 5.125 12.8771C5.125 13.4398 5.36796 13.7323 5.68291 13.7323C5.92138 13.7323 6.14184 13.657 6.31732 13.3335C7.02371 12.0397 8.02705 11.5657 9.6693 11.5657H9.78178V13.1519C9.78178 13.4974 10.0382 13.75 10.3892 13.75ZM10.6771 12.6069C10.6367 12.6069 10.6097 12.5803 10.6097 12.536V10.901C10.6097 10.7991 10.5647 10.7548 10.4612 10.7548H9.88527C7.82458 10.7548 6.51079 11.3973 5.97087 12.505C5.95737 12.5316 5.94387 12.5448 5.92588 12.5448C5.90788 12.5448 5.89438 12.5316 5.89438 12.5005C5.96637 10.3871 6.98771 8.50403 9.88527 8.50403H10.4612C10.5647 8.50403 10.6097 8.45972 10.6097 8.35781V6.683C10.6097 6.64313 10.6367 6.61654 10.6771 6.61654C10.7041 6.61654 10.7311 6.62983 10.7536 6.65199L13.8267 9.54082C13.8582 9.57626 13.8717 9.59842 13.8717 9.625C13.8717 9.65158 13.8627 9.67374 13.8267 9.70918L10.7491 12.5714C10.7266 12.5936 10.6996 12.6069 10.6771 12.6069Z"
                        fill="#ABBED1"
                      />
                    </svg>
                  </div>
                </div>
              )}
              {taskDetail?.data.markup_link && (
                <div className={styles.task_link}>
                  <div className={styles.link_name}>Dev Link</div>
                  <div className={styles.link_body}>
                    <a href={taskDetail?.data.markup_link}>
                      {taskDetail?.data.markup_link.length > 55
                        ? `${taskDetail?.data.markup_link.substring(0, 55)}...`
                        : taskDetail?.data.markup_link}
                    </a>
                    <svg className={styles.task_icon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="20" height="20" rx="6" fill="#F4F6F8" />
                      <path
                        d="M10.3892 13.75C10.6367 13.75 10.8301 13.657 11.0686 13.4354L14.632 10.1434C14.8075 9.97946 14.875 9.78894 14.875 9.625C14.875 9.45663 14.8075 9.27054 14.632 9.10661L11.0686 5.83673C10.8076 5.59748 10.6367 5.5 10.3982 5.5C10.0382 5.5 9.78178 5.7747 9.78178 6.1203V7.69764H9.6693C6.56478 7.69764 5.125 9.66045 5.125 12.8771C5.125 13.4398 5.36796 13.7323 5.68291 13.7323C5.92138 13.7323 6.14184 13.657 6.31732 13.3335C7.02371 12.0397 8.02705 11.5657 9.6693 11.5657H9.78178V13.1519C9.78178 13.4974 10.0382 13.75 10.3892 13.75ZM10.6771 12.6069C10.6367 12.6069 10.6097 12.5803 10.6097 12.536V10.901C10.6097 10.7991 10.5647 10.7548 10.4612 10.7548H9.88527C7.82458 10.7548 6.51079 11.3973 5.97087 12.505C5.95737 12.5316 5.94387 12.5448 5.92588 12.5448C5.90788 12.5448 5.89438 12.5316 5.89438 12.5005C5.96637 10.3871 6.98771 8.50403 9.88527 8.50403H10.4612C10.5647 8.50403 10.6097 8.45972 10.6097 8.35781V6.683C10.6097 6.64313 10.6367 6.61654 10.6771 6.61654C10.7041 6.61654 10.7311 6.62983 10.7536 6.65199L13.8267 9.54082C13.8582 9.57626 13.8717 9.59842 13.8717 9.625C13.8717 9.65158 13.8627 9.67374 13.8267 9.70918L10.7491 12.5714C10.7266 12.5936 10.6996 12.6069 10.6771 12.6069Z"
                        fill="#ABBED1"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
