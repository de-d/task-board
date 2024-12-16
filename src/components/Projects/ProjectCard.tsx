import Image from "next/image";
import style from "./Projects.module.scss";
import { ProjectsInfo } from "../../types/Projects";
import { toggleFavorite } from "../../api/addFavorite";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../api/quiryClient";

interface ProjectCardProps {
  projects: ProjectsInfo;
  is_admin: boolean | undefined;
  is_archived?: number;
}

export default function ProjectCard({ projects, is_admin, is_archived }: ProjectCardProps) {
  const { mutate: toggleFavoriteMutation } = useMutation({
    mutationFn: async () => {
      await toggleFavorite({ id: projects.id, type: "project" }, projects.is_favorite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectsData"] });
    },
  });

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleFavoriteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavoriteMutation();
  };

  return (
    <a href={`/projects/${projects.slug}`} key={projects.id} className={style.projects__card}>
      <div className={style.projects__card_content}>
        <div className={style.projects__card_header}>
          <Image src="/img/projects/test-logo.png" alt="logo" width={32} height={32} />
          <div className={style.projects__card_header_buttons}>
            {is_admin && (
              <>
                <button className={style.projects__card_header_buttons__delete} onClick={handleButtonClick}>
                  <Image src="/img/projects/delete.svg" alt="delete" width={16} height={16} />
                </button>
                <button className={style.projects__card_header_buttons__edit} onClick={handleButtonClick}>
                  <Image src="/img/projects/edit.svg" alt="edit" width={16} height={16} />
                </button>
              </>
            )}
            <button className={style.projects__card_header_buttons__favorite} onClick={handleFavoriteClick}>
              <Image src={projects.is_favorite ? "/img/projects/favorite.svg" : "/img/projects/fav.svg"} alt="favorite" width={16} height={16} />
            </button>
          </div>
          {is_archived === 1 && <p className={style.projects__card_header_buttons__archive}>Архивный</p>}
        </div>
        <h3 className={style.projects__card_title}>{projects.name}</h3>
        <p className={style.projects__card_count}>{projects.user_count === 0 ? "Сотрудников не найдено" : `${projects.user_count} сотрудников`}</p>
      </div>
    </a>
  );
}
