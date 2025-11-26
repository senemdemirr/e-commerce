import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { TextField, Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { getAllUser } from "@/lib/storage/localStorage";

export default function SignInForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  function forgotPassword() {
    router.push("/forgot-password");
  }
  function goHome(){
    router.push("/");
  }

  const onSubmit = (data) => {
    const getUsers = getAllUser();
    if (getUsers.length === 0) return;
    const user = getUsers.find(u => u.email === data.email && u.password === data.password);
    if (!user) {
      enqueueSnackbar("Invalid email or password", { variant: "error" });
    }
    else {
      enqueueSnackbar("Sign in successful", { variant: "success" });
      goHome();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4">
        <TextField
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
        <span onClick={forgotPassword} className="hover:underline cursor-pointer mt-2 float-right text-gray-600">I forgot my password</span>
        <Button type="submit" variant="contained" className="w-full !bg-green-500 !my-4">Sign In</Button>
      </form>

    </>
  );
}
