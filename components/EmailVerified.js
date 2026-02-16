"use client"
import { Typography, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import VerifyEmailAlert from "./VerifiyEmailAlert";

export default function EmailVerified() {
  const { enqueueSnackbar } = useSnackbar();

  function showVerifyEmailMessage() {
    enqueueSnackbar("Please verify your email, otherwise you will not be able to place an order!", {
      content: (key, message) => (
        <VerifyEmailAlert id={key} message={message} />
      ),
    });
  }
  return (
    <div className="container w-full mx-auto flex flex-row border border-gray-300 p-3 rounded mt-4 justify-between align-center">
      <Typography className="text-orange-500">Did you verified your email? Please check your inbox and verify your email.</Typography>
      <div className="flex flex-row align-center">
        <Button href={"/auth/login?prompt=login&returnTo=/my-profile/user-information"} variant="contained" className="button cursor-pointer !no-underline text-center !me-2">YES</Button>
        <Button onClick={showVerifyEmailMessage} variant="contained">No</Button>
      </div>
    </div>
  );
}