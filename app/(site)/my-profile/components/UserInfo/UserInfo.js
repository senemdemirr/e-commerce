"use client";
import { InputAdornment, FormControl, OutlinedInput, FormLabel, FormHelperText, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import MailOutlineIcon from "@mui/icons-material/Mail";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { useEffect } from "react";
import { useSetUser, useUser } from "@/context/UserContext";
import { useSnackbar } from "notistack";
import { apiFetch } from "@/lib/apiFetch/fetch";


export default function UserInfo() {
    const user = useUser();
    const setUser = useSetUser();
    const { enqueueSnackbar } = useSnackbar();
    const maxInputCharacter = 100;
    const maxInputErrorMessage = "Max 100 characters";
    const phoneRegex = /^\d*$/;
    const phoneErrorMessage = "Only numbers are allowed"
    const phoneMaxLength = 11;

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        try {
            const dataJson = await apiFetch("/api/my-profile/user-information", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    surname: data.surname,
                    phone: data.phone
                })
            });

            if (setUser) {
                const updatedUser = dataJson?.user;
                setUser((prev) => ({
                    ...(prev || {}),
                    ...(updatedUser || {}),
                    name: updatedUser?.name ?? data.name,
                    surname: updatedUser?.surname ?? data.surname,
                    phone: updatedUser?.phone ?? data.phone
                }));
            }

            enqueueSnackbar(dataJson?.message || "Profile information updated successfully.", { variant: "success" });
        } catch (error) {
            enqueueSnackbar(
                error?.data?.message || error?.message || "Failed to update profile information.",
                { variant: "error" }
            );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pr-4 md:pr-10">
            <div className="w-full flex flex-col md:flex-row gap-6 mb-0">
                <FormControl fullWidth error={!!errors.name}>
                    <FormLabel className="!text-text-main !text-sm !font-bold my-2">Name</FormLabel>
                    <OutlinedInput
                        {...register("name", {
                            required: "Name is required",
                            maxLength: {
                                value: maxInputCharacter,
                                message: maxInputErrorMessage,
                            },
                        })}
                        size="small"
                        className="w-full !rounded-xl border-gray-200 focus:!border-primary p-1 !text-text-main !text-sm"
                    />
                    <FormHelperText>{errors.name?.message}</FormHelperText>
                </FormControl>

                <FormControl fullWidth error={!!errors.surname}>
                    <FormLabel className="!text-text-main !text-sm !font-bold my-2">Surname</FormLabel>
                    <OutlinedInput
                        {...register("surname", {
                            required: "Surname is required",
                            maxLength: {
                                value: maxInputCharacter,
                                message: maxInputErrorMessage,
                            },
                        })}
                        size="small"
                        className=" w-full !rounded-xl border-gray-200 focus:!border-primary p-1 !text-text-main !text-sm"
                    />
                    <FormHelperText>{errors.surname?.message}</FormHelperText>
                </FormControl>
            </div>

            <FormControl fullWidth>
                <FormLabel className="!text-text-main !text-sm !font-bold my-2">E-mail</FormLabel>
                <OutlinedInput
                    disabled
                    {...register("email")}
                    startAdornment={
                        <InputAdornment position="start">
                            <MailOutlineIcon sx={{ color: "#9CA3AF" }} />
                        </InputAdornment>
                    }
                    size="small"
                    className="bg-background-light w-full !rounded-xl border-gray-200 p-1 !text-text-main !text-sm"
                />
            </FormControl>
            <FormControl fullWidth error={!!errors.phone}>
                <FormLabel className="!text-text-main !text-sm !font-bold my-2">Phone</FormLabel>
                <OutlinedInput
                    {...register("phone", {
                        pattern: {
                            value: phoneRegex,
                            message: phoneErrorMessage,
                        },
                    })}
                    type="text"
                    inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: phoneMaxLength
                    }}
                    onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <PhoneIphoneIcon className="text-[#9CA3AF]" />
                        </InputAdornment>
                    }
                    size="small"
                    className="w-full !rounded-xl border-gray-200 focus:!border-primary p-1 !text-text-main !text-sm"
                />
                <FormHelperText>{errors.phone?.message}</FormHelperText>
            </FormControl>

            <Button type="submit" className="cursor-pointer !mt-4 w-auto px-8 h-10 rounded-lg font-bold flex items-center justify-center gap-2 !bg-primary !text-white hover:!bg-primary-dark">Save</Button>
        </form>
    );
}
