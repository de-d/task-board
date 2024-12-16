import { useState, useContext, useEffect } from "react";
import ProjectsLayout from "./layout";
import style from "./projects.module.scss";
import { Breadcrumbs, Anchor, Input, CloseButton, Checkbox, Dialog } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ProjectCard from "../../components/Projects/ProjectCard";
import { fetchProjects } from "../../api/useProjects";
import fetchTaskInfo from "../../api/taskInfo";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../../context/UserContext";

function Projects() {
  const { data: projects } = useQuery({ queryKey: ["projectsData"], queryFn: fetchProjects });
  const [taskId, setTaskId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const { user } = useContext(UserContext);
  const isAdmin = user?.data.is_admin;

  const { data: taskInfo, refetch: refetchTaskInfo } = useQuery({
    queryKey: ["taskInfo", taskId],
    queryFn: () => fetchTaskInfo({ task_id: taskId }),
    enabled: false,
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (taskId && taskId.length > 0) {
        open();
        refetchTaskInfo();
      } else {
        close();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [taskId, refetchTaskInfo, open, close]);

  const handleCloseDialog = () => {
    close();
    setTaskId("");
  };

  const archivedProjects = projects?.data?.filter((project) => project.is_archived === 1) || [];
  const favoriteProjects = (!showArchived && projects?.data?.filter((project) => project.is_favorite && project.is_archived === 0)) || [];
  const otherProjects = (!showArchived && projects?.data?.filter((project) => !project.is_favorite && project.is_archived === 0)) || [];
  const filteredProjects =
    projectName.length >= 3 ? otherProjects.filter((project) => project.name.toLowerCase().includes(projectName.toLowerCase())) : otherProjects;

  return (
    <div className={style.projects}>
      <div className={style.projects__container}>
        <Breadcrumbs
          classNames={{
            separator: style.customSeparator,
            root: style.customBreadcrumbs,
          }}
          separator={<span>/</span>}
        >
          <Anchor href="/" c="dimmed">
            Главная
          </Anchor>
          <Anchor href="/projects">Проекты</Anchor>
        </Breadcrumbs>
        <div className={style.projects__content}>
          <h1 className={style.projects__content_title}>Проекты</h1>
          <div className={style.projects__content_filters}>
            <div className={style.projects__content_filters_name}>
              <p>Название проекта</p>
              <Input
                value={projectName}
                onChange={(event) => setProjectName(event.currentTarget.value)}
                rightSectionPointerEvents="all"
                variant="filled"
                size="sm"
                radius="md"
                placeholder="Введите название проекта"
                rightSection={
                  <CloseButton aria-label="Clear input" onClick={() => handleCloseDialog} style={{ display: projectName ? undefined : "none" }} />
                }
                styles={{
                  input: {
                    height: "40px",
                    paddingLeft: "20px",
                    marginTop: "4px",
                    letterSpacing: "0.5px",
                  },
                }}
              />
            </div>
            <div className={style.projects__content_filters_task_number}>
              <p>Номер задачи</p>
              <Input
                value={taskId}
                onChange={(event) => setTaskId(event.currentTarget.value)}
                rightSectionPointerEvents="all"
                variant="filled"
                size="sm"
                radius="md"
                placeholder="Введите номер задачи"
                rightSection={<CloseButton aria-label="Clear input" onClick={() => setTaskId("")} style={{ display: taskId ? undefined : "none" }} />}
                styles={{
                  input: {
                    height: "40px",
                    paddingLeft: "20px",
                    marginTop: "4px",
                    letterSpacing: "0.5px",
                  },
                }}
              />
            </div>
          </div>
          {isAdmin && (
            <div className={style.projects__content_archive}>
              <Checkbox
                checked={showArchived}
                onChange={(event) => setShowArchived(event.currentTarget.checked)}
                label="Показать архивные проекты"
                size="xs"
                classNames={{
                  input: style.projects__content_archive_checkbox_input,
                  label: style.projects__content_archive_checkbox_label,
                }}
              />
            </div>
          )}

          <Dialog
            opened={opened}
            title="Информация о задаче"
            size="lg"
            className={style.projects__content_dialog}
            styles={{
              root: {
                position: "fixed",
                top: "28%",
                left: "52%",
                width: "auto",
              },
            }}
          >
            <a href={(taskInfo?.data?.id && `/projects/${taskInfo?.data?.project.slug}/${taskInfo?.data?.id}`) || ""}>
              {taskInfo?.data?.name || "Задача не найдена"}
            </a>
          </Dialog>

          {showArchived && archivedProjects.length > 0 && (
            <div className={style.projects__content_projects_container}>
              {archivedProjects.map((project) => (
                <ProjectCard key={project.id} projects={project} is_archived={1} is_admin={isAdmin} />
              ))}
            </div>
          )}

          {!showArchived && favoriteProjects.length > 0 && (
            <div className={style.projects__content_selected}>
              <p className={style.projects__content_selected_title}>Избранные проекты</p>
              <div className={style.projects__content_selected_container}>
                {favoriteProjects.map((project) => (
                  <ProjectCard key={project.id} projects={project} is_admin={isAdmin} />
                ))}
              </div>
            </div>
          )}

          {!showArchived && filteredProjects.length > 0 && (
            <div className={style.projects__content_projects_container}>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} projects={project} is_admin={isAdmin} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Projects.getLayout = (page: React.ReactNode) => <ProjectsLayout>{page}</ProjectsLayout>;

export default Projects;
