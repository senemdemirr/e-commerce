import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { TextField, Button , Snackbar} from "@mui/material";

export default function SignUpForm() {
  const {register, handleSubmit, formState: {errors}} = useForm();
  const [open, setOpen] = useState(false);

  const router = useRouter();

  function forgotPassword() {
    router.push("/forgot-password");
  }
  const onSubmit = (data) => {
    setOpen(true);
    setTimeout(() => {
    router.push("/");
    }, 3000);
  };

  return (
   <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
      <TextField 
        {...register("email", { required: "Email is required" })}
        error={!!errors.email}
        helperText={errors.email ? errors.email.message : ""}
        size="small" 
        label="Email" 
        fullWidth 
        className="!my-2"
      />
      <TextField 
        {...register("password", { required: "Password is required" })}
        error={!!errors.password}
        helperText={errors.password ? errors.password.message : ""}
        size="small" 
        label="Password" 
        type="password" 
        fullWidth 
        className="!my-2"
      />
      <span onClick={forgotPassword} className="hover:underline cursor-pointer mt-2 float-right">I forgot my password</span>
      <Button type="submit" variant="contained" className="w-full bg-green-500">Sign In</Button>
    </form>
    <Snackbar
      open={open}
      autoHideDuration={2000}
      message="Sign in successful! Redirecting..."
    />
    </>
  );
}
