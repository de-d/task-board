import { AuthUser, Login } from "@/api/User";
import { useMutation } from "@tanstack/react-query";
import styles from "./index.module.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/api/quiryClient";
import { FormField } from "@/components/FormField.tsx/FormField";
import { ChangeEvent, useContext, useState } from "react";
import { UserContext, userContext } from "@/context/UserContext";
import AuthLoader from "@/components/AuthLoader/AuthLoader";
import { useRouter } from "next/router";
import { tokeLifeTime } from "@/constants/constants";

const FormSchema = z.object({
  email: z
    .string()
    .min(1, "Нужно заполнить")
    .regex(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Укажите корректный адрес электронной почты"
    ),

  password: z.string().min(1, "Нужно заполнить"),
});
type FormTypes = z.infer<typeof FormSchema>;

interface CookieOptions {
  path?: string;
  expires?: Date | string;
  [key: string]: string | boolean | Date | undefined | number;
}

function setCookie(name: string, value: string, options: CookieOptions = {}) {
  options = {
    path: "/",
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie =
    encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (const optionKey in options) {
    updatedCookie += "; " + optionKey;
    const optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

export default function Auth() {
  const router = useRouter();
  const { setUser } = useContext<userContext>(UserContext);
  const [emailText, setEmailText] = useState<string>("");
  const [passwordText, setPasswordText] = useState<string>("");
  const [isDataInvalid, setIsDataInvalid] = useState<boolean>(false);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    clearErrors("email");
    setEmailText(value);
    setIsDataInvalid(false);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    clearErrors("password");
    setPasswordText(value);
    setIsDataInvalid(false);
  };

  const loginMutation = useMutation(
    {
      mutationFn: Login,

      async onSuccess(data) {
        const res = await data.json();
        const user = await AuthUser(res.token);
        setUser(user);
        setCookie("token", res.token, { secure: true, "max-age": tokeLifeTime });
        router.push("/projects");
      },

      async onError(err) {
        setIsDataInvalid(true);
        console.log("Mutatuin login fetching error", err.message);
      },
    },

    queryClient
  );

  const onSubmit = (data: FormTypes) => {
    loginMutation.mutate(data);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<FormTypes>({
    resolver: zodResolver(FormSchema),
  });

  return (
    <section>
      <div className={styles.container}>
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className={styles.heading}>Вход</label>
          <FormField
            label={"Электронная почта"}
            errorMessage={errors.email?.message}
            text={emailText}
            placeholder={"Электронная почта"}
          >
            <input
              className={`${styles.input} ${errors.email ? styles.error : ""}`}
              value={emailText}
              {...register("email")}
              onChange={handleEmailChange}
            />
          </FormField>
          <FormField
            label={"Пароль"}
            errorMessage={errors.password?.message}
            text={passwordText}
            placeholder={"Пароль"}
          >
            <input
              type="password"
              className={`${styles.input} ${
                errors.password ? styles.error : ""
              }`}
              value={passwordText}
              {...register("password")}
              onChange={handlePasswordChange}
            />
          </FormField>
          {isDataInvalid && (
            <p className={styles.validation}>Неверный логин или пароль</p>
          )}

          <div className={styles["button-section"]}>
            {loginMutation.isPending && <AuthLoader />}
            <button type="submit" className={styles.submit}>
              Войти
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
