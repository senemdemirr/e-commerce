"use client";
import { SnackbarProvider } from "notistack";

export default function Providers({ children, maxSnack = 3, vertical = "top", horizontal="center", duration = 3000 }) {
  return (
    <SnackbarProvider
      maxSnack={maxSnack}
      autoHideDuration={duration}
      preventDuplicate
      anchorOrigin={{ vertical: vertical, horizontal: horizontal }}
    >
      {children}
    </SnackbarProvider>
  );
}
