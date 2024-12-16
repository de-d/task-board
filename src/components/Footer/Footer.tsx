import { Avatar } from "@mantine/core";
import style from "./footer.module.scss";
import Image from "next/image";

export default function Footer() {
  const developersData = [
    {
      avatar: "https://avatars.githubusercontent.com/u/141036722?v=4",
      name: "Владислав Ванюшкин",
      tg: "https://t.me/ManBearPigg",
      github: "https://github.com/Vladislav-096",
    },
    {
      avatar: "https://avatars.githubusercontent.com/u/58844744?v=4",
      name: "Ахмедов Руслан",
      tg: "https://t.me/Aktoetosprosil",
      github: "https://github.com/de-d",
    },
    {
      avatar: "https://avatars.githubusercontent.com/u/124544246?v=4",
      name: "Кошоков Юрий",
      tg: "https://t.me/smenil_nik",
      github: "https://github.com/yurapro02",
    },
  ];

  return (
    <div className={style.footer}>
      <div className={style.footer__content}>
        {developersData.map((developer, index) => (
          <div key={index} className={style.footer__developers}>
            <Avatar radius="xl" size={60} src={developer.avatar} alt="avatar" className={style.footer__developers_avatar} />
            <div className={style.footer__developers_info}>
              <div className={style.footer__developers_name}>{developer.name}</div>
              <div className={style.footer__developers_links}>
                <a href={developer.github} target="_blank" className={style.footer__developers_link}>
                  <Image src="/img/footer/github.png" alt="logo" width={24} height={24} />
                </a>
                <a href={developer.tg} target="_blank" className={style.footer__developers_link}>
                  <Image src="/img/footer/telegram.png" alt="logo" width={24} height={24} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
