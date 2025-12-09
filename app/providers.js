"use client";
import { SnackbarProvider } from "notistack";

export default function Providers({ children, maxSnack = 3, vertical = "top", horizontal="center", duration }) {
  return (
    <SnackbarProvider
      maxSnack={maxSnack}
      autoHideDuration={false}
      anchorOrigin={{ vertical: vertical, horizontal: horizontal }}
    >
      {children}
    </SnackbarProvider>
  );
}
