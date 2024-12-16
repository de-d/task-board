import { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../api/quiryClient";
import "../styles/globals.scss";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import Layout from "./layout";
import { NextPageWithLayout } from "../types/next-page";
import { useEffect, useState } from "react";
import { User, UserContext } from "@/context/UserContext";

function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const updateUser = (newUserData: User | null) => {
    setUser(newUserData);
    if (newUserData) {
      localStorage.setItem("user", JSON.stringify(newUserData));
    } else {
      throw new Error("User data error");
    }
  };

  const getLayout = (Component as NextPageWithLayout).getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>{getLayout(<Component {...pageProps} />)}</MantineProvider>
      </QueryClientProvider>
    </UserContext.Provider>
  );
}

export default App;
