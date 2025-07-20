import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TextField, Button , Snackbar} from "@mui/material";

export default function SignUpForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onSubmit = (data) => {
    setOpen(true);
    setTimeout(() => {
      router.push("/");
    }, 3000);
  }

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
      <TextField 
        size="small"
        className="!my-2"
        label="Email" 
        fullWidth 
        {...register("email", { required: "Email is required" })}
        error={!!errors.email}
        helperText={errors.email ? errors.email.message : ""}
      />
      <TextField 
        size="small"
        className="!my-2"
        label="Password" 
        type="password" 
        fullWidth 
        {...register("password", { required: "Password is required" })}
        error={!!errors.password}
        helperText={errors.password ? errors.password.message : ""}
      />
      <TextField 
        size="small"
        className="!my-2"
        label="Confirm Password" 
        type="password" 
        fullWidth 
        {...register("confirmPassword", { 
          required: "Confirm Password is required",
          validate: (value) => value === password|| "Passwords do not match"
        })}
      />
      <Button type="submit" variant="contained" className="w-full !bg-green-500 !text-gray-100 !my-4">Sign Up</Button>
    </form>
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={() => setOpen(false)}
      message="Sign up successful! Redirecting..."
    />
    </>
  );
}

