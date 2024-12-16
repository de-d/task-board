import { useContext } from "react";
import { useRouter } from "next/router";
import { UserContext } from "../../context/UserContext";
import Image from "next/image";
import style from "./SideBar.module.scss";

type SideBarProps = {
  isOpen: boolean;
  onClose: () => void;
  variant: "open" | "close";
};

export default function SideBar({ isOpen, onClose, variant }: SideBarProps) {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const userData = user?.data;

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth");
  };

  return (
    <div className={`${style.sidebar} ${isOpen ? style.sidebar_open : style.sidebar_close}`}>
      {variant === "open" && (
        <>
          <div className={style.sidebar_open__header}>
            <div className={style.sidebar_open__logo}>
              <Image src="/img/sideBar/logo.svg" alt="logo" width={104} height={24} />
            </div>
            <button className={style.sidebar_open__close_btn} onClick={onClose}>
              <Image src="/img/sideBar/close.svg" alt="close" width={16} height={16} />
            </button>
          </div>
          <div className={style.sidebar_open__body}>
            <div className={style.sidebar_open__user}>
              <div className={style.sidebar_open__user_avatar}>
                <Image src="/img/sideBar/test-avatar.png" alt="logo" width={48} height={48} />
              </div>
              <div className={style.sidebar_open__user_info}>
                <div className={style.sidebar_open__user_name}>
                  {userData?.name} {userData?.telegram}
                </div>
                <div className={style.sidebar_open__user_job}>{userData?.position}</div>
              </div>
            </div>
            <button className={style.sidebar_open_logout} onClick={handleLogout}>
              Выйти
            </button>
            <div className={style.sidebar_open__menu}>
              <button className={style.sidebar_open__menu_projects_btn}>
                <Image src="/img/sideBar/projects.svg" alt="logo" width={14} height={14} />
                Проекты
              </button>
            </div>
          </div>
        </>
      )}
      {variant === "close" && (
        <>
          <div className={style.sidebar_close__header}>
            <button className={style.sidebar_close__open_btn} onClick={onClose}>
              <Image src="/img/sideBar/open.svg" alt="close" width={16} height={16} />
            </button>
          </div>
          <div className={style.sidebar_close__body}>
            <div className={style.sidebar_close__menu}>
              <button className={style.sidebar_close__menu_projects_btn}>
                <Image src="/img/sideBar/projects.svg" alt="logo" width={14} height={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
