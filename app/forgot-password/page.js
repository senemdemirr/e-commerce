"use client"
import { TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";
import Link from "next/link";
import { checkUser, updateUser } from "@/app/components/localStorage";
import { useSnackbar } from "notistack";

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { enqueueSnackbar } = useSnackbar();

    const onSubmit = (data) => {
        const user = checkUser(data);
        if(!user){
            enqueueSnackbar("User not found", { variant: "error" });
        }
        else{
            updateUser(data);
            enqueueSnackbar("Password updated successfully", { variant: "success" });
        }
    }
    return (
        <div className="container m-auto p-4 w-100 border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
                <TextField
                    size="small"
                    className="!my-2"
                    label="Email"
                    fullWidth
                    {...register("email",
                        {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Invalid email address"
                            }
                        }
                    )}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ""}
                >
                </TextField>
                <TextField
                    size="small"
                    className="!my-2"
                    label="New Password"
                    fullWidth
                    type="password"
                    helperText={errors.newPassword ? errors.newPassword.message : ""}
                    {...register("newPassword", {
                        required: "New Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters"
                        },
                        maxLength: {
                            value: 10,
                            message: "Password must not exceed 10 characters"
                        }
                    })}
                ></TextField>
                <Button type="submit" variant="contunie" className="w-full !bg-green-500 !text-gray-100 !my-4">Update Password</Button>
            </form>
            <Link href={"/signin"}>
                <Button type="button" variant="contunie" className="w-full !text-gray-500 ">Return before page</Button>
            </Link>
        </div>
    );
}