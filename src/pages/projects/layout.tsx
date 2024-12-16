import React, { useState } from "react";
import SideBar from "@/components/SideBar/SideBar";
import style from "./projects.module.scss";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSideBar = () => setIsOpen((prev) => !prev);
  return (
    <div>
      <div className={style.layout}>
        <SideBar isOpen={isOpen} onClose={toggleSideBar} variant={isOpen ? "open" : "close"} />
        <div className={`${style.layout__content} ${isOpen ? style.layout__content_open : style.layout__content_close}`}>{children}</div>
      </div>
    </div>
  );
}
