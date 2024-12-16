import style from "./project.module.scss";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../api/quiryClient";
import { useRouter } from "next/router";
import { fetchTaskStage } from "../../api/taskStage";
import { updateProps, updateTaskStage } from "../../api/updateTaskStage";
import { TaskResponse } from "../../types/Task";
import TaskCard from "./TaskCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

export default function KanbanBoard({ projectTask }: { projectTask: TaskResponse | undefined }) {
  const { query } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;

  const { data: taskStage } = useQuery({ queryKey: ["taskStage"], queryFn: fetchTaskStage });

  const { mutate: updateTaskStageMutation } = useMutation({
    mutationFn: async (task: updateProps) => {
      return await updateTaskStage(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTask"] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    const draggedTaskId = Number(draggableId.split("task-")[1]);
    const draggedTask = projectTask?.data.find((task) => task.id === draggedTaskId);

    if (!draggedTask) {
      console.error("Задача не найдена.");
      return;
    }

    const targetStage = destination.droppableId.startsWith("stage-") ? Number(destination.droppableId.split("stage-")[1]) : null;

    if (!targetStage) {
      console.error("Некорректный стейдж.");
      return;
    }

    updateTaskStageMutation({
      id: draggedTask.id,
      name: draggedTask.name,
      task_type_id: draggedTask.task_type,
      component_id: draggedTask.component,
      executors: draggedTask.users,
      priority_id: draggedTask.priority,
      stage_id: targetStage,
    });
  };

  return (
    <div className={style.kanban_board__wrapper}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {taskStage?.data.slice(0, 7).map((stage) => (
          <div className={style.kanban_board__column} key={stage.id}>
            <div className={style.kanban_board__column__header}>
              <div className={style.kanban_board__column__title}>{stage.name}</div>
              <div className={style.kanban_board__column__count}>{projectTask?.data.filter((task) => task.stage === stage.id).length || 0}</div>
            </div>
            <Droppable droppableId={`stage-${stage.id}`} key={`stage-${stage.id}`}>
              {(provided) => (
                <div className={style.kanban_board__column__body} ref={provided.innerRef} {...provided.droppableProps}>
                  {projectTask?.data
                    .filter((task) => task.stage === stage.id)
                    .map((task, index) => (
                      <Draggable draggableId={`task-${task.id}`} index={index} key={`task-${task.id}`}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <TaskCard task={task} projectSlug={slug} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
