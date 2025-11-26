"use client";
import { useUser } from "@auth0/nextjs-auth0";
import { Typography } from "@mui/material";

export default function MyProfile() {
    const { user } = useUser();

    return (
        <>
            {user ? (
                <Typography> Hello {user.name} </Typography>
            ) : (
                <Typography> User not found! Please first log in</Typography>

            )}
        </>
    )
}