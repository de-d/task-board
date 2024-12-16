import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "../../public/fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

function Layout({ children }: { children: React.ReactNode }) {
  return <div className={myFont.className}>{children}</div>;
}

export default Layout;
