import "./globals.css";
import Providers from "./providers";
import ThemeRegistry from "./ThemeRegistry";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Providers>{children}</Providers>
        </ThemeRegistry>
      </body>
    </html>
  );
}
