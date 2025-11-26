import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TextField, Button } from "@mui/material";
import { addUser, checkUser } from "./localStorage";
import { useSnackbar } from "notistack";

export default function SignUpForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { enqueueSnackbar } = useSnackbar();

  const password = watch("password");
  //this value for confirm password validation
  const router = useRouter();
  const passwordMinValue = 6;
  const passwordMaxValue = 11;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const onSubmit = (data) => {
    if (checkUser(data)) {
      enqueueSnackbar("User already exists", { variant: "error" });
    }
    else {
      addUser({ email: data.email, password: data.password });
      enqueueSnackbar("Sign up successful", { variant: "success" });
      router.push("/");
    }

  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
        <TextField
          size="small"
          className="!my-2"
          label="Email"
          fullWidth
          {...register("email",
            {
              required: "Email is required",
              pattern: {
                value: emailRegex,
                message: "Invalid email address"
              }
            })}
          error={!!errors.email}
          helperText={errors.email ? errors.email.message : ""}
        />
        <TextField
          size="small"
          className="!my-2"
          label="Password"
          type="password"
          fullWidth
          {...register("password",
            {
              required: "Password is required",
              minLength: {
                value: passwordMinValue,
                message: "Password must be at least 6 characters"
              },
              maxLength: {
                value: passwordMaxValue,
                message: "Password must not exceed 10 characters"
              }
            })}
          error={!!errors.password}
          // error is waiting for boolean value therefore we use "!!" because errors.password is an object actually and we want to convert it to boolean
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
            validate: (value) => value === password || "Passwords do not match"
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword ? errors.confirmPassword.message : ""}
        />
        <Button type="submit" variant="contained" className="w-full !bg-green-500 !text-gray-100 !my-4">Sign Up</Button>
      </form>
    </>
  );
}

