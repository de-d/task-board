import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@mantine/core";
import style from "./header.module.scss";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem("user"));
  }, []);

  return (
    <div className={style.header}>
      <Image src="/img/logo.svg" alt="logo" width={158} height={43} priority />
      <div className={style.header__button}>
        {user ? (
          <Button
            onClick={() => {
              localStorage.removeItem("user");
              setUser(null);
              router.push("/auth");
            }}
            className={style.header__button}
          >
            Выйти
          </Button>
        ) : (
          <Button className={style.header__button} onClick={() => router.push("/auth")}>
            Войти
          </Button>
        )}
      </div>
    </div>
  );
}
