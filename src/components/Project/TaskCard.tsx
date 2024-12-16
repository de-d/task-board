import { Task } from "../../types/Task";
import style from "./project.module.scss";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { fetchTaskUsers } from "../../api/taskUsers";
import { UserResponse } from "../../types/Users";
import { fetchTaskType } from "../../api/useTaskType";
import { fetchComponents } from "../../api/components";
import { fetchTaskPriority } from "../../api/taskPriority";
import TaskDetail from "@/components/TaskDetail/TaskDetail";
import {useState} from "react";

interface TaskCardProps {
  task: Task;
  projectSlug: string | string[] | undefined;
}

export default function TaskCard({ task, projectSlug }: TaskCardProps) {
  const { query } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;

  const { data: taskUsers } = useQuery<UserResponse>({
    queryKey: ["taskUsers", slug],
    queryFn: () => fetchTaskUsers({ slug }),
  });
  const { data: types } = useQuery({ queryKey: ["taskType"], queryFn: fetchTaskType });
  const { data: components } = useQuery({ queryKey: ["components"], queryFn: fetchComponents });
  const { data: priorities } = useQuery({ queryKey: ["taskPriority"], queryFn: fetchTaskPriority });

  const getComponentById = (id: number) => components?.data.find((comp) => comp.id === id);
  const getTaskTypeById = (id: number) => types?.data.find((type) => type.id === id);
  const getTaskPriorityById = (id: number) => priorities?.data.find((priority) => priority.id === id);

  const taskComponent = getComponentById(task.component);
  const taskTypes = getTaskTypeById(task.task_type);
  const taskPriority = getTaskPriorityById(task.priority);

  const typeStyles = {
    Задача: { background: "#EEF5FC", text: "#3787EB" },
    Баг: { background: "#FFF1F0", text: "#FF5A4F" },
    Улучшение: { background: "#F1FBF8", text: "#32C997" },
    "Новый функционал": { background: "#FFF8EC", text: "#FFA826" },
    Эпик: { background: "#F0EEFF", text: "#6457FA" },
    Релиз: { background: "#FFF1EC", text: "#FF6E41" },
    Бэклог: { background: "#F4F6F8", text: "#FFFFFF" },
    Гарантия: { background: "#F4F6F8", text: "#FFFFFF" },
  };

  const taskTypeStyle = taskTypes?.name ? typeStyles[taskTypes.name as keyof typeof typeStyles] : undefined;

  const taskTypeBackgroundColor = taskTypeStyle?.background;
  const taskTypeTextColor = taskTypeStyle?.text;

  const priorityStyles = {
    Высокий: { background: "#FFF1F0", text: "#FF5A4F" },
    Средний: { background: "#FFF8EC", text: "#FFA826" },
    Низкий: { background: "#F1FBF8", text: "#32C997" },
  };

  const priorityStyle = taskPriority?.name ? priorityStyles[taskPriority.name as keyof typeof priorityStyles] : undefined;

  const taskBackgroundColor = taskComponent?.color || "#ffffff";
  const priorityBackgroundColor = priorityStyle?.background;
  const priorityTextColor = priorityStyle?.text;

  const [openModal, setOpenModal] = useState(false);

  const test = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpenModal(true);
    const newUrl = `/projects/${projectSlug}/${task.id}`;
    window.history.pushState(null, "", newUrl);
  };

  return (
      <>
    <a onClick={test} href={`/projects/${projectSlug}/${task.id}`} className={style.tasks__card}>
      <div className={style.tasks__card_content}>
        <div className={style.tasks__card_header}>
          <div className={style.tasks__card_header_id}>id: {task.id}</div>
          <div className={style.tasks__card_header_priority} style={{ backgroundColor: priorityBackgroundColor, color: priorityTextColor }}>
            ● {taskPriority?.name}
          </div>
        </div>
        <div className={style.tasks__card_body}>
          <h6 className={style.tasks__card_body_title}>{task.name}</h6>
          {Array.isArray(task.users) && task.users.length > 0 && (
            <div className={style.tasks__card_body_users}>
              {task.users
                .map((userId) => {
                  const user = taskUsers?.data.find((u) => u.id === userId);
                  return user ? `${user.name} ${user.surname}` : null;
                })
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          {task.epic_name && (
            <div className={style.tasks__card_body_epic}>
              Эпик: <span>{task.epic_name}</span>
            </div>
          )}
        </div>
        <div className={style.tasks__card_footer}>
          {taskComponent && (
            <div className={style.tasks__card_footer_component} style={{ backgroundColor: taskBackgroundColor }}>
              {taskComponent.name}
            </div>
          )}
          {taskTypes && (
            <div className={style.tasks__card_footer_type} style={{ backgroundColor: taskTypeBackgroundColor, color: taskTypeTextColor }}>
              {taskTypes.name}
            </div>
          )}
        </div>
      </div>
    </a>

        {openModal && (
            <TaskDetail modal={true} taskId={task.id} setOpenModal={setOpenModal}></TaskDetail>
        )}
    </>
  );
}
