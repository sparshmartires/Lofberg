import "./globals.css";
import { Providers } from "./providers";
import localFont from "next/font/local";

const brownStd = localFont({
  src: [
    {
      path: "../fonts/BrownStd-Regular.otf",
      weight: "200",
      style: "normal",
    },
    // {
    //   path: "../fonts/BrownStd-Bold.otf",
    //   weight: "700",
    //   style: "normal",
    // },
    {
      path: "../fonts/BrownStd-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-brownstd",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={brownStd.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
