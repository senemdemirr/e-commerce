import "./globals.css";
import Providers from "./providers";
import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={workSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
