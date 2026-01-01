"use client";
import { Button } from "@mui/base";
import { InputAdornment, FormControl, OutlinedInput, FormLabel, FormHelperText } from "@mui/material";
import { useForm } from "react-hook-form";
import MailOutlineIcon from "@mui/icons-material/Mail";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function UserInfo() {
    const user = useUser();

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
        const res = await fetch("/api/my-profile/user-information",{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                name:data.name,
                surname:data.surname,
                phone:data.phone
            })
        });
        const dataJson = await res?.json();
        if(!res.ok){
            console.log("Error",dataJson);
            return;
        }
        console.log("Updated user",dataJson);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full pr-10">
            <div className="w-full flex flex-row gap-6 mb-0">
                <FormControl fullWidth error={!!errors.name}>
                    <FormLabel className="!text-[#131614] !text-sm !font-bold my-2">Name</FormLabel>
                    <OutlinedInput
                        {...register("name", {
                            required: "Name is required",
                            maxLength: {
                                value: maxInputCharacter,
                                message: maxInputErrorMessage,
                            },
                        })}
                        size="small"
                        className="w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1 !text-[#131614] !text-sm"
                    />
                    <FormHelperText>{errors.name?.message}</FormHelperText>
                </FormControl>

                <FormControl fullWidth error={!!errors.surname}>
                    <FormLabel className="!text-[#131614] !text-sm !font-bold my-2">Surname</FormLabel>
                    <OutlinedInput
                        {...register("surname", {
                            required: "Surname is required",
                            maxLength: {
                                value: maxInputCharacter,
                                message: maxInputErrorMessage,
                            },
                        })}
                        size="small"
                        className=" w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1 !text-[#131614] !text-sm"
                    />
                    <FormHelperText>{errors.surname?.message}</FormHelperText>
                </FormControl>
            </div>

            <FormControl fullWidth>
                <FormLabel className="!text-[#131614] !text-sm !font-bold my-2">E-mail</FormLabel>
                <OutlinedInput
                    disabled
                    {...register("email")}
                    startAdornment={
                        <InputAdornment position="start">
                            <MailOutlineIcon sx={{ color: "#9CA3AF" }} />
                        </InputAdornment>
                    }
                    size="small"
                    className="bg-[#F9FAFB] w-full !rounded-xl border-gray-200 p-1 !text-[#131614] !text-sm"
                />
            </FormControl>
            <FormControl fullWidth error={!!errors.phone}>
                <FormLabel className="!text-[#131614] !text-sm !font-bold my-2">Phone</FormLabel>
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
                    className="w-full !rounded-xl border-gray-200 focus:!border-[#8DC8A1] p-1 !text-[#131614] !text-sm"
                />
                <FormHelperText>{errors.phone?.message}</FormHelperText>
            </FormControl>

            <Button type="submit" className="cursor-pointer mt-4 w-auto px-8 h-12 rounded-lg font-bold flex items-center justify-center gap-2 bg-[#8DC8A1] text-white hover:!bg-[#7AB38D]">Save</Button>
        </form>
    );
}
